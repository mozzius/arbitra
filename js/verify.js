const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')

function tx(msg) {
    var result = {
        header: {},
        body: {}
    }
    var body = JSON.stringify(msg.body)
    if (msg.header.hash === hash.sha256hex(body)) { {
        if (!result) {
            throw 'signature'
        } else {
            //need to check that they have enough au
            //blockchain.verifyAmount(msg.body.from,msg.body.amount)
            var from = msg.body.transactions
            var len = from.length
            var input
            for (var i; i < len; ++i) {
                input = from[i]

            }
        }
    })
}

function bl(msg) {
    if (msg.header.hash === hash.sha256hex(JSON.stringify(msg.body))) {
        var txlist = msg.body.transactions
        var len = txlist.length
        var tx
        for (var i; i < len; ++i) {
            tx = txlist[i]
        }
    } else {
        throw 'hash'
    }
}


exports.tx = tx