const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')
const blockchain = require('./blockchain.js')

function transaction(tx) {
    var from = tx.transactions
    var len = from.length
    var input
    var concat
    // goes through the transaction inputs
    // and checks that they're all valid
    for (var i; i < len; ++i) {
        input = from[i]
        concat = input.amount+tx.to+tx.time
        console.log(concat)
        ecdsa.verifyMsg(concat,input.signature,input.person,(result) => {
            if (result) {
                blockchain.checkBalance(input.person,input.amount,(balanceCheck) => {
                    if (!balanceCheck) {
                        throw 'amount'
                    }
                })
            } else {
                throw 'signature'
            }
        })
    }
}

function tx(msg) {
    var reply = {
        "header": {
            "type": "ok"
        },
        "body": {}
    }
    transaction(msg.body)
    return reply
}

function bk(msg) {
    var reply = {
        "header": {
            "type": "ok"
        }
    }
    var txlist = msg.body.transactions
    var len = txlist.length
    var tx
    // verify all the transactions
    for (var i; i < len; ++i) {
        tx = txlist[i]
        try {
            transaction(tx)
        } catch(e) {
            if (e === 'signature' || e === 'amount') {
                throw 'transaction'
            }
        }
    }
    // if nothing has been thrown, set reply to ok msg
    return reply
}

function hr(msg) {

}

function br(msg) {
    file.get('blockchain',msg.body.hash,(result) => {
        if (result !== null) {
            var reply = {
                "header": {
                    "type": "bl"
                },
                "body": {
                    "hash": msg.body.hash,
                    "body": result
                }
            }
            return reply
        } else {
            throw 'notfound'
        }
    })
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