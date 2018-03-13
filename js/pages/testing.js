const network = require('../network.js')

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
}

exports.init = init