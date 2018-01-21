const ecdsa = require('./ecdsa.js')

function init() {
    console.log(ecdsa.randomNum())
}

exports.init = init

/*

function sha256(data) {
    // creates a sha256 hash, updates it with data, and turns it into a hexadecimal string
    var hash = crypto.createHash('sha256').update(data).toString('hex')
    return hash
}

var message = {
    "header": {
        "type": "transaction",
        "hash": "",
        "from": "127.0.0.1"
    },
    "body": {
        "sender": "me",
        "reciever": "also me",
        "amount": 12,
        "time": Date.now()
    }
}

message.header.hash = hashBody(message)

function hashBody(json) {
    var body = JSON.stringify(json.body)
    return sha256(body)
}

function parseMessage(message) {
    try {
        msgjson = JSON.parse(message)
    } catch (e) {
        console.log("Message does not parse as JSON")
        // should send back error to the person who sent it.
        return
    }
    if (msgjson.header.type == "transaction") {
        console.log("It's a transaction")
    } else {
        console.log("Message type unknown")
    }
    var msghash = hashBody(msgjson)
    if (msgjson.header.hash === msghash) {
        console.log("hash matches")
    } else {
        console.log("hash does not match")
    }
}

parseMessage(JSON.stringify(message))

var server = net.createServer(function (socket) {
    console.log("Server created")
    socket.on("data", function (data) {
        console.log("Server received: " + data)
        var hashed = sha256(data)
        socket.write(hashed)
    })
    socket.on("end", socket.end)
})

server.listen(80, "127.0.0.1")

function sendMsg(message, ip) {
    var client = new net.Socket()
    client.connect(80, ip, function () {
        client.write("Hash this string please")
        client.on("data", function (data) {
            console.log("Client received: " + data)
            client.destroy()
        })
        client.on("close", function () {
            console.log("Connection closed")
        })
    })
}*/