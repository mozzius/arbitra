const net = require('net')
const hash = require('./hashing.js')
const remote = require('electron').remote
const fs = require('fs')

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
    //store(Jason)
}

function store(data) {
    // put data in file
    var path = remote.app.getPath('appData')+'\\arbitra-client\\sent.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, it sets content to an array
            // it will then continue on and create the file later
            if (err.code === 'ENOENT') {
                content = '[]'
            } else {
                alert('Error opening sent.json')
                throw err
            }
        }
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            jsondata.push(data)
        } catch(e) {
            console.warn(e)
            var jsondata = [data]
        }
        // writes the contents back to the file
        // or makes the file if it doesn't exist yet
        content = JSON.stringify(jsondata)
        fs.writeFile(path,content,'utf-8',(err) => {
            if (err) throw err
        })
    })
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
exports.store = store