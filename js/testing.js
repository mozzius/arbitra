const network = require('./network.js')

function init() {
    var ip = 'localhost'
    var msg = {
        "header": {
            "type": "pg",
        },
        "body": {
            "advertise": true
        }
    }
    network.sendMsg(msg,ip)
}

exports.init = init