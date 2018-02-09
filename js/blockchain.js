const file = require('./file.js')
const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')

function getBlock(hash,callback) {
    file.get(hash,'blockchain',(result) => {
        callback(result)
    })
}

function addBlock(msg) {
    if (msg.header.hash === "") {
        return false
    }
}

exports.get = getBlock