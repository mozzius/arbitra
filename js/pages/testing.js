const network = require('../network.js')
const net = require('net')

function init() {
    var msg = {
        "header": {
            "type": "pg",
        },
        "body": {
            "advertise": true
        }
    }
    const address = require('ip').address
    document.getElementById('ip').innerHTML = '<h2>'+address()+'</h2>'
    document.getElementById('send').addEventListener('click',() => {
        network.sendMsg(msg,document.getElementById('sendto').value)
    })

/*
    var server = net.createServer((socket) => {
        socket.write('Echo server\r\n')
        socket.pipe(socket)
    })
    
    server.listen(1337);

    //192.168.1.236

    var client = new net.Socket();
    client.connect(1337, '127.0.0.1',() => {
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

*/
}

exports.init = init