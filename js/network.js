const net = require('net')

var server = net.createServer((socket) => {
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
}

exports.init = init