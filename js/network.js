const net = require('net')
const hash = require('./hashing.js')
const file = require('./file.js')
const ecdsa = require('./ecdsa.js')

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

    //var Jason = {'b3fa55f98fcfcaf6a15a7c4eb7cdd1b593693d3fef2fb7aec3b6768fd7c6a4ce': ['168.12.143.1','168.991.125.6']}
    //file.store(Jason,'sent')
}

function retrieve(hash) {
    // get file
    var path = remote.app.getPath('appData')+'\\arbitra-client\\sent.json'
    fs.readFile(path+'send.json','utf-8')
    return file[hash]
}


function parseMsg(data,callback) {
    callback(hash.sha256hex(data))
}

function parseMsg2(data,callback) {
    function tx(msg) {
        var body = JSON.stringify(msg.body)
        ecdsa.verifyMsg(body,msg.body.sign,msg.body.from,(result) => {
            if (!result) {
                throw 'signature'
            } else {
                //verifyAmount(msg.body.from)
                throw 'dunno'
            }
        })
    }
    var reply = {
        "header": {
        },
        "body": {
        }
    }
    try {
        var msg = JSON.parse(data)
        if (msg.header.hash === hash.sha256hex(JSON.stringify(msg.body))) {
            if (msg.header.type === 'tx') {
                tx(msg)
            } else if (msg.header.type === 'bk') {
                bk(msg)
            } else if (msg.header.type === 'hr') {
                hr(msg)
            } else if (msg.header.type === 'br') {
                br(msg)
            } else if (msg.header.type === 'pg') {
                pg(msg)
            } else if (msg.header.type === 'nr') {
                nr(msg)
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
        reply.header.hash = hash.sha256hex(JSON.stringify(reply.body))
        reply.header.size = Buffer.byteLength(JSON.stringify(reply.body,'utf8'))
        var replystr = JSON.stringify(reply)
        callback(replystr)
    }
}

function sendMsg(message,ip) {
    var client = new net.Socket()
    client.connect(2018,ip,() => {
        client.write(message)
        client.on('data',(data) => {
            console.log('Client received: '+data)
            client.destroy()
        })
        client.on('close',() => {
            console.log('Connection closed')
        })
    })
}

exports.init = init
exports.sendMsg = sendMsg