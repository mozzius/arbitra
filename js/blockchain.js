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
    //////////////////////////
    // TODO: MINING REWARDS //
    //////////////////////////
    file.getAll('blockchain',(data) => {
        var balances = {}
        var block
        for (var i = 0, len = data.length; i < len; i++) {
            block = data[i]
            tx = block.transactions
            // iterate through each transacton
            for (var i = 0, len = tx.from.length; i < len; i++) {
                // deduct amounts from the inputs
                if (balances.hasOwnProperty(tx.from[i].wallet)) {
                    balances[tx.from[i].wallet] -= tx.from[i].amount
                } else {
                    balances[tx.from[i].wallet] = -tx.from[i].amount
                }
                // add amount to the recipient's balance
                if (balances.hasOwnProperty(block.to)) {
                    balances[block.to] += tx.from[i].amount
                } else {
                    balances[block.to] = tx.from[i].amount
                }
            }
        }
    })
}

function updateBalances(block) {
    //////////////////////////
    // TODO: MINING REWARDS //
    //////////////////////////
    tx = block.body.transactions
    file.getAll('balances',(balances) => {
        // set the most recent block hash
        balance['latest'] = block.header.hash
        // iterate through each transacton
        for (var i = 0, len = tx.from.length; i < len; i++) {
            // deduct amounts from the inputs
            if (balances.hasOwnProperty(tx.from[i].wallet)) {
                balances[tx.from[i].wallet] -= tx.from[i].amount
            } else {
                balances[tx.from[i].wallet] = -tx.from[i].amount
            }
            // add amount to the recipient's balance
            if (balances.hasOwnProperty(block.to)) {
                balances[block.to] += tx.from[i].amount
            } else {
                balances[block.to] = tx.from[i].amount
            }
        }
        file.storeAll('balances',balances)
    })
}

function addBlock(msg) {
    if (msg.header.hash === "") {
        return false
    }
}

exports.get = getBlock
exports.checkBalance = checkBalance
exports.calcBalances = calcBalances
exports.updateBalances = updateBalances