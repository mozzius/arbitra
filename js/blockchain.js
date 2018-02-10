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
    file.getAll('blockchain',(data) => {
        for (var i = 0, len = arr.length; i < len; i++) {
            // sum the "to" fields and add it to the recipients total

            // deduct the inputs
        }
    })
}

function addBlock(msg) {
    if (msg.header.hash === "") {
        return false
    }
}

exports.get = getBlock