const net = require('net')
const hash = require('./hashing.js')
const file = require('./file.js')

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
    var reply
    function tx (data) {
        return 'hello'
    }
    try {
        var msg = JSON.parse(data)
        if (msg.header.type === 'tx') {
            reply = tx(msg)
        } else if (msg.header.type === 'bk') {
            reply = bk(msg)
        } else if (msg.header.type === 'hr') {
            reply = hr(msg)
        } else if (msg.header.type === 'br') {
            reply = br(msg)
        } else if (msg.header.type === 'pg') {
            reply = pg(msg)
        } else if (msg.header.type === 'nr') {
            reply = nr(msg)
        }
    } catch(e) {
        if (e.name === 'SyntaxError') {
            console.warn(e)
            reply = {
                "header": {
                    "type": "er",
                },
                "body": {
                    "error": e
                }
            }
            reply.time = Date.now()
            reply.hash = hash.sha256hex(JSON.stringify(reply.body))
        } else {
            throw e
        }
    } finally {
        var replystr = JSON.stringify(reply)
        callback(replystr)
        return
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