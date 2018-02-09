const net = require('net')
const hash = require('./hashing.js')
const file = require('./file.js')
const verify = require('./verify.js')

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
    
    server.listen(2018)
    console.log('Server started')
}

function parseMsg(data,callback) {
    callback(hash.sha256hex(data))
}

function parseMsg2(data,callback) {
    var reply
    try {
        var msg = JSON.parse(data)
        if (msg.header.hash === hash.sha256hex(JSON.stringify(msg.body)+msg.header.time)) {
            if (msg.header.type === 'tx') {
                reply = verify.tx(msg)
            } else if (msg.header.type === 'bk') {
                reply = verify.bk(msg)
            } else if (msg.header.type === 'hr') {
                reply = verify.hr(msg)
            } else if (msg.header.type === 'br') {
                reply = verify.br(msg)
            } else if (msg.header.type === 'pg') {
                reply = verify.pg(msg)
            } else if (msg.header.type === 'nr') {
                reply = verify.nr(msg)
            } else {
                throw 'type'
            }
        } else {
            throw 'hash'
        }
    } catch(e) {
        console.warn(e)
        reply.header.type = 'er'
        if (e.name === 'SyntaxError') {
            reply.body.err = 'parse'
        } else {
            reply.body.err = e
        }
    } finally {
        reply.header.time = Date.now()
        reply.header.hash = hash.sha256hex(JSON.stringify(reply.body)+reply.header.time)
        reply.header.size = Buffer.byteLength(JSON.stringify(reply.body,'utf8'))
        var replystr = JSON.stringify(reply)
        callback(replystr)
    }
}

function sendMsg(message,ip) {
    var client = new net.Socket()
    client.connect(2018,ip,() => {
        console.log('Connected to: '+ip)
        client.write(message)
        client.on('data',(data) => {
            console.log('Client received: '+data)
            client.destroy()
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

exports.init = init
exports.sendMsg = sendMsg