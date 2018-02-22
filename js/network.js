const net = require('net')
const hash = require('./hashing.js')
const file = require('./file.js')
const parse = require('./parse.js')
const version = require('../package.json').version
const blockchain = require('./blockchain.js')

const port = 80

function init() {
    // creates a server that will receive all the messages
    // when it receives data, it will pass it to parseMsg
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
                socket.write(reply)
                socket.end()
            })
        })
    })
    
    // server listens on this port
    // should be 2018
    server.listen(port,'0.0.0.0',() => {  
        console.log('server listening to ',server.address().address)
    })

    // start trying to connect to other nodes
    var connections = 0
    document.getElementById('connections').textContent = connections
    file.getAll('connections',(data) => {
        var connections = JSON.parse(data)
        var ping = {
            "header": {
                "type": "pg"
            },
            "body": {}
        }
        file.get('advertise','network-settings',(data) => {
            if (data === null) {
                var advertise = true
            } else {
                var advertise = JSON.parse(data)
            }
            ping.body['advertise'] = advertise
            connections.forEach((node) => {
                sendMsg(ping,node.ip,(type) => {
                    if (type === 'ping') {
                        connections++
                        document.getElementById('connections').textContent = connections
                    }
                })
            })
            if (connections === 0) {
                console.warn('no connections found!')
                const backup = 'http://samuelnewman.uk/arbitra/nodes.json'
                //////////////////////////////
                //           TODO           // 
                // Connect to backup server //
                //////////////////////////////
            }
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

    var client = new net.Socket()
    client.connect(port,ip,() => {
        console.log('Connected to: '+ip)
        client.write(sendMe)
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

function parseMsgTemp(data,callback) {
    // temporary function
    callback(hash.sha256hex(data))
}

function parseMsg(data,ip,callback) {
    // parse incoming messages and crafts a reply
    // by calling parse functions
    var reply
    try {
        var msg = JSON.parse(data)
        if (msg.header.hash === hash.sha256hex(JSON.stringify(msg.body))) {
            if (msg.header.type === 'tx') {
                reply = parse.tx(msg)
                // send on to other nodes
                // if it's not valid, an error will have
                // already been thrown
                sendToAll(msg)
                file.append('sent',msg.header.hash,() => {})
            } else if (msg.header.type === 'bk') {
                reply = parse.bk(msg)
                // send on to other nodes
                sendToAll(msg)
                // add to blockchain
                blockchain.addBlock(msg)
            } else if (msg.header.type === 'hr') {
                reply = parse.hr(msg)
            } else if (msg.header.type === 'br') {
                reply = parse.br(msg)
            } else if (msg.header.type === 'pg') {
                reply = parse.pg(msg,ip)
            } else if (msg.header.type === 'nr') {
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
                type = 'ping'
            } else if (msg.header.type === 'ok') {
                console.info('message recieved ok')
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
        // callbacks are to calculate the number of connections
        typeof callback === 'function' && callback(type)
    }
}

function sendToAll(msg) {
    file.getAll('connections',(data) => {
        // doesn't do anything if there's no connections
        if (data !== null) {
            nodes = JSON.parse(data)
            // go through connections and send a message to each
            nodes.forEach((node) => {
                sendMsg(msg,node.ip,() => {
                    file.append('sent',msg.header.hash)
                })
            })
        }
    })
}

exports.init = init
exports.sendMsg = sendMsg
exports.sendToAll = sendToAll