const network = require('../network.js')
const net = require('net')

function init() {

    const address = require('ip').address
    document.getElementById('body').textContent = '<h1>'+address()+'</h1>'

    //var server = net.createServer((socket) => {
    //    socket.write('Echo server\r\n')
    //    socket.pipe(socket)
    //});
    //
    //server.listen(1337);

    var client = new net.Socket();
    client.connect(1337, '192.168.1.236',() => {
        console.log('Connected');
        client.write('Hello, server! Love, Client.');
    });

    client.on('data', function(data) {
        console.log('Received: ' + data);
        client.destroy(); // kill client after server's response
    });

    client.on('close', function() {
        console.log('Connection closed');
    });



    // '85.255.237.191'
    var ip = 'localhost'
    /*var msg = {
        "header": {
            "type": "pg",
        },
        "body": {
            "advertise": true
        }
    }
    network.sendMsg(msg,ip)*/
}

exports.init = init