const file = require('./file.js')
const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')
const parse = require('./parse.js')

function getBlock(hash,callback) {
    file.get(hash,'blockchain',(result) => {
        callback(result)
    })
}

function checkBalance(key,amount,callback) {
    file.get(key,'balances',(balance) => {
        // returns true if the wallet's balance is
        // less than or equal to the amount requested
        callback(balance >= amount)
    })
}

function calcBalances() {
    const miningreward = 5000000
    // mainChain gets the longest chain, as only the blocks under the highest
    // actually count
    mainChain((chain) => {
        var balances = {}
        // iterate through the blocks
        for (var key in chain) {
            var block = chain[key]
            transactions = block.transactions
            // iterate through each block to find each transaction
            transactions.forEach((transaction) => {
                // iterate through the inputs
                transaction.from.forEach((from) => {
                    // deduct amounts from the inputs
                    if (balances.hasOwnProperty(from.wallet)) {
                        balances[from.wallet] -= from.amount
                    } else {
                        balances[from.wallet] = -from.amount
                    }
                    // add amount to the recipient's balance
                    if (balances.hasOwnProperty(transaction.to)) {
                        balances[transaction.to] += from.amount
                    } else {
                        balances[transaction.to] = from.amount
                    }
                })
            })
            // mining rewards
            if (balances.hasOwnProperty(block.miner)) {
                balances[block.miner] += miningreward
            } else {
                balances[block.miner] = miningreward
            }
        }
        // calculating the balance in the corner
        file.getAll('wallets',(data) => {
            var wallets = JSON.parse(data)
            var newWallets = []
            var balance = 0
            wallets.forEach((wallet) => {
                if (balances.hasOwnProperty(wallet.public)) {
                    amount = balances[wallet.public]
                } else {
                    amount = 0
                }
                // add the au in the wallet to the total balance
                balance += amount
                // and set the balance in the wallet
                newWallets.push({
                    "name": wallet.name,
                    "public": wallet.public,
                    "private": wallet.private,
                    "amount": amount
                })
            })
            // change microau to au and set the textcontent of the top left thing
            document.getElementById('current-balance').textContent = balance / 100000
            // save balances
            file.storeAll('wallets',newWallets)
            file.storeAll('balances',balances)
        },'[]')
    })
}

function updateBalances(block) {
    const miningreward = 5000000
    txs = block.body.transactions
    file.getAll('balances',(balances) => {
        // set the most recent block hash
        balances['latest'] = block.header.hash
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
        // calculating the balance in the corner
        file.getAll('wallets',(data) => {
            var wallets = JSON.parse(data)
            var newWallets = []
            var balance = 0
            wallets.forEach((wallet) => {
                if (balances.hasOwnProperty(block.miner)) {
                    amount = balances[wallet.public]
                }
                // add the au in the wallet to the total balance
                balance += amount
                // and set the balance in the wallet
                newWallets.push({
                    "name": wallet.name,
                    "public": wallet.public,
                    "private": wallet.private,
                    "amount": amount
                })
            })
            // change microau to au and set the textcontent of the top left thing
            document.getElementById('current-balance').textContent = balance / 100000
            // save balances
            file.storeAll('balances',balances)
            file.storeAll('wallets',newWallets)
        },'[]')
    },'{}')
}

function addBlock(msg) {
    try {
        parse.block(msg.body)
        // if it failed the test, an error will have been thrown
        file.store(hash.sha256hex(JSON.stringify(msg.body)),msg.body,'blockchain')
        file.getAll('txpool',(data) => {
            var txpool = JSON.parse(data)
            msg.body.transactions.forEach((tx) => {
                // remove pending transactions if they're in the received block
                txpool.splice(txpool.indexOf(tx),1)
            })
            file.storeAll('txpool',txpool)
            calcBalances()
        },'[]')
    } catch(e) {
        console.warn('Block failed:',JSON.stringify(msg))
        console.warn(e)
    }
}

function mainChain(callback) {
    var mainchain = {}
    file.getAll('blockchain',(data) => {
        var fullchain = JSON.parse(data)
        if (fullchain === {}) {
            callback(data)
        } else {
            getTopBlock(fullchain,(top) => {
                mainchain[top] = fullchain[top]
                var current = top
                var parent
                while (fullchain[current].parent !== '0000000000000000000000000000000000000000000000000000000000000000') {
                    parent = fullchain[current].parent
                    mainchain[parent] = fullchain[parent]
                    current = parent
                }
                callback(mainchain)
            })
        }
    },'[]')
}

function getTopBlock(fullchain,callback) {
    // get the first key in the object
    // doesn't matter if it's best it just needs to be valid
    for (var best in fullchain) {
        // this is the fastest way of getting the first key
        // even if it's kind of messy looking
        // Object.keys(fullchain)[0] puts the whole object into memory
        break
    }
    // iterates through the fullchain
    for (var key in fullchain) {
        // larger height the better
        if (fullchain[key].height > fullchain[best].height) {
            var candidate = true
            // iterate down the chain to see if you can reach the bottom
            // if the parent is undefined at any point it is not part of the main chain
            // run out of time for a more efficient method
            var current = key
            while (fullchain[current].parent !== '0000000000000000000000000000000000000000000000000000000000000000') {
                parent = fullchain[current].parent
                if (typeof fullchain[parent] !== 'undefined') {
                    current = parent
                } else {
                    candiate = false
                }
            }
            if (candidate) {
                best = key
            }
        // otherwise, if they're the same pick the oldest one
        } else if (fullchain[key].height === fullchain[best].height) {
            if (fullchain[key].time < fullchain[best].time) {
                // see other comments
                var candidate = true
                var current = key
                while (fullchain[current].parent !== '0000000000000000000000000000000000000000000000000000000000000000') {
                    parent = fullchain[current].parent
                    if (typeof fullchain[parent] !== 'undefined') {
                        current = parent
                    } else {
                        candiate = false
                    }
                }
                if (candidate) {
                    best = key
                }
            }
        }
    }
    callback(best)
}

exports.get = getBlock
exports.checkBalance = checkBalance
exports.calcBalances = calcBalances
exports.updateBalances = updateBalances
exports.addBlock = addBlock
exports.getTopBlock = getTopBlock
exports.mainChain = mainChain