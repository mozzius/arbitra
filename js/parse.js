const network = require('./network.js')
const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')
const blockchain = require('./blockchain.js')
const file = require('./file.js')

function transaction(tx) {
    var from = tx.from
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
                    if (balanceCheck) {
                        repeats.push(input)
                    } else {
                        throw 'amount'
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
    var blockhash = hash.sha256hex(JSON.stringify(body))
    // verify all the transactions
    var pass = true
    for (var i = 0; i < 5; i++) {
        if (blockhash.charAt(i) !== 'a') {
            pass = false
        }
    }
    if (body.difficulty === 5 && pass) {
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
    } else {
        throw 'difficulty'
    }
}

function chain(chain) {
    try {
        for(var hash in chain) {
            block(chain[hash])
        }
    } catch(e) {
        console.warn('Received chain invalid')
        throw e
    }
}

function tx(msg,callback) {
    var reply = {
        "header": {
            "type": "ok"
        },
        "body": {}
    }
    // verify that it works
    transaction(msg.body)
    // add to txpool
    file.append(tx.body)
    // send to contacts
    sendToAll(msg)
    // reply
    callback(reply)
}

function bk(msg,callback) {
    var reply = {
        "header": {
            "type": "ok"
        },
        "body": {}
    }
    block(msg.body)
    // if nothing has been thrown, add to local blockchain
    blockchain.addBlock(msg)
    callback(reply)
}

function hr(msg,callback) {
    file.getAll('blockchain',(data) => {
        if (data === null) {
            throw 'notfound'
        } else {
            blockchain.getTopBlock(JSON.parse(data),(top) => {
                var reply = {
                    "header": {
                        "type": "bh"
                    },
                    "body": {
                        "hash": top
                    }
                }
                callback(top)
            })
        }
    })
}

function br(msg,callback) {
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
            callback(reply)
        } else {
            throw 'notfound'
        }
    })
}

function nr(msg,callback) {
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
            callback(reply)
        }
    })
}

function pg(msg,ip,callback) {
    pgreply(msg,ip)
    // remember to complain about scope issues
    file.get('advertise','network-settings',(data) => {
        if (data === 'true' || data === 'false') {
            var advertise = data
        } else {
            var advertise = 'true'
        }
        var reply = {
            "header": {
                "type": "pg"
            },
            "body": {
                "advertise": advertise
            }
        }
        callback(reply)
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
        // stores it if not and if it is not our ip
        const ourip = require('ip').address
        if (!repeat && ip !== ourip()) {
            file.append('connections',store,() => {
                console.log('Connection added: '+ip)
                var current = document.getElementById('connections').textContent
                document.getElementById('connections').textContent = parseInt(current) + 1
            })
        }
    },'[]') // if it fails it returns an empty array
}

function bh(msg,callback) {
    file.getAll('blockchain',(data) => {
        var mainchain = JSON.parse(data)
        blockchain.getTopBlock(mainchain,(top) => {
            if (top !== msg.body.hash && !Object.keys(mainchain).includes(msg.body.hash)) {
                // if the received top hash is not equal to the one on disk
                // and it's not in the blockchain, then send out a chain request
                var chainrequest = {
                    "header": {
                        "type": "cr"
                    },
                    "body": {
                        "hash": msg.body.hash
                    }
                }
                network.sendToAll(chainrequest)
            }
        })
    },'{}')
}

function bh(msg) {
    file.getAll('blockchain',(data) => {
        var mainchain =  JSON.parse('data')
        blockchain.getTopBlock(mainchain,(result) => {
            if (result !== msg.body.hash) {
                var chainrequest = {
                    "header": {
                        "type": "cr"
                    },
                    "body": {
                        "hash": msg.body.hash
                    }
                }
                network.sendToAll(chainrequest)
            }
        })
    },'{}')
}

function nr(msg,callback) {
    file.getAll('connections',(data) => {
        var connections = JSON.parse(data)
        var reply = {
            "header": {
                "type": "nd"
            },
            "body": {
                "nodes": connections
            }
        }
        callback(reply)
    })
}

function nd(msg) {
    // some nodes we can connect to
    file.get('advertise','network-settings',(data) => {
        if (data === 'true' || data === 'false') {
            var advertise = data
        } else {
            var advertise = 'true'
        }
        var ping = {
            "header": {
                "type": "pg"
            },
            "body": {
                "advertise": advertise
            }
        }
        file.getAll('connections',(data) => {
            // this must get connection data, as otherwise it wouldn't have received this message
            var connections = JSON.parse(data)
            msg.body.nodes.forEach((node) => {
                var send = true
                // if we are already connected to the node don't send
                connections.forEach((connection) => {
                    if (node.ip === connection) {
                        send = false
                    }
                })
                // otherwise send a ping
                if (send) {
                    network.sendMsg(ping,node.ip)
                }
            })
        })
    })
}

function cr(msg,callback) {
    if (msg.body.hasOwnProperty('hash')) {
        blockchain.get(msg.body.hash,(block) => {
            if (block === null) {
                throw 'notfound'
            } else {
                blockchain.mainChain((chain) => {
                    var reply = {
                        "header": {
                            "type": "cn"
                        },
                        "body": {
                            "chain": chain
                        }
                    }
                    callback(reply)
                })
            }
        })
    }
}

function cn(msg) {
    msg.body.chain.forEach((testblock) => {
        blockchain.addBlock(testblock)
    })
}

function er(msg) {
    file.append('error-logs',msg)
}


exports.tx = tx
exports.bk = bk
exports.hr = hr
exports.nr = nr
exports.pg = pg
exports.pgreply = pgreply
exports.nd = nd
exports.cr = er
exports.er = er
exports.cn = cn
exports.block = block
exports.transaction = transaction