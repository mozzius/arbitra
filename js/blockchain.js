const file = require('./file.js')
const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')

function getBlock(hash,callback) {
    file.get(hash,'blockchain',(result) => {
        callback(result)
    })
}

function checkBalance(key,amount,callback) {
    file.get(key,'balances',(balance) => {
        // returns true if the wallet's balance
        // is less than or equal to the amount
        // requested
        callback(balance >= amount)
    })
}

function calcBalances() {
    const miningreward = 50
    file.getAll('blockchain',(data) => {
        var balances = {}
        var block
        // iterate through the blocks
        for (var i = 0, len = data.length; i < len; i++) {
            block = data[i]
            txs = block.transactions
            // iterate through each block to find each transaction
            for (var i = 0, len = txs.length; i < len; i++) {
                var from = tx[i].from
                for (var i = 0, len = tx.length; i < len; i++) {
                    // deduct amounts from the inputs
                    if (balances.hasOwnProperty(from.wallet)) {
                        balances[from.wallet] -= from.amount
                    } else {
                        balances[from.wallet] = -from.amount
                    }
                    // add amount to the recipient's balance
                    if (balances.hasOwnProperty(tx[i].to)) {
                        balances[tx[i].to] += from.amount
                    } else {
                        balances[tx[i].to] = from.amount
                    }
                }
            }
            // mining rewards
            if (balances.hasOwnProperty(block.miner)) {
                balances[block.to] += miningreward
            } else {
                balances[block.to] = miningreward
            }
        }
        var data = JSON.stringify(balances)
        file.storeAll('balances',data)
    })
}

function updateBalances(block) {
    const miningreward = 50
    txs = block.body.transactions
    file.getAll('balances',(balances) => {
        // set the most recent block hash
        balance['latest'] = block.header.hash
        for (var i = 0, len = txs.length; i < len; i++) {
            var from = tx[i].from
            for (var i = 0, len = tx.length; i < len; i++) {
                // deduct amounts from the inputs
                if (balances.hasOwnProperty(from.wallet)) {
                    balances[from.wallet] -= from.amount
                } else {
                    balances[from.wallet] = -from.amount
                }
                // add amount to the recipient's balance
                if (balances.hasOwnProperty(tx[i].to)) {
                    balances[tx[i].to] += from.amount
                } else {
                    balances[tx[i].to] = from.amount
                }
            }
        }
        // mining rewards
        if (balances.hasOwnProperty(block.miner)) {
            balances[block.to] += miningreward
        } else {
            balances[block.to] = miningreward
        }
        file.storeAll('balances',balances)
    })
}

function addBlock(msg) {
    // doublecheck the hash
    if (msg.header.hash == hash.sha256hex(JSON.stringify(msg.body))) {
        file.store(msg.header.hash,msg.body,'blockchain')
    }
    updateBalances(msg)
}



exports.get = getBlock
exports.checkBalance = checkBalance
exports.calcBalances = calcBalances
exports.updateBalances = updateBalances
exports.addBlock = addBlock