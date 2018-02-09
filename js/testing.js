const network = require('./network.js')

function init() {
    console.log('testing.js loaded')
    var ip = '8.8.8.8'
    network.sendMsg('hello world',ip)
}

exports.init = init