# Arbitra

An A-level Computer Science project by Samuel Newman

## Technical Solution - The Blockchain and application

### Blockchain

We now need to tackle the blockchain, which is a critical part of the project. It it basically a cool name for a linked list. We need to create the following functions to process it:

- Getting a block
- Check how many au a wallet has
- Adding a block
- Getting the top block in the chain
- Getting all the blocks between the top block and the genesis block

To aid with the first function, I decided to structure the blockchain as an object literal rather than an array, with the hash of the block as the key. In this way, we don't need to store the header, and to get a block we simply use `blockchain[hash_of_block]`.

I creates all these functions in a file called `blockchain.js`. The blockchain itself is stored in `blockchain.json`, in `%APPDATA%`. First of all, I created `getBlock()`.

#### getBlock

This simply uses `file.get()` to get the block

```javascript
const file = require('./file.js')

function getBlock(hash,callback) {
    file.get(hash,'blockchain',callback)
}
```

#### Balances

Since we don't want to have to trawl through the blockchain to check every input of every transaction, I decided to store just the balances in a new file called `balances.json`. This file is again a dictionary-style object, with the wallet as the key storing the amount assigned to them. This is much more efficient for getting the amount assigned to a block. We will only need to generate this file when the blockchain changes. To generate it, I created a function called `calcBalances()`

##### calcBalances

`calcBalances()` needs to iterate through all the inputs in each transaction in each block in the blockchain. I decided to use `forEach()` to do this, as although it is technically slower, it is much clearer to see what is happening. In each input, it sees if `balances`, the object that stores the balances, contains the wallet referred to in the input, using `hasOwnProperty()` which returns `true` if the property has a value assigned to it. If that's case, it deducts the amount defined in the input, and increases the recipient's balance by the same amount.

```javascript
function calcBalances() {
    file.getAll((data) => {
        var chain = JSON.parse(data)
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
        }
        file.storeAll('balances',balances)
    })
}
```

However, we also need to accound for the mining reward. I set this as a `const` at the top of the function. Since it is in microau, it is set to 50000000. For each block, we add the mining reward to the miner's wallet.

```javascript
function calcBalances() {
    const miningreward = 50000000
    file.getAll((data) => {
        var chain = JSON.parse(data)
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
        file.storeAll('balances',balances)
    })
}
```

However, we have a problem. In it's current state, it calculates the balance of *every* block rather than those under the top block, which is incorrect. What we need is a function which gets the top block then returns a subsection of the blockchain containing only blocks under the top block. This function will be called `mainChain()`, and will be defined later. For now, we will pretend that it exists (as I made these functions at the same time).

```javascript
function calcBalances() {
    const miningreward = 50000000
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
        file.storeAll('balances',balances)
    })
}
```

##### checkBalance

We need a function which checks the balance of a wallet to see if it greater than or equal to some amount. This function is called `checkBalance()`.

```javascript
function checkBalance(key,amount,callback) {
    file.get(key,'balances',(balance) => {
        // returns true if the wallet's balance is
        // less than or equal to the amount requested
        callback(balance >= amount)
    },0)
}
```

### Pages

Before we start creating the pages, I decided to restructure the application slightly. I moved all the Javascript files relating to any of the pages - `overview.js`, `wallets.js` etc - to a subfolder in `js`, `pages`. I also moved the `changePage()` function from `renderer.js` to it's own file, then imported it back into `renderer.js`. I also modified it to account for the new location of the Javascript files.

```javascript
const remote = require('electron').remote
const fs = require('fs')

function changePage(name) {
    var path = 'pages/' + name + '.html'
    fs.readFile(path,'utf-8',(err, data) => {
        if (err) {
            alert('An error ocurred reading the file: '+name)
            console.warn('An error ocurred reading the file: '+err.message)
            return
        }
        document.getElementById('body').innerHTML = data
        try {
            const pageJS = require('./pages/'+name+'.js')
            pageJS.init()
        } catch(e) {
            console.error(e)
        }
    })
}

exports.changePage = changePage
```

I imported it back into `renderer.js` like so:

```javascript
const changePage = require('./js/changepage.js').changePage
```

Now that the Javascript files for pages are a folder deeper than the other files, we have to import these other files like so:

```javascript
const file = require('../file.js')
```

#### Transactions

##### Wallets

The Wallets page will contain a list of all the wallets that the user has stored. The user can interact with each one. The options they will have will be:

- Create transaction from wallet
- View private key
- Copy key

First, we need to store the wallets. Each wallet has four attributes:

- User-defined name
- Public key
- Private key
- Amount

The first three are static. However, the money in the wallet is dependent on the blockchain, which we do not want to have to trawl through every time to find the value of each wallet. Therefore, I decided to update the wallets every time `calcBalances()` is called. It iterates through `wallets.json`, which is where the wallets will be found, and finds the total amount for each wallet. While doing this, I realised that we could take this opportunity to calculate the balance counter in the corner of the application. For each wallet that is iterated through, the amount calculated for each wallets is added to a counter, and the total in the corner is set to this amount.

```javascript
function calcBalances() {
    const miningreward = 50000000
    // mainChain gets the longest chain, as only the blocks under the highest
    // actually count
    mainChain((chain) => {
        var balances = {}
        // iterate through the blocks
        // removed in this example as nothing has changed
        for (var key in chain) {...}
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
```

##### Send

##### View recent

#### Blockchain

##### Mining

##### Viewing

#### Settings

