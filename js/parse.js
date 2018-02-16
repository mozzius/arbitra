const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')
const blockchain = require('./blockchain.js')
const file = require('./file.js')

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
        },
        "body": {}
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

function pg(msg,ip) {
    pgreply(msg,ip)
    var reply = {
        "header": {
            "type": "pg"
        },
        "body": {}
    }
    file.get('advertise','network-settings',(data) => {
        if (data === null) {
            var advertise = true
        } else {
            var advertise = JSON.parse(data)
        }
        reply.body['advertise'] = advertise
    })
    return reply
}

function pgreply(msg,ip) {
    var store = {}
    store["ip"] = ip
    store["advertise"] = msg.body.advertise
    file.getAll('connections',(data) => {
        var repeat = false
        // checks to see if the ip is already in connections.json
        if (data !== null) {
            nodes = JSON.parse(data)
            nodes.forEach((node) => {
                if (node.ip === ip) {
                    repeat = true
                }
            })
        }
        if (!repeat) {
            file.append('connections',store,() => {
                console.log('Connection added: '+ip)
            })
        }
    })
}

exports.tx = tx
exports.hr = hr
exports.br = br
exports.nr = nr
exports.pg = pg