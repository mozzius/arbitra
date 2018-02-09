const file = require('./file.js')
const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')

function getBlock(hash,callback) {
    file.get(hash,'blockchain',(result) => {
        callback(result)
    })
}

function verify(block) {
    if (msg.header.hash === hash.sha256hex(JSON.stringify(msg.body))) {
        var txlist = msg.body.transactions
        var len = txlist.length
        var tx
        for (var i; i < len; ++i) {
            tx = txlist[i]
            ecdsa.verifyMsg()
        }
    }
}

function addBlock(msg) {
    if (msg.header.hash === "") {
        return false
    }
}

exports.get = getBlock