const net = require('net')
const hash = require('./hashing.js')
const remote = require('electron').remote
const fs = require('fs')

var Jason = [{
    'b3fa55f98fcfcaf6a15a7c4eb7cdd1b593693d3fef2fb7aec3b6768fd7c6a4ce': ['168.12.143.1','168.991.125.6'],
    '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824': ['localhost']
}]

function init() {
    // creates a server that will receive all the messages
    // when it receives data, it will pass it to parseMsg
    // and reply with whatever it sends back
    var server = net.createServer((socket) => {
        console.log('Server started')
        socket.on('data',(data) => {
            console.log('Server received: '+data)
            parseMsg(data,(reply) => {
                socket.write(reply)
            })
        })
        socket.on('end',socket.end)
    })
    
    server.listen(2018)
}

function store(data) {
    // put data in file
    var path = remote.app.getPath('appData')
    file = fs.readFile(path+'send.json')    
}

function retrieve(hash) {
    // get file
    var path = remote.app.getPath('appData')
    file = fs.readFile(path+'send.json')
    return file[hash]
}

function parseMsg(data,callback) {
    callback(hash.sha256hex(data))
}

function parseMsg2(data,callback) {
    try{
        if (data.type === 'tx') {
            console.log('transaction')
        }
    } catch(e) {
        throw e
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