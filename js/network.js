const net = require('net')
const hash = require('./hashing.js')
const file = require('./file.js')
const parse = require('./parse.js')
const version = require('../package.json').version
const blockchain = require('./blockchain.js')

const port = 2018

function init() {
    // creates a server that will receive all the messages
    // when it receives data, it will pass it to parseMsg()
    // and reply with whatever it sends back
    var server = net.createServer((socket) => {
        var ip = socket.remoteAddress
        socket.setEncoding('utf8')
        // when it receives data, send to parseMsg()
        socket.on('data',(data) => {
            console.log('Connected: '+ip)
            console.log('Server received: '+data)
            parseMsg(data,ip,(msg) => {
                msg.body['time'] = Date.now()
                msg.header['version'] = version
                msg.header['size'] = Buffer.byteLength(JSON.stringify(msg.body))
                msg.header['hash'] = hash.sha256hex(JSON.stringify(msg.body))
                var reply = JSON.stringify(msg)
                console.info('Sending message to '+ip+': '+reply)
                socket.write(reply)
                file.append('sent',msg.header.hash)
                socket.end()
            })
        })
    })
    
    // server listens on this port
    // should be 2018
    server.listen(port,'0.0.0.0',() => {  
        console.log('Server listening on port',port)
    })

    // wipe connections
    // this will be populated with connections that succeed
    file.storeAll('connections',[])
    // inital connection attempt
    var connections = connect(0,false)

    // this is a loop that maintains connections and
    // sends top hash requests to make sure the client is up to date
    // it goes on forever, every 30 seconds
    setInterval(() => {
        console.log('Interval')
        var connections = document.getElementById('connections').textContent
        // first check that we have enough connections
        file.get('target-connections','network-settings',(target) => {
            // if the current number of of connections is less than the minimum
            // as defined by user settings, connect
            if (connections < target) {
                connections = connect(connections)
                // if it's still not enough, send node requests
                if (connections < target) {
                    var nr = {
                        "header": {
                            "type": "nr"
                        },
                        "body": {}
                    }
                    sendToAll(nr)
                }
            }
            if (connections === 0) {
                document.getElementById('nonodes').classList.remove('hidden')
            } else {
                document.getElementById('nonodes').classList.add('hidden')
                // check that the chain is up to date
                var hr = {
                    "header": {
                        "type": "hr"
                    },
                    "body": {}
                }
                sendToAll(hr)
            }
            // finally, save current connections to recent connections
            file.getAll('connections',(data) => {
                if (connections !== null) {
                    file.storeAll('recent-connections',JSON.parse(data))
                }
            })
        },5) // if it fails to open the file it sets target to five
    },30000)
}

function connect(connectCount,backup=true) {
    console.error(backup)
    // try to connect to other nodes
    document.getElementById('connections').textContent = connectCount
    file.getAll('recent-connections',(data) => {
        var connections = JSON.parse(data)
        file.get('advertise','network-settings',(data) => {
            if (data === 'true' || data === 'false') {
                var advertise = data
            } else {
                var advertise = 'true'
            }
            var ping = {
                "header": {
                    "type": "pg"
                },
                "body": {
                    "advertise": advertise
                }
            }
            connections.forEach((node) => {
                sendMsg(ping,node.ip,(type) => {
                    if (type === 'pg') {
                        connectCount++
                    }
                })
            })
            if (connectCount === 0 && backup) {
                console.warn('no connections found!')
                document.getElementById('nonodes').classList.remove('hidden')
                console.warn('Connecting to backup server')
                // wavecalcs.com is friend's server, and should be online for the purposes of this project
                sendMsg(ping,'wavecalcs.com')
            } else {
                document.getElementById('nonodes').classList.add('hidden')
            }
            document.getElementById('connections').textContent = connectCount
            return connectCount
        })
    })
}

function sendMsg(msg,ip,callback) {
    if (msg.header.type !== 'bl') {
        // don't want to affect the body of a block
        // as it will throw off the hash
        msg.body['time'] = Date.now()
    }
    msg.header['version'] = version
    msg.header['size'] = Buffer.byteLength(JSON.stringify(msg.body))
    msg.header['hash'] = hash.sha256hex(JSON.stringify(msg.body))
    var sendMe = JSON.stringify(msg)
    console.info('Sending message to '+ip+': '+sendMe)
    var client = new net.Socket()
    client.connect(port,ip,() => {
        console.log('Connected to: '+ip)
        client.write(sendMe)
        file.append('sent',msg.header.hash)
        client.on('data',(data) => {
            console.log('Client received: '+data)
            parseReply(data,ip,(type) => {
                client.destroy()
            })
        })
        client.on('close',() => {
            console.log('Connection closed')
        })
        client.on('timeout',() => {
            console.warn('Client timed out')
            client.destroy()
        })
    })
}

function parseMsg(data,ip,callback) {
    // parse incoming messages and crafts a reply
    // by calling parse functions
    var reply
    try {
        var msg = JSON.parse(data)
        if (msg.header.hash === hash.sha256hex(JSON.stringify(msg.body))) {
            if (msg.header.type === 'tx') {
                // transaction
                reply = parse.tx(msg)
            } else if (msg.header.type === 'bk') {
                // block
                reply = parse.bk(msg)
            } else if (msg.header.type === 'hr') {
                // hash request
                reply = parse.hr(msg)
            } else if (msg.header.type === 'cr') {
                // chain request
                reply = parse.cr(msg)
            } else if (msg.header.type === 'pg') {
                // ping
                reply = parse.pg(msg,ip)
            } else if (msg.header.type === 'nr') {
                // node request
                reply = parse.nr(msg)
            } else {
                throw 'type'
            }
        } else {
            throw 'hash'
        }
    } catch(e) {
        console.warn(e)
        reply = {
            'header': {
                'type': 'er'
            },
            'body': {}
        }
        if (e.name === 'SyntaxError') {
            reply.body['error'] = 'parse'
        } else {
            reply.body['error'] = e
        }
        file.append('error-logs',reply)
    } finally {
        // replies with something, even if its an error msg
        callback(reply)
    }
}

function parseReply(data,ip,callback) {
    // parse incoming replies
    // by calling parse functions
    var type
    try {
        var msg = JSON.parse(data)
        if (msg.header.hash == hash.sha256hex(JSON.stringify(msg.body))) {
            if (msg.header.type === 'bl') {
                parse.bl(msg)
            } else if (msg.header.type === 'bh') {
                parse.bh(msg)
            } else if (msg.header.type === 'nr') {
                parse.nr(msg)
            } else if (msg.header.type === 'nd') {
                parse.nd(msg)
            } else if (msg.header.type === 'pg') {
                parse.pgreply(msg,ip)
            } else if (msg.header.type === 'ok') {
                console.info('message recieved ok')
            } else if (msg.hedaer.type === 'er') {
                console.warn('We recieved an error')
                parse.er(msg)
            } else {
                throw 'type'
            }
        } else {
            throw 'hash'
        }
    } catch(e) {
        console.warn('Reply error: '+e)
    } finally {
        // call the callback, if it exists
        // callback is to calculate the number of connections
        typeof callback === 'function' && callback(msg.header.type)
    }
}

function sendToAll(msg) {
    file.getAll('connections',(data) => {
        // doesn't do anything if there's no connections
        if (data !== null || data === '' || data === []) {
            nodes = JSON.parse(data)
            // go through connections and send a message to each
            nodes.forEach((node) => {
                sendMsg(msg,node.ip)
            })
        }
    })
}

exports.init = init
exports.sendMsg = sendMsg
exports.sendToAll = sendToAll
exports.connect = connect