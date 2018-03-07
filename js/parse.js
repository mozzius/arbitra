const network = require('./network.js')
const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')
const blockchain = require('./blockchain.js')
const file = require('./file.js')

function transaction(tx) {
    var from = tx.transactions
    var len = from.length
    var input
    var concat
    var repeats = []
    // goes through the transaction inputs
    // and checks that they're all valid
    for (var i; i < len; ++i) {
        input = from[i]
        if (repeats.contains(input)) {
            // wallets in a transaction must be unique
            throw 'parse'
        }
        // this is the "message" for the ecdsa function
        concat = input.amount+tx.to+tx.time
        console.log(concat)
        ecdsa.verifyMsg(concat,input.signature,input.person,(result) => {
            if (result) {
                blockchain.checkBalance(input.person,input.amount,(balanceCheck) => {
                    if (!balanceCheck) {
                        throw 'amount'
                    } else {
                        repeaets.push(input)
                    }
                })
            } else {
                throw 'signature'
            }
        })
    }
}

function block(body) {
    var txlist = body.transactions
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
}

function chain(chain) {
    try {
        for(var hash in chain) {
            block(chain[hash])
        }
    } catch(e) {
        console.warn('Received chain invalid')
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
    block(msg.body)
    // if nothing has been thrown, add to local blockchain
    return reply
}

function hr(msg) {
    var reply = {
        "header": {
            "type": "bh"
        },
        "body": {}
    }
    file.getAll('blockchain',(data) => {
        if (data === null) {
            throw 'notfound'
        } else {
            blockchain.getTopBlock(JSON.parse(data),(top) => {
                return top
            })
        }
    })
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
    var reply = {
        "header": {
            "type": "nd"
        },
        "body": {
            "nodes": []
        }
    }
    file.getAll('connections',(data) => {
        if (data === null) {
            throw 'notfound'
        } else {
            var connections = JSON.parse(connections)
            connections.forEach((connection) => {
                if (connection.advertise == "true") {
                    reply.body.nodes.push(connection.ip)
                }
            })
            return reply
        }
    })
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
        if (data === 'true' || data === 'false') {
            var advertise = data
        } else {
            var advertise = 'true'
        }
        reply.body['advertise'] = advertise
        return reply
    })
}

function pgreply(msg,ip) {
    var store = {}
    store['ip'] = ip
    store['advertise'] = msg.body.advertise
    file.getAll('connections',(data) => {
        var repeat = false
        // checks to see if the ip is already in connections.json
        nodes = JSON.parse(data)
        nodes.forEach((node) => {
            if (node.ip === ip) {
                repeat = true
            }
        })
        // stores it if not
        if (!repeat) {
            file.append('connections',store,() => {
                console.log('Connection added: '+ip)
            })
        }
    },'[]') // if it fails it returns an empty array
}

function bl(msg) {
    blockchain.addBlock(msg)
}

function bh(msg) {
    file.getAll('blockchain',(data) => {
        var mainchain = JSON.parse(data)
        blockchain.getTopBlock(mainchain,(top) => {
            if (top !== msg.body.hash && !mainchain.includes(msg.body.hash)) {
                // if the received top hash is not equal to the one on disk
                // and it's not in the blockchain, then send out the block request
                var blockrequest = {
                    "header": {
                        "type": "br"
                    },
                    "body": {
                        "hash": msg.body.hash
                    }
                }
                network.sendToAll(blockrequest)
            }
        })
    })
}

function nr(msg) {
    
}

function nd(msg) {

}

function bh(msg) {
    
}


exports.tx = tx
exports.hr = hr
exports.br = br
exports.nr = nr
exports.pg = pg
exports.pgreply = pgreply
exports.block = block