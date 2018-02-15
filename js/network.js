const net = require('net')
const hash = require('./hashing.js')
const file = require('./file.js')
const parse = require('./parse.js')
const version = require('../package.json').version

function init() {
    // creates a server that will receive all the messages
    // when it receives data, it will pass it to parseMsg
    // and reply with whatever it sends back
    var server = net.createServer((socket) => {
        socket.on('data',(data) => {
            console.log('Server received: '+data)
            parseMsg(data,(reply) => {
                socket.write(reply)
            })
        })
        socket.on('end',socket.end)
    })
    
    // server listens on this port
    // should be 2018
    server.listen(2018)
    console.log('Server started')

    // start trying to connect to other nodes
    file.getAll('connections',(data) => {
        var connections = JSON.parse(data)
        var ping = {
            "header": {
                "type": "pg"
            },
            "body": {}
        }
        file.get('advertise','network-settings',(data) => {
            var advertise = JSON.parse(data)
            ping.body['advertise'] = advertise
            connections.forEach((node) => {
                sendMsg(ping,node.ip,() => {
                    
                })
            })
        })
    })
}

function sendMsg(msg,ip,callback) {
    msg.body['time'] = Date.now()
    msg.header['version'] = version
    msg.header['hash'] = hash.sha256hex(JSON.stringify(msg.body))
    msg.header['size'] = Buffer.byteLength(JSON.stringify(msg.body))
    var sendMe = JSON.stringify(msg)
    var client = new net.Socket()
    client.connect(2018,ip,() => {
        console.log('Connected to: '+ip)
        client.write(msg)
        client.on('data',(data) => {
            console.log('Client received: '+data)
            parseReply(data,() => {
                // call the callback, if it exists
                typeof callback === 'function' && callback()
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

function parseMsg(data,callback) {
    // temporary function
    callback(hash.sha256hex(data))
}

function parseMsg2(data,callback) {
    // parse incoming messages and crafts a reply
    // by calling parse functions
    var reply
    try {
        var msg = JSON.parse(data)
        if (msg.header.hash === hash.sha256hex(JSON.stringify(msg.body))) {
            if (msg.header.type === 'tx') {
                reply = parse.tx(msg)
                // send on to other nodes
                sendOn(msg)
                file.append('sent',msg.header.hash,() => {})
            } else if (msg.header.type === 'bk') {
                reply = parse.bk(msg)
                // send on to other nodes
                sendOn(msg)
                file.append('sent',msg.header.hash,() => {})
            } else if (msg.header.type === 'hr') {
                reply = parse.hr(msg)
            } else if (msg.header.type === 'br') {
                reply = parse.br(msg)
            } else if (msg.header.type === 'pg') {
                reply = parse.pg(msg)
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
        // replies with something, even if its an error
        console.log('Reply: '+JSON.stringify(reply))
        callback(replystr)
    }
}

function parseReply(data) {
    // parse incoming messages and crafts a reply
    // by calling parse functions
    var reply
    try {
        var msg = JSON.parse(data)
        if (msg.header.hash === hash.sha256hex(JSON.stringify(msg.body))) {
            if (msg.header.type === 'bl') {
                reply = parse.bl(msg)
            } else if (msg.header.type === 'bh') {
                reply = parse.bh(msg)
            } else if (msg.header.type === 'nr') {
                reply = parse.nr(msg)
            } else if (msg.header.type === 'nd') {
                reply = parse.nd(msg)
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
        callback(replystr)
    }
}

exports.init = init
exports.sendMsg = sendMsg