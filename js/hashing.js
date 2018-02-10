const crypto = require('crypto')
const bigInt = require('big-integer')

function sha256(data) {
    // creates a sha256 hash, updates it with data, and turns it into a bigint
    var hash = crypto.createHash('sha256').update(data).digest('hex')
    return bigInt(hash,16)
}

function sha256hex(data) {
    return sha256(data).toString(16)
}

exports.sha256 = sha256
exports.sha256hex = sha256hex