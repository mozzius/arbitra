const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')

function tx(msg) {
    var result = {
        header: {},
        body: {}
    }
    var body = JSON.stringify(msg.body)
    var from = msg.body.transactions
    var len = from.length
    var input
    var concat
    // goes through the transaction inputs
    // and checks that they're all valid
    for (var i; i < len; ++i) {
        input = from[i]
        concat = input.amount+body.to+msg.header.time
        ecdsa.verifyMsg(concat,input.signature,input.from,(result) => {
            if (result) {
                // check amounts here
            } else {
                throw 'signature'
            }
        })
    }
}

function bk(msg) {
    var txlist = msg.body.transactions
    var len = txlist.length
    var tx
    for (var i; i < len; ++i) {
        tx = txlist[i]
    }
}

function hr(msg) {

}

function br(msg) {
    file.get('blockchain',msg)
}

function nr(msg) {
    
}

function pg(msg) {
    
}

exports.tx = tx
exports.hr = hr
exports.br = br
exports.nr = nr
exports.pg = pg