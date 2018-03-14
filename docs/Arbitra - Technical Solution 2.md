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

Finally, the new wallet's values are stored in `wallets.json`.

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

Finally, we can start displaying the wallets in `wallets.html`. The HTML structure of the page is like so:

```html
<h1>Transactions</h1>

<h2>Wallets</h2>

<div class="highlight-box">
    <h3>My wallets</h3>
    <button id="create">Create new wallet</button>
    <div class="list" id="wallet-list"></div>
</div>
```

The button with an id of `create` needs to link to the page where wallets are generated, so we will need to import `changePage()` into `wallets.js`. `#wallet-list` is the html object where we will be adding the wallets. `.list` is a CSS class like so:

```css
.list {
    overflow-y: auto;
    overflow-x: hidden;
}
```

This means that if the contents of `#wallet-list` is too wide it will simply be hidden, but if it too tall it will create a scroll bar.

Elements within `.list` will have class `.list-item`, which has the following properties:

```css
.list-item {
    overflow-x: auto;
    width: calc(100% - 12px);
    background-color: white;
    margin: 5px 0;
    padding: 5px;
    border: 1px solid #333;
    border-radius: 5px;
    white-space: nowrap;
}
```

In `wallets.js`, we first import `file` and `changePage()`, and add an event listener to change the page to `wallets-create` when the button is clicked. This will be the page where we can create a wallet.

```javascript
const file = require('../file.js')
const changePage = require('../changepage').changePage

function init() {
    document.getElementById('create').addEventListener('click',() => {
        changePage('wallets-create')
    })
}

exports.init = init
```

We now need to populate `#wallet-list`. This is done by getting the wallets and iterating through them, appending a new `div` for each wallet, which is done by calling `document.createElement()` and using `appendChild()` to place it inside of the `#wallet-list` element. I also called `blockchain.calcBalances()` to ensure the wallets are up to date.

```javascript
const file = require('../file.js')
const changePage = require('../changepage').changePage
const blockchain = require('../blockchain.js')

function init() {
    document.getElementById('create').addEventListener('click',() => {
        changePage('wallets-create')
    })
    blockchain.calcBalances()
    file.getAll('wallets',(data) => {
        wallets = JSON.parse(data)
        var walletList = document.getElementById('wallet-list')
        var listItem
        wallets.forEach((wallet) => {
            listItem = document.createElement('div')
            walletList.appendChild(listItem)
        })
    },'[]')
}

exports.init = init
```

We now need to add the class `.list-item` to the child element, and add the data. The first is achieved by calling `listItem.classList.add('list-item')`. The second part however, using the method above of creating new elements using Javascript and appending them one by one, is cumbersome with the large number of sub-elements we need. Therefore, I decided instead to create a string and use `innerHTML`, which takes a string instead.

```javascript
        wallets.forEach((wallet) => {
            listItem = document.createElement('div')
            listItem.classList.add('list-item')
            listItem.innerHTML = '<p><b>Name:</b> '+wallet.name+'</p><p><b>Public:</b> '+wallet.public+'</p><p><b>Amount:</b> <span class="money">'+wallet.amount/1000000+'</span></p>'
            walletList.appendChild(listItem)
        })
```

Notice how `wallet.amount` is divided by 1000000 - this is because `wallet.amount` is in $\mu$au, and we need to convert it to au.

Now, to see if it works, we need to make a way to create wallets.

##### Creating Wallets

I created a new page called `create-wallets`, which was linked to earlier. The HTML for `create-wallets` is like so:

```html
<h1>Transactions</h1>

<h2>Create a Wallet</h2>

<p>Wallet Name:</p>
<input type="text"  id="name" placeholder="My Wallet"><br>
<p>Public Key:</p>
<div class="list-item" id="public"></div>
<p>Private Key (DO NOT SHARE!):</p>
<div class="list-item" id="private"></div>
<button id="create">Create Wallet</button>
```

It turns out we can reuse the `.list-item` class as a kind of highlight box. What `wallets-create.js` will need to do is populate `#public` and `#private` with the appropriate key, then add these and the name to a wallet when `#create` is clicked.

To do this, we need to use the `ecdsa` module, as well as `file` and `changePage`. This is where we can use `ecdsa.createKeys()` to create the public and private keys.

```javascript
const ecdsa = require('../ecdsa.js')
const changePage = require('../changepage').changePage
const file = require('../file.js')

function init() {
    ecdsa.createKeys((public, private, err) => {
        if (err) {
            console.error(err)
            changePage('wallets')
        } else {
            document.getElementById('public').innerText = public
            document.getElementById('private').innerText = private
        }
    })
    document.getElementById('create').addEventListener('click',() => {
        var name = document.getElementById('name').value
        console.log('Creating wallet: '+name)
        var data = {}
        data['name'] = name
        data['public'] = document.getElementById('public').textContent
        data['private'] = document.getElementById('private').textContent
        data['amount'] = 0
        console.log(JSON.stringify(data))
        file.append('wallets',data,() => {
            changePage('wallets')
        })
    })
}

exports.init = init
```

###### Testing

We can now test both `wallets` and `wallets-create`. First, I navigated to `wallets`.

![Wallets page](https://i.imgur.com/cJGwxw0.png)

As you can see, there's nothing there. So, I clicked on the "create" button, which takes us to `wallets-create`.

![wallets-create page](https://i.imgur.com/14WSrWD.png)

I entered the name "My Wallet" and pressed "Create", which took me back to the `wallets` page - except now, it had a wallet called "My Wallet", which means that it worked!

![Wallets with a wallet in it](https://i.imgur.com/UMolFuM.png)

##### Create Transaction

To create transactions, we need to be able to add in multiple input sources. This is much more complex than a single dropdown, as since the input sources will need to be added through Javascript, they can't (easily) have unique ids.

First of all, I created the HTML for the page, in `make.html`. `#error` has class `.hidden`, which gives it property `display: none`. When we want to display the error message, we remove this class.

Notice how the `#inputs` div is empty. This is because we will add the dropdowns with in through Javascript.

```html
<h1>Transactions</h1>

<h2>Make Transactions</h2>

<div class="hidden" id="error">
    <p><b>Error:</b> missing/incorrect form values</p>
</div>

<form>
    <p>To:</p>
    <input type="text" id="to" placeholder="Address"><br>
    <p>From:</p>
    <div id="inputs">
    </div>
    <button type="button" id="addInput">Add input</button>
    <p>Please note that each wallet can only be used once</p>
    <button type="button" id="send">Send</button>
</form>
```

Now, we need to create `make.js`. In the `init()` function, all we do is add event listeners to the buttons. We also import all the necessary functions.

```javascript
const file = require('../file.js')
const parse = require('../parse.js')
const ecdsa = require('../ecdsa.js')
const network = require('../network.js')

function init() {
    var add = document.getElementById('addInput')
    var send = document.getElementById('send')
    add.addEventListener('click',addInput)
    send.addEventListener('click',sendTx)
}

exports.init = init
```

Now we need to create the function `addInput()`, which is called when the `#addInput` button is pressed. It creates a div with the class `.input-group`. It then adds a dropdown, a line break, and a number input box to that div, and adds a placeholder value to the dropdown. It then appends `.input-group` to `#inputs`.

```javascript
function addInput() {
    var inputGroup = document.createElement('div')
    inputGroup.classList.add('input-group')
    // add select
    // <select name="dropdown"></select>
    var select = document.createElement('select')
    select.name = 'dropdown'
    // add placeholder
    select.innerHTML = '<option value="" selected disabled>Choose a wallet</option>'
    // add br
    // <br>
    var br = document.createElement('br')
    // add number input
    // <input name="amount" type="number" placeholder="Amount to send">
    var number = document.createElement('input')
    number.type = 'number'
    number.placeholder = 'Amount to send'
    number.name = 'amount'
    // add them all to the page
    inputGroup.appendChild(select)
    inputGroup.appendChild(br)
    inputGroup.appendChild(number)
    document.getElementById('inputs').appendChild(inputGroup)
}
```

However, we need to put the wallets in the dropdown. For this, I created a new function called `populateDropdown()`, which opens `wallets.json` and adds `option` elements to the dropdown with the wallets' name and balance. It also sets the `value` of the option to the public key, which is important, as this is what will be returned when we get the `value` of the dropdown if that option is selected. I also called the function in line 10 of the above snippet.

```javascript
function populateDropdown(select) {
    var option
    // get list of wallets
    file.getAll('wallets',(data) => {
        var wallets = JSON.parse(data)
        wallets.forEach((wallet) => {
            option = document.createElement('option')
            option.value = wallet.public
            option.text = wallet.amount/100000+"au - "+wallet.name
            select.add(option)
        })
    })
}
```

Finally, I called `addInput()` in the `init()` function so that the page starts with an input. You can see that this all worked:

![make tx](https://i.imgur.com/bVVNjfW.png)

Now, we just need to add the `sendTx()` function. The reason I had structured the inputs in this way is that I knew that `document.getElementsByClassName()` gives an array of the elements with that class name. Therefore, we can get all the elements with class name `.input-group` and iterate through them. We can then use `childNodes` to get the children of each group, then get their values.

```javascript
function sendTx() {
    var to = document.getElementById('to').value
    var groups = document.getElementsByClassName('input-group')
    groups.forEach((group) => {
        var child = group.childNodes
        var wallet = child[0].value
        var amount = child[1].value
        console.log(wallet)
        console.log(amount)
    })
}
```

However, there are some issues with this - first and foremost, `document.getElementsByClassName()` does not return an array - it returns a `HTMLCollection`, which is similar but we can't iterate through it. Luckily, this is easy to solve by turning it into an array using `Array.from`.

Secondly, there are actually three elements within each group, and therefore `child[1]` returns the `br` rather than the `input` that we want. This is fixed by using `child[2]` instead.

```javascript
function sendTx() {
    var to = document.getElementById('to').value
    // this isn't an array for some reason
    // we can make it one using Array.from
    // https://stackoverflow.com/a/37941811/5453419
    var groups = Array.from(document.getElementsByClassName('input-group'))

    groups.forEach((group) => {
        var child = group.childNodes
        var wallet = child[0].value
        console.log(wallet)
        // 2 because of the br
        var amount = child[2].value
        console.log(amount)
    })
}
```

Now we need to get data from `wallets.json` in order to sign the inputs. However, since `wallets.json` is an array, we can't easily get the private key with the public key, so I decided instead to put the wallets in a new format so you can get the private key from the secret key.

```javascript
function sendTx() {
    var to = document.getElementById('to').value
    // this isn't an array for some reason
    // we can make it one using Array.from
    // https://stackoverflow.com/a/37941811/5453419
    var groups = Array.from(document.getElementsByClassName('input-group'))
    var message = {
        "header": {
            "type": "tx"
        },
        "body": {
            "to": to,
            "from": []
        }
    }
    file.getAll('wallets',(data) => {
        var time = Date.now()
        message.body['time'] = time
        // converting wallets into a format
        // where you can enter the public key
        // and get the private key
        var convert =  {}
        var wallets = JSON.parse(data)
        wallets.forEach((wallet) => {
            public = wallet.public
            private = wallet.private
            convert[public] = private
        })
        groups.forEach((group) => {
            var child = group.childNodes
            var wallet = child[0].value
            console.log(wallet)
            // 2 because of the br
            var amount = child[2].value
            console.log(amount)
        })
    })
}
```

Now we can call `convert[public]` to get the private key. Next we need to create the signatures etc, which is fairly easy, since we have already created the `signMsg()` function. However, I put it all in a `try-catch` statement, and if an error is caught it removes `.hidden` from `#error`.

If the message manages to reach the end without errors, it checks the message using `parse.transaction`, sends the message using `sendToAll()` and finally appends the message body to both `txpool.json` and `recenttx.json`, for mining and for view transaction history, respectively.

```javascript
function sendTx() {
    var to = document.getElementById('to').value
    // this isn't an array for some reason
    // we can make it one using Array.from
    // https://stackoverflow.com/a/37941811/5453419
    var groups = Array.from(document.getElementsByClassName('input-group'))
    var message = {
        "header": {
            "type": "tx"
        },
        "body": {
            "to": to,
            "from": []
        }
    }
    file.getAll('wallets',(data) => {
        var time = Date.now()
        message.body['time'] = time
        // converting wallets into a format
        // where you can enter the public key
        // and get the private key
        var convert =  {}
        var wallets = JSON.parse(data)
        wallets.forEach((wallet) => {
            public = wallet.public
            private = wallet.private
            convert[public] = private
        })
        try {
            groups.forEach((group) => {
                var child = group.childNodes
                var wallet = child[0].value
                console.log(wallet)
                // 2 because of the br
                var amount = child[2].value
                console.log(amount)
                if (wallet && amount > 0) {
                    // convert to microau
                    amount *= 1000000
                    // the message that is signed
                    var concat = amount+to+time
                    var signature = ecdsa.signMsg(concat,convert[wallet],(signature) => {
                        message.body.from.push({
                            "wallet": wallet,
                            "amount": amount,
                            "signature": signature
                        })
                    })
                } else {
                    throw 'no amount entered'
                }
            })
            // if it's invalid, it will throw an error and be caught by the try-catch
            console.log('Transaction: '+JSON.stringify(message))
            parse.transaction(message.body)
            network.sendToAll(message)
            file.append('txpool',message.body)
            file.append('recenttx',message.body)
        } catch(e) {
            document.getElementById('error').classList.remove('hidden')
            console.warn('Tx failed: '+e)
        }
    },'[]')
}
```

This can only really be tested when everything else works, so this will be covered in the full testing phase.

##### View recent

This section is very similar to the wallet viewing page, except it reads `recenttx.json` instead. The HTML, `history.html`, looks like this:

```html
<h1>Transactions</h1>

<h2>Transaction History</h2>

<div class="highlight-box">
    <h3>Recent Transactions</h3>
    <button id="create">Make transaction</button>
    <div class="list" id="tx-list"></div>
</div>
```

`history.js` looks like this:

```javascript
const file = require('../file.js')
const changePage = require('../changepage').changePage

function init() {
    document.getElementById('create').addEventListener('click', function () {
        changePage('make')
    })
    file.getAll('recenttx',(data) => {
        transactions = JSON.parse(data)
        var txList = document.getElementById('tx-list')
        var listItem
        if (transactions) {
            transactions.forEach((tx) => {
                var balance = 0
                tx.from.forEach((from) => {
                    balance += from.amount/100000
                })
                listItem = document.createElement('div')
                listItem.classList.add('list-item')
                // timestamp to date
                var date = new Date(tx.time).toString()
                listItem.innerHTML = '<p><b>Time:</b> '+date+'</p><p><b>To:</b> '+tx.to+'</p><p><b>Amount:</b> <span class="money">'+balance+'</span></p>'
                txList.appendChild(listItem)
            })
        }
    })
}

exports.init = init
```

Something of note is the date - since `tx.time` is a timestamp, we need to turn it into something readable before printing it. For this, we use the `Date` class. Creating a `Date` object then using `toString()` turns it into a human-readable date. Initially, I tried to use `toISOString()`, which creates this:

```console
new Date(Date.now()).toISOString()
"2018-03-14T14:30:01.112Z"
```

However, that is not very readable. I soon discovered that I could use `toString() instead:

```console
new Date(Date.now()).toString()
"Wed Mar 14 2018 14:29:49 GMT+0000 (GMT Standard Time)"
```

That is much better, as it is clear what time and date that represents.

Again, since we need to be able to create transactions to see them here, and since we need the blockchain to work in order to do that, we will have to test this at the end.

#### Blockchain

The blockchain pages are a critical aspect of the project, as it is here where we mine the blockchain.

##### Mining

Mining the blockchain, as mentioned previously, consists of performing hundreds of thousands hash operations to find the one that passes a "difficulty test" - in this case, it passes if the hash begins with a certain number of hashes. Obviously, this is very CPU intensive, and since Node.js is single-threaded this would cripple the performance of the application. This is not desirable, so I looked for alternatives.

###### Multi-threading alternatives

The first option I looked at was to see if there was a multithreading module default to Node.js. This lead me to `child_process`. However, although this appeared to be relevent to my problems, it looked far too complex for this project.

Next, I looked to see if there was anything default to Javascript itself. As it turns out, there is a `Webworker` API which allows you to run a different JS file independantly from the main program, and also communicate between programs.

An example of a `Webworker`:

```javascript
var worker = new Worker('worker.js')

worker.onmessage = (msg) => {
    console.log(msg.data)
}
```

However, I immediately ran into a problem when I tried to use Node.js functions in the `worker.js` file.

```console
ReferenceError: require is not defined
```

Webworkers can only use plain Javascript, and don't have access to Node.js modules or features. This is a massive problem, as we need to use `cryto` module to hash stuff at a minimum. I therefore had to carry on looking.

The next place I looked was in `npm`. Since `Worker()` was exactly what I needed, I looked for Node.js-compatible alternative.

Luckily enough, I found one! `tiny-worker` replaces `Webworker` with the same API but now with access to Node.js functions.

##### Viewing

#### Settings

