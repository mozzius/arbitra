const network = require('./network.js')

function init() {
    var ip = '85.255.237.191'
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