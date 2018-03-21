## Code

Here is all of the code in the project, organised by file structure. I have excluded `/node_modules`, `README.md`, the licence, and git-related files.

### app

`package.json`:

```json
{
  "name": "arbitra-client",
  "version": "0.2.0",
  "main": "main.js",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git://github.com/Mozzius/arbitra.git"
  },
  "dependencies": {
    "big-integer": "^1.6.26",
    "electron": "^1.8.3",
    "ip": "^1.1.5",
    "tiny-worker": "^2.1.2"
  },
  "scripts": {
    "start": ".\\node_modules\\.bin\\electron ."
  }
}
```

`main.js`:

```javascript
const { app, BrowserWindow, globalShortcut } = require('electron')
const file = require('./js/file.js')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        frame: false,
        icon: 'static/au-icon.png'
    })

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname,'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools when Alt is pressed
    globalShortcut.register('Alt+X',() => {
        win.webContents.openDevTools()
    })

    // Emitted when the window is closed.
    win.on('closed',() => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready',createWindow)

// Quit when all windows are closed.
app.on('window-all-closed',() => {
    // It quits when all windows are closed, regardless of platform.
    app.quit()
})

app.on('activate',() => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})
```

`renderer.js`:

```javascript
const remote = require('electron').remote
const changePage = require('./js/changepage.js').changePage
const network = require('./js/network.js')
const blockchain = require('./js/blockchain.js')

document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
        const window = remote.getCurrentWindow()
        // Close Buttons
        document.getElementById('min').addEventListener('click',() => {
            window.minimize()
        })
        document.getElementById('max').addEventListener('click',() => {
            if (window.isMaximized()) {
                window.unmaximize()
            } else {
                window.maximize()
            }
        })
        document.getElementById('close').addEventListener('click',() => {
            window.close()
        })

        // Changing pages

        // this opens the initial page
        changePage('overview')

        // event listeners for each button
        // there is probably a better way of doing this
        document.getElementById('overview').addEventListener('click',() => {
            changePage('overview')
        })
        document.getElementById('make').addEventListener('click',() => {
            changePage('make')
        })
        document.getElementById('wallets').addEventListener('click',() => {
            changePage('wallets')
        })
        document.getElementById('history').addEventListener('click',() => {
            changePage('history')
        })
        document.getElementById('view').addEventListener('click',() => {
            changePage('view')
        })
        document.getElementById('mine').addEventListener('click',() => {
            changePage('mine')
        })
        document.getElementById('network-settings').addEventListener('click',() => {
            changePage('network-settings')
        })
        document.getElementById('app-settings').addEventListener('click',() => {
            changePage('app-settings')
        })
        document.getElementById('dev').addEventListener('click',() => {
            // toggle dev tools
            var webcontents = remote.getCurrentWebContents()
            if (webcontents.isDevToolsOpened()) {
                webcontents.closeDevTools()
            } else {
                webcontents.openDevTools()
            }
        })

        // start server
        network.init()
    }
}
```

`index.html`:

```html
<html>
	<head>
		<meta charset="utf-8">
		<title>Arbitra Client</title>
        <link rel="stylesheet" href="static/style.css"/>
        <script defer src="renderer.js" type="text/javascript"></script>
        <script defer src="static/fontawesome.min.js"></script>
	</head>
	<body>
		<div class="left">
			<h1 class="money" id="current-balance">0</h1>
			<ul>
                <li><i class="fa fa-fw fa-rss" aria-hidden="true"></i> <span id="connections">0</span> connections</li>
                <li><i class="fa fa-fw fa-chain" aria-hidden="true"></i> <span id="height">0</span> blocks in blockchain</li>
            </ul>
            <div class="items" id="nonodes">WARNING: No connections</div>
			<div class="subsec link" id="overview">Overview</div>
			<div class="subsec">Transactions</div>
            <div class="items link" id="make">Make Transactions</div>
			<div class="items link" id="history">Transaction History</div>
			<div class="items link" id="wallets">Wallets</div>
            <div class="subsec">Blockchain</div>
            <div class="items link" id="mine">Mine for Arbitrary Units</div>
			<div class="items link" id="view">View Blockchain</div>
			<div class="subsec">Settings</div>
			<div class="items link" id="network-settings">Network Settings</div>
			<div class="items link" id="app-settings">Application Settings</div>
            <div class="subsec link" id="dev">Toggle Dev Tools</div>
		</div>
		<div class="right">
			<div class="dragbar"></div>
			<div class="closebox">
				<i id="min" class="fa fa-window-minimize" aria-hidden="true"></i>
				<i id="max" class="fa fa-window-restore" aria-hidden="true"></i>
				<i id="close" class="fa fa-window-close" aria-hidden="true"></i>
			</div>
			<div id="body">
                <img src="static/au-icon.png" alt="splash image">
			</div>
		</div>
	</body>
</html>
```

#### static

`fontawesome.min.js`:

Font awesome v4.7.0 is availible to download here:

https://fontawesome.com/v4.7.0/

`au-icon.png`:

![au-icon.png](https://i.imgur.com/CvjidNa.png)

`style.css`:

```css
* {
    font-family: Segoe UI, Helvetica, sans-serif;
    margin: 0;
    transition: background-color 0.5s ease;
    transition: color 0.2s ease;
}

body {
    height: 100vh;
    overflow: auto;
}

h1 {
    margin-bottom: 8px;
}

p {
    margin-top: 2px;
    margin-bottom: 5px;
}

button, input[type=submit] {
    background-color: #fdfdfd;
    font-weight: 400;
    margin: 2px 0;
    min-width: 70px;
    padding: 4px 10px;
    border: 1px solid #333;
    border-radius: 5px;
}

button:hover, input[type=submit]:hover {
    background-color: #333;
    color: #fdfdfd;
}

input[type=text], input[type=number] {
    background-color: #fdfdfd;
    font-weight: 400;
    margin: 2px 0;
    width: calc(100% - 20px);
    max-width: 300px;
    padding: 4px 10px;
    border: 1px solid #333;
    border-radius: 5px;
    outline: none;
}

input[type=text]:focus, input[type=number]:focus {
    border-radius: 5px;
}

select {
    background-color: #fdfdfd;
    font-weight: 400;
    margin: 2px 0;
    width: calc(100% - 20px);
    max-width: 300px;
    padding: 3px 5px;
    border: 1px solid #333;
    border-radius: 5px;
    outline: none;
}

.highlight {
    background-color: #333;
    display: inline;
    color: #fdfdfd;
    border-radius: 3px;
    padding: 1px 3px 3px;	
}

a {
    text-decoration: none;
}

p > a {
    color: #666;
}

p > a:hover {
    color: #fdfdfd;
    background-color: #333;
    padding: 0 2px 2px;
    margin: 0 -2px -2px;
    text-decoration: none;
    border-radius: 3px;
}

#console {
    box-sizing: border-box;
    width: 100%;
    height: calc(100% - 180px);
    min-height: 300px;
    background-color: #ececec;
    border-radius: 5px;
    border: 1px solid #333;
    padding: 5px;
    overflow-y: auto;
    overflow-x: hidden;
    font-family: 'Courier New', 'Courier', monospace;
}

.money::after {
    content: "au";
    font-size: 0.65em;
}

.left {
    width: 300px;
    min-height: calc(100% - 20px);
    float: left;
    padding-top: 20px;
    background-color: #333;
    /*background-image: url(https://i.redd.it/xqiqn0pd5ud01.png);
    background-position: center;
    background-repeat: no-repeat;
    box-shadow: inset -10px 0 10px -10px #333;*/
}

.left > * {
    color: #fdfdfd;
    list-style: none;
    padding-left: 25px;
    /*text-shadow: 1px 1px 1px #333;*/
}

.link:hover {
    background-color: rgba(43, 43, 43, 0.5);
    cursor: pointer;
}

.left > h1 {
    font-size: 2.4em;
}

.subsec {
    font-size: 1.5em;
    padding: 3px;
    padding-left: 25px;
    margin-top: 15px;
    cursor: default;
}

.items {
    font-size: 1.2em;
    padding: 3px;
    padding-left: 35px;
}

.right {
    width: calc(100vw - 300px);
    height: 100vh;
    overflow-y: auto;
    background-color: #fdfdfd;
    position: fixed;
    top: 0;
    right: 0;
}

.dragbar {
    width: calc(100% - 150px);
    height: 50px;
    float: left;
    -webkit-app-region: drag;
}

.closebox {
    width: 140px;
    height: 40px;
    float: left;
    padding: 5px;
}

.closebox > i {
    font-size: 2em;
    padding-left: 10px;
    color: #333;
    cursor: pointer;
}

#close:hover {
    color: red;
}

#body {
    width: calc(100% - 20px);
    padding: 10px;
    color: #333;
}

#body > h1 {
    font-size: 2.2em;
    border-bottom: 2px solid #333;
}

#body > img {
    margin-top: calc(50vh - 100px);
    margin-left: calc(50% - 50px);
}

.td {
    max-width: 100px;
    overflow-x: scroll;
}

.highlight-box {
    margin-top: 20px;
    width: calc(100% - 20px);
    position: relative;
    border-radius: 5px;
    padding: 10px 10px 5px;
    background-color: #ececec;
    border: 1px solid #333;
}

.highlight-box > button {
    position: absolute;
    top: 5px;
    right: 10px;
}

.list {
    overflow-y: auto;
    overflow-x: hidden;
}

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

.hidden {
    display: none;
}

#error {
    color: red;
}

#nonodes {
    padding-left: 25px;
    margin-top: 10px;
    margin-bottom: -10px;
}

::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1; 
}

::-webkit-scrollbar-thumb {
    background: #888; 
}

::-webkit-scrollbar-thumb:hover {
    background: #333; 
}
```

#### pages

`app-settings.html`:

```html
<h1>Settings</h1>

<h2>App Settings</h2>

<p>Application Version: <span id="version"></span></p>

<h3>Save wallets</h3>
<p>Save wallets.json to somewhere in your computer.</p>
<button id="save">Save</button>

<h3>Clear cached file</h3>
<p>Warning - this will delete any pending transactions, and you will have to redownload the blockchain. It will not delete your wallets.</p>
<button id="clear">Clear cache</button>
<p id="ca-save" class="hidden">Cache cleared</p>
```

`history.html`:

```html
<h1>Transactions</h1>

<h2>Transaction History</h2>

<div class="highlight-box">
    <h3>Recent Transactions</h3>
    <button id="create">Make transaction</button>
    <div class="list" id="tx-list"></div>
</div>
```

`make.html`:

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

`mine.html`:

```html
<h1>Blockchain</h1>

<h2>Mine for Arbitrary Units</h2>

<button id="toggle" style="margin-right:5px">Start</button><button id="clear">Clear</button> <b>Please note:</b> Mining is very CPU intensive

<pre id="console"></pre>
```

`network-settings.html`:

```html
<h1>Settings</h1>

<h2>Network Settings</h2>

<h3>Add node</h3>
<p>Enter an IP address, and it will attempt to connect.</p>
<input type="text" id="sendto"/>
<button id="send">Send ping</button>
<p id="pg-save" class="hidden">Ping sent</p>

<h3>Target connections</h3>
<p>The target number of connections that the client will try to get. Current: <span id="curr"></span></p>
<input type="number" id="target"/>
<button id="target-save">Save</button>
<p id="min-save" class="hidden">Option saved</p>

<h3>Advertise</h3>
<p>Sometimes, nodes will ask others to send a list of clients that they are in contact with. Your IP will only be shared if this setting is turned on.</p>
<select id="advertise">
    <option value="true">On</option>
    <option value="false">Off</option>
</select>
<button id="save">Save</button>
<p id="ad-save" class="hidden">Option saved</p>


<h3>Refresh connections</h3>
<p>Refresh this client's connections to other nodes.</p>
<button id="refresh">Refresh</button>
<p id="re-save" class="hidden">Connections refreshed</p>
```

`wallets.html`:

```html
<h1>Transactions</h1>

<h2>Wallets</h2>

<div class="highlight-box">
    <h3>My wallets</h3>
    <button id="create">Create new wallet</button>
    <div class="list" id="wallet-list"></div>
</div>
```

`wallets-create.html`:

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

`overview.html`:

```html
<h1>Arbitra</h1>

<p>Welcome to Arbitra!</p>

<br>

<h3>You can:</h3>

<p><i class="fa fa-fw fa-envelope" aria-hidden="true"></i> Send a transaction</p>
<p><i class="fa fa-fw fa-chain" aria-hidden="true"></i> Mine the blockchain for Arbitrary Units</p>
<p><i class="fa fa-fw fa-eye" aria-hidden="true"></i> View past transactions and the blockchain</p>
<p><i class="fa fa-fw fa-rss" aria-hidden="true"></i> Connect to other nodes on the network</p>

<br>

<p>Got any questions/feedback? Email me at <a href="mailto:hello@samuelnewman.uk">hello@samuelnewman.uk</a></p>
```

#### js

`parse.js`:

```javascript
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
    const difficulty = 6
    var txlist = body.transactions
    var len = txlist.length
    var tx
    var blockhash = hash.sha256hex(JSON.stringify(body))
    // verify all the transactions
    var pass = true
    for (var i = 0; i < body.difficulty; i++) {
        if (blockhash.charAt(i) !== 'a') {
            pass = false
        }
    }
    if (body.difficulty === difficulty && pass) {
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
    file.getAll('txpool',(data) => {
        var txpool = JSON.parse(data)
        if (!txpool.includes(msg.body)) {
            file.append('txpool',msg.body,() => {
                // send to contacts
                sendToAll(msg)
                // reply
                callback(reply)
            })
        }
    },'[]')
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
    network.sendToAll(msg)
    callback(reply)
}

function hr(msg,callback) {
    file.getAll('blockchain',(data) => {
        if (data === null || data === "{}") {
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
                callback(reply)
            })
        }
    })
}

function pg(msg,ip,callback) {
    // store the connection
    pgreply(msg,ip)
    // send a reply
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
                document.getElementById('nonodes').classList.add('hidden')
                var current = document.getElementById('connections').textContent
                document.getElementById('connections').textContent = parseInt(current) + 1
            })
        }
    },'[]') // if it fails it returns an empty array
}

function bh(msg,callback) {
    file.getAll('blockchain',(data) => {
        var mainchain = JSON.parse(data)
        if (!Object.keys(mainchain).includes(msg.body.hash)) {
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
    },'{}')
}

function nr(msg,ip,callback) {
    var max = Infinity
    if (msg.hasOwnProperty('max')) {
        var max = msg.max
    }
    var nodes = []
    file.getAll('connections',(data) => {
        if (data === null) {
            throw 'notfound'
        }
        var connections = JSON.parse(data)
        connections.forEach((connection,i) => {
            if (connection.ip !== ip && i < max && connection.advertise === "true") {
                nodes.push(connections)
            }
        })
        var reply = {
            "header": {
                "type": "nd"
            },
            "body": {
                "nodes": nodes
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
                blockchain.getChain(msg.body.hash,(chain) => {
                    if (chain === null) {
                        throw 'notfound'
                    } else {
                        var reply = {
                            "header": {
                                "type": "cn"
                            },
                            "body": {
                                "chain": chain
                            }
                        }
                        callback(reply)
                    }
                })
            }
        })
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
}

function cn(msg) {
    for (var key in msg.chain) {
        // an oversight means we need to give it msg.body
        var block = {"body":msg.chain[key]}
        blockchain.addBlock(block)
    }
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
exports.bh = bh
exports.cr = cr
exports.er = er
exports.cn = cn
exports.block = block
exports.transaction = transaction
```

`network.js`:

```javascript
const net = require('net')
const hash = require('./hashing.js')
const file = require('./file.js')
const parse = require('./parse.js')
const version = require('../package.json').version
const blockchain = require('./blockchain.js')

const port = 2018

function init() {
    // creates a server that will receive all the messages
    // when it receives data, it will pass it to parseMsg()
    // and reply with whatever it sends back
    var server = net.createServer((socket) => {
        var ip = socket.remoteAddress
        socket.setEncoding('utf8')
        // when it receives data, send to parseMsg()
        socket.on('data',(data) => {
            console.log('Received connection from: '+ip)
            console.log('Server received: '+data)
            parseMsg(data,ip,(msg) => {
                if (msg.header.type !== 'tx' && msg.header.type !== 'bk') {
                    msg.body['time'] = Date.now()
                    msg.header['version'] = version
                    msg.header['size'] = Buffer.byteLength(JSON.stringify(msg.body))
                    msg.header['hash'] = hash.sha256hex(JSON.stringify(msg.body))
                }
                var reply = JSON.stringify(msg)
                console.info('Sending message to '+ip+': '+reply)
                socket.write(reply)
                file.append('sent',msg.header.hash)
                socket.end()
            })
        })
    })
    
    // server listens on this port
    // should be 2018
    server.listen(port,'0.0.0.0',() => {  
        console.log('Server listening on port',port)
    })

    // wipe connections
    // this will be populated with connections that succeed
    file.storeAll('connections',[])
    // inital connection attempt as setInterval runs at then end of the 60 seconds
    connect()
    
    try {
        blockchain.calcBalances()
    } catch(e) {
        console.warn('calcBalances() failed')
    }

    // this is a loop that maintains connections and
    // sends top hash requests to make sure the client is up to date
    // it goes on forever, every minute
    setInterval(() => {
        console.log('Interval')
        var connections = parseInt(document.getElementById('connections').textContent)
        // first check that we have enough connections
        file.get('target-connections','network-settings',(target) => {
            // if the current number of of connections is less than the minimum
            // as defined by user settings, connect
            if (connections < target) {
                connect()
                // if it's still not enough after 15 seconds, send node requests
                setTimeout(() => {
                    connections = parseInt(document.getElementById('connections').textContent)
                    if (connections < target) {
                        var nr = {
                            "header": {
                                "type": "nr"
                            },
                            "body": {}
                        }
                        sendToAll(nr)
                    }
                },15000)
            } else {
                // save current connections to recent connections
                file.getAll('connections',(data) => {
                    if (connections !== null) {
                        file.storeAll('recent-connections',JSON.parse(data))
                    }
                })
            }
            connections = parseInt(document.getElementById('connections').textContent)
            if (connections === 0) {
                document.getElementById('nonodes').classList.remove('hidden')
            } else {
                // check that the chain is up to date
                var hr = {
                    "header": {
                        "type": "hr"
                    },
                    "body": {}
                }
                sendToAll(hr)
            }
        },5) // if it fails to open the file it sets target to five
    },60000)
}

function connect() {
    // try to connect to other nodes through old connections
    file.getAll('recent-connections',(data) => {
        var connections = JSON.parse(data)
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
            file.getAll('connections',(curdata) => {
                var current = JSON.parse(curdata)
                connections.forEach((node) => {
                    if (!current.includes(node)) {
                        sendMsg(ping,node.ip)
                    }
                })
            },'[]')
            
            // wait ten seconds to see if any connections have been made
            setTimeout(() => {
                // get the number of connections from textContent
                var connectCount = parseInt(document.getElementById('connections').textContent)
                if (connectCount === 0) {
                    console.warn('No connections found!')
                    document.getElementById('nonodes').classList.remove('hidden')
                    console.warn('Connecting to backup server')
                    // wavecalcs.com is friend's server, and should be online for the purposes of this project
                    // wavecalcs.com = 5.81.186.90
                    sendMsg(ping,'5.81.186.90')
                }
            },10000)
        })
    },'[]')
}

function sendMsg(msg,ip,callback) {
    // for checking that the message hasn't already been sent
    file.getAll('sent',(data) => {
        // for some reason, sent.json sometimes ends with [...]]
        // until I find the source of the bug, this will do
        if (data[data.length-1] === data[data.length-2]) {
            data = data.slice(0,-1)
        }
        var sent = JSON.parse(data)
        if (msg.header.type !== 'bk' && msg.header.type !== 'tx') {
            // don't want to affect the body of a block
            // and the time of the tx is crucial as well
            // as it will throw off the hash
            msg.body['time'] = Date.now()
        }
        msg.header['version'] = version
        msg.header['size'] = Buffer.byteLength(JSON.stringify(msg.body))
        msg.header['hash'] = hash.sha256hex(JSON.stringify(msg.body))

        // check that the message hasn't already been sent
        if (!sent.includes(msg.header.hash)) {
            var sendMe = JSON.stringify(msg)
            console.info('Sending message to '+ip+': '+sendMe)

            // actually go send the message
            var client = new net.Socket()
            client.connect(port,ip,() => {
                client.write(sendMe)
                // add the hash to the sent messages file
                file.append('sent',msg.header.hash)
                client.on('data',(data) => {
                    console.log('Client received: '+data)
                    parseReply(data,ip,() => {
                        client.destroy()
                    })
                })
                client.on('close',() => {
                })
                client.on('timeout',() => {
                    console.warn('Client timed out')
                    client.destroy()
                })
                client.on('error',(e) => {
                    console.warn('Client timed out')
                    client.destroy()
                })
            })
        } else {
            console.log('Message already sent')
        }
    },'[]')
}

function parseMsg(data,ip,callback) {
    // parse incoming messages and replies
    // by calling parse functions
    try {
        var msg = JSON.parse(data)
        if (msg.header.hash === hash.sha256hex(JSON.stringify(msg.body))) {
            if (msg.header.type === 'tx') {
                // transaction
                // callback is used to send the reply
                parse.tx(msg,callback)
            } else if (msg.header.type === 'bk') {
                // block
                parse.bk(msg,callback)
            } else if (msg.header.type === 'hr') {
                // hash request
                parse.hr(msg,callback)
            } else if (msg.header.type === 'cr') {
                // chain request
                parse.cr(msg,callback)
            } else if (msg.header.type === 'pg') {
                // ping
                parse.pg(msg,ip,callback)
            } else if (msg.header.type === 'nr',callback) {
                // node request
                parse.nr(msg,ip,callback)
            } else {
                throw 'type'
            }
        } else {
            throw 'hash'
        }
    } catch(e) {
        // catching any errors and replying with an error message
        console.warn(e)
        var error
        if (e.name === 'SyntaxError') {
            error =  'parse'
        } else {
            error = e
        }
        var reply = {
            "header": {
                "type": "er"
            },
            "body": {
                "error": error
            }
        }
        file.append('error-logs',data)
        callback(reply)
    }
}

function parseReply(data,ip,callback=()=>{}) {
    // parse incoming replies
    // by calling parse functions
    try {
        var msg = JSON.parse(data)
        if (msg.header.hash == hash.sha256hex(JSON.stringify(msg.body))) {
            if (msg.header.type === 'cn') {
                // chain
                parse.cn(msg)
            } else if (msg.header.type === 'bh') {
                // top hash
                parse.bh(msg)
            } else if (msg.header.type === 'nd') {
                // nodes
                parse.nd(msg)
            } else if (msg.header.type === 'pg') {
                // ping
                parse.pgreply(msg,ip)
            } else if (msg.header.type === 'ok') {
                // message received ok
                console.info('message recieved ok')
            } else if (msg.header.type === 'er') {
                // error (uh oh)
                console.warn('We recieved an error')
                parse.er(msg)
            } else {
                throw 'type'
            }

        } else {
            throw 'hash'
        }
    } catch(e) {
        console.warn('Reply error: '+e)
        file.append('error-log',msg)
    } finally {
        // call the callback, if needed
        callback()
    }
}

function sendToAll(msg) {
    file.getAll('connections',(data) => {
        // doesn't do anything if there's no connections
        if (data !== null || data === '' || data === '[]') {
            nodes = JSON.parse(data)
            // go through connections and send a message to each
            nodes.forEach((node) => {
                sendMsg(msg,node.ip)
            })
        }
    })
}

exports.init = init
exports.sendMsg = sendMsg
exports.sendToAll = sendToAll
exports.connect = connect
```

`mining-script.js`:

```javascript
const hash = require(__dirname+'/js/hashing.js')
const fs = require('fs')

class Miner {
    constructor(path) {
        const difficulty = 6
        this.path = path
        // this is for the printing later
        this.hashes = 0
        this.dhash = 0
        this.t1 = Date.now()
        this.t2 = Date.now()
        this.tt = Date.now()
        // difficulty is static
        this.block = {
            "header": {
                "type": "bk"
            },
            "body": {
                "difficulty": difficulty
            }
        }

        var transactions = JSON.parse(fs.readFileSync(this.path+'txpool.json','utf-8'))
        this.block.body['transactions'] = transactions

        // parent and height
        var top = this.getTopBlock()
        if (top === null) {
            this.block.body['parent'] = '0000000000000000000000000000000000000000000000000000000000000000'
            this.block.body['height'] = 0
        } else {
            var blockchain = JSON.parse(fs.readFileSync(this.path+'blockchain.json','utf8'))
            this.block.body['parent'] = top
            this.block.body['height'] = blockchain[top].height+1
        }
        // miner
        var wallets = JSON.parse(fs.readFileSync(this.path+'wallets.json','utf-8'))
        var miner = wallets[0].public
        this.block.body['miner'] = miner

        postMessage('Block formed, mining initiated')
    }

    mine() {
        // repeatedly hashes with a random nonce
        while (true) {
            this.rand((nonce) => {
                this.block.body['nonce'] = nonce
                // t2 is updated every loop
                this.block.body['time'] = this.t2
                this.hashBlock(this.block.body,(hash) => {
                    this.hashes++
                    this.dhash++
                    // checks difficulty
                    var pass = true
                    for (var i = 0; i < this.block.body.difficulty; i++) {
                        if (hash.charAt(i) !== 'a') {
                            pass = false
                        }
                    }
                    this.t2 = Date.now()
                    // this triggers if the block has passed the difficulty test
                    if (pass) {
                        postMessage('Hash found! Nonce: '+nonce)
                        postMessage(hash)
                        postMessage(this.block)
                        // get rid of the pending transactions
                        fs.writeFileSync(this.path+'txpool.json','[]','utf-8')
                        // set the new block things
                        this.block.body.transactions = []
                        var top = this.getTopBlock()
                        this.block.body['parent'] = hash
                        this.block.body['height'] += 1 
                    } else {
                        // printing for the console
                        if ((this.t2-this.t1) > 10000) {
                            // calculate hashes per second (maybe)
                            // *1000 turns it into seconds
                            var hs = (this.dhash/(this.t2-this.t1))*1000
                            this.dhash = 0
                            this.t1 = Date.now()
                            postMessage('Hashing at '+hs.toFixed(3)+' hashes/sec - '+this.hashes+' hashes in '+Math.floor((this.t1-this.tt)/1000)+' seconds')

                            // check to see if the block has updated
                            fs.readFile(this.path+'txpool.json','utf-8',(err,content) => {
                                if (err) {
                                    // if the file doesn't exist, set content to []
                                    if (err.code === 'ENOENT') {
                                        content = '[]'
                                    } else {
                                        postMessage('Error opening file')
                                        throw err
                                    }
                                }
                                var current = JSON.stringify(this.block.body.transactions)
                                // change the transactions if they are different
                                if (current !== content) {
                                    var newtx = JSON.parse(content)
                                    this.block.body['transactions'] = newtx
                                    postMessage('Transactions updated')
                                }
                            })
                        }
                    }
                })
            })
        }
    }

    rand(callback) {
        callback(Math.floor(10000000000000000*Math.random()))
    }
    
    hashBlock(block,callback) {
        var hashed = hash.sha256hex(JSON.stringify(block))
        callback(hashed)
    }

    getTopBlock() {
        const genesis = '0000000000000000000000000000000000000000000000000000000000000000'
        try {
            var data = fs.readFileSync(this.path+'blockchain.json','utf8')
        } catch(e) {
            return null
        }
        if (data === '{}' || data === '') {
            return null
        }
        var fullchain = JSON.parse(data)
        // get the origin block
        // as there is nothing under it to be wrong
        for (var best in fullchain) {
            if (fullchain[best].parent === genesis) {
                break
            }
        }
        if (typeof best !== 'undefined' && fullchain[best].parent === genesis) {
            // iterates through the fullchain
            for (var key in fullchain) {
                // larger height the better
                if (fullchain[key].height > fullchain[best].height) {
                    var candidate = true
                    // iterate down the chain to see if you can reach the bottom
                    // if the parent is undefined at any point it is not part of the main chain
                    // run out of time for a more efficient method
                    var current = key
                    var parent
                    while (fullchain[current].parent !== genesis) {
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
                        while (fullchain[current].parent !== genesis) {
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
        } else {
            best = null
        }
        return best
    }
}

onmessage = (path) => {
    postMessage('Path recieved')
    try {
        var miner = new Miner(path.data)
        miner.mine()
    } catch(e) {
        postMessage('Error caught')
        if (typeof e !== 'string') {
            e = e.message
        }
        postMessage(e)
    }
}
```

`file.js`:

```javascript
const remote = require('electron').remote
const fs = require('fs')

function store(key,data,file,callback=()=>{}) {
    // put data in file
    var path = remote.app.getPath('appData')+'/arbitra-client/'+file+'.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, it creates an empty object literal
            // it will then continue on and create the file later
            if (err.code === 'ENOENT') {
                content = '{}'
            } else {
                alert('Error opening '+file+'.json')
                throw err
            }
        }
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            if (jsondata.hasOwnProperty(key) && Array.isArray(data)) {
                // if the key exists it concatenates the two arrays, creates a new set
                // which removes duplicates, then turns it back to an array
                // https://gist.github.com/telekosmos/3b62a31a5c43f40849bb#gistcomment-1826809
                var set = new Set(jsondata[key].concat(data))
                jsondata[key] = Array.from(set)
            } else {
                // otherwise sets the key to the data
                jsondata[key] = data
            }
        } catch(e) {
            console.warn(e)
            var jsondata = {}
            jsondata[key] = data
        } finally {
            // writes the contents back to the file
            // or makes the file if it doesn't exist yet
            content = JSON.stringify(jsondata)
            fs.writeFile(path,content,'utf-8',(err) => {
                if (err) throw err
                callback()
            })
        }
    })
}

function get(key,file,callback,fail=null) {
    var path = remote.app.getPath('appData')+'/arbitra-client/'+file+'.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, return null
            if (err.code === 'ENOENT') {
                console.warn(file+'.json not found')
                console.trace()
                callback(fail)
                return
            } else {
                alert('Error opening '+file+'.json')
                throw err
            }
        }
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            var result = jsondata[key]
        } catch(e) {
            // if the key doesn't exist, return null
            console.warn(e)
            var result = fail
        } finally {
            callback(result)
        }
    })
}

function getAll(file,callback,fail=null) {
    var path = remote.app.getPath('appData')+'/arbitra-client/'+file+'.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, return null
            if (err.code === 'ENOENT') {
                console.warn(file+'.json not found')
                content = fail
            } else {
                alert('Error opening '+file+'.json')
                console.error('Error opening '+file+'.json')
                throw err
            }
        }
        callback(content)
    })
}

function storeAll(file,data,callback=()=>{}) {
    var path = remote.app.getPath('appData')+'/arbitra-client/'+file+'.json'
    content = JSON.stringify(data)
    fs.writeFile(path,content,'utf-8',(err) => {
        if (err) throw err
        callback()
    })
}

function append(file,data,callback=()=>{}) {
    // write data to a file, but where the file is an array so no key
    var path = remote.app.getPath('appData')+'/arbitra-client/'+file+'.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, it creates an empty object literal
            // it will then continue on and create the file later
            if (err.code === 'ENOENT') {
                content = '[]'
            } else {
                alert('Error opening '+file+'.json')
                throw err
            }
        }
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            jsondata.push(data)
        } catch(e) {
            console.warn(e)
            var jsondata = [data]
        } finally {
            // writes the contents back to the file
            // or makes the file if it doesn't exist yet
            content = JSON.stringify(jsondata)
            fs.writeFile(path,content,'utf-8',(err) => {
                if (err) throw err
                callback()
            })
        }
    })
}

exports.store = store
exports.get = get
exports.getAll = getAll
exports.append = append
exports.storeAll = storeAll
```

`ecdsa.js`:

```javascript
const crypto = require('crypto')
const bigInt = require('big-integer')
const hash = require('./hashing.js')

// elliptic curve secp256k1
const curve = {
    a: bigInt('0'),
    b: bigInt('7'),
    p: bigInt('115792089237316195423570985008687907853269984665640564039457584007908834671663'),
    g: {
        x: bigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
        y: bigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424')
    },
    n: bigInt('115792089237316195423570985008687907852837564279074904382605163141518161494337')
}

function randomNum(min=1,max=curve.n) {
    var randomValue = max.add(1)
    while (randomValue.greater(max) || randomValue.lesser(min)) {
        // 32 bytes = 256 bits
        var buffer = crypto.randomBytes(32).toString('hex')
        randomValue = bigInt(buffer,16)
    }
    return randomValue
}

function onCurve(point) {
    // sees if point is on the curve y^2 = x^3 + ax + b
    if (point !== Infinity) {
        ysq = point.y.square()
        xcu = point.x.pow(3)
        ax = curve.a.multiply(point.x)
        if (ysq.minus(xcu).minus(ax).minus(curve.b).isZero()) {
            throw new Error('not on curve')
        }
    }
}

function addPoints(P1,P2) {
    onCurve(P1)
    onCurve(P2)
    var m,x,y
    // Point + Infinity = Point
    if (P1 === Infinity) {
        return P2
    } else if (P2 === Infinity) {
        return P1
    }
    if (P1.x === P2.x) {
        if (P1.y !== P2.y) {
            return Infinity
        } else {
            // finding gradient of tangent
            var t1 = bigInt(3).times(P1.x.square())
            var t2 = bigInt(2).times(P1.y)
            m = bigInt(t1.plus(curve.a)).times(t2.modInv(curve.p))
        }
    } else {
        // finding gradient of line between 2 points
        var t1 = P2.y.minus(P1.y)
        var t2 = P2.x.minus(P1.x)
        m = t1.times(t2.modInv(curve.p))
    }
    // calculating other interception point
    x = bigInt(m.square().minus(P1.x).minus(P2.x)).mod(curve.p)
    y = bigInt(bigInt(m.times(P1.x)).minus(P1.y).minus(m.times(x))).mod(curve.p)
    var P3 = {
        x: x,
        y: y
    }
    onCurve(P3)
    return P3
}

function multiPoints(n,P) {
    if (P === Infinity) {
        return P
    }
    var total = Infinity
    var binary = n.toString(2)
    // reversed binary
    var yranib = binary.split('').reverse()
    // see documentation if confused, it's a bit mathsy
    // to explain in comments
    yranib.forEach(function(bit) {
        if (bit == 1) {
            total = addPoints(total, P)
        }
        P = addPoints(P, P)
        onCurve(P)
    })
    onCurve(total)
    return total
}

function createKeys(callback) {
    var err
    try {
        var private = randomNum(1, curve.n)
        var public = multiPoints(private, curve.g)
        var x = public.x.toString(16)
        var y = public.y.toString(16)
        public = x+y
        private = private.toString(16)
    } catch (e) {
        err = e
    } finally {
        callback(public, private, err)
    }
}

function signMsg(msg,private,callback) {
    var err
    var w = bigInt(private,16)
    console.log('Signing: '+msg)
    var z = hash.sha256(msg)
    var r,s
    r = s = bigInt.zero
    while (r.isZero() && s.isZero()) {
        var k = randomNum(1, curve.n)
        try {
            var P = multiPoints(k,curve.g)
        } catch(e) {
            err = e
            callback(0,0,err)
            return
        }
        r = P.x.mod(curve.n)
        s = bigInt(bigInt(w.times(r).plus(z)).times(k.modInv(curve.n))).mod(curve.n)
    }
    var signature = r.toString(16)+s.toString(16)
    callback(signature,err)
}

function verifyMsg(msg,signature,public,callback) {
    // we need to convert signature and public to the right format
    // q is public key
    var mid = public.length/2
    var q = {
        'x': bigInt(public.slice(0,mid),16),
        'y': bigInt(public.slice(mid),16)
    }
    // r and s is the signature
    var r = bigInt(signature.slice(0,mid),16)
    var s = bigInt(signature.slice(mid),16)
    var result = false
    var z = hash.sha256(msg)
    u1 = bigInt(z.times(s.modInv(curve.n))).mod(curve.n)
    u2 = bigInt(r.times(s.modInv(curve.n))).mod(curve.n)
    try {
        P = addPoints(multiPoints(u1,curve.g),multiPoints(u2,q))
    } catch(e) {
        callback(result)
        return
    }
    result = bigInt(r.mod(curve.n)).equals(P.x.mod(curve.n))
    callback(result)
}

exports.curve = curve
exports.createKeys = createKeys
exports.signMsg = signMsg
exports.verifyMsg = verifyMsg
```

`changepage.js`:

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

`blockchain.js`:

```javascript
const file = require('./file.js')
const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')
const parse = require('./parse.js')

function getBlock(hash,callback) {
    file.get(hash,'blockchain',callback)
}

function checkBalance(key,amount,callback) {
    file.get(key,'balances',(balance) => {
        // returns true if the wallet's balance is
        // less than or equal to the amount requested
        callback(balance >= amount)
    },0)
}

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
            document.getElementById('current-balance').textContent = balance / 1000000
            // save balances
            file.storeAll('wallets',newWallets)
            file.storeAll('balances',balances)
        },'[]')
    })
}

function addBlock(msg) {
    try {
        parse.block(msg.body)
        // if it failed the test, an error will have been thrown
        file.store(hash.sha256hex(JSON.stringify(msg.body)),msg.body,'blockchain')
        console.log('Block added')
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
        if (data === '{}') {
            callback({})
        } else {
            var fullchain = JSON.parse(data)
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
    },'{}')
}

function getChain(top,callback) {
    var mainchain = {}
    file.getAll('blockchain',(data) => {
        if (data === '{}') {
            callback(null)
        } else {
            try {
                var fullchain = JSON.parse(data)
                mainchain[top] = fullchain[top]
                var current = top
                var parent
                while (fullchain[current].parent !== '0000000000000000000000000000000000000000000000000000000000000000') {
                    parent = fullchain[current].parent
                    mainchain[parent] = fullchain[parent]
                    current = parent
                }
            } catch(e) {
                console.warn(e)
                mainchain = null
            } finally {
                callback(mainchain)
            }
        }
    },'{}')
}

function getTopBlock(fullchain,callback) {
    const genesis = '0000000000000000000000000000000000000000000000000000000000000000'
    // get the origin block
    // as there is nothing under it to be wrong
    for (var best in fullchain) {
        if (fullchain[best].parent === genesis) {
            break
        }
    }
    if (typeof best !== 'undefined' && fullchain[best].parent === genesis) {
        // iterates through the fullchain
        for (var key in fullchain) {
            // larger height the better
            if (fullchain[key].height > fullchain[best].height) {
                var candidate = true
                // iterate down the chain to see if you can reach the bottom
                // if the parent is undefined at any point it is not part of the main chain
                // run out of time for a more efficient method
                var current = key
                var parent
                while (fullchain[current].parent !== genesis) {
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
                    while (fullchain[current].parent !== genesis) {
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
            document.getElementById('height').textContent = fullchain[best].height + 1
        }
    } else {
        best = null
    }
    callback(best)
}

exports.get = getBlock
exports.checkBalance = checkBalance
exports.calcBalances = calcBalances
exports.addBlock = addBlock
exports.getTopBlock = getTopBlock
exports.mainChain = mainChain
exports.getChain = getChain
```

`hashing.js`:

```javascript
const crypto = require('crypto')
const bigInt = require('big-integer')

function sha256(data) {
    // creates a sha256 hash, updates it with data, and turns it into a bigint
    var hash = crypto.createHash('sha256').update(data).digest('hex')
    return bigInt(hash,16)
}

function sha256hex(data) {
    return sha256(data).toString(16)
}

exports.sha256 = sha256
exports.sha256hex = sha256hex
```


##### pages

`wallets.js`:

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
            listItem.classList.add('list-item')
            listItem.innerHTML = '<p><b>Name:</b> '+wallet.name+'</p><p><b>Public:</b> '+wallet.public+'</p><p><b>Amount:</b> <span class="money">'+wallet.amount/1000000+'</span></p>'
            walletList.appendChild(listItem)
        })
    },'[]')
}

exports.init = init
```

`wallets-create.js`:

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

`overview.js`:

```javascript
const file = require('../file')
const blockchain = require('../blockchain.js')
const ecdsa = require('../ecdsa.js')

function init() {
    // since it runs when you start the program
    // might as well check all the files exist
    file.getAll('wallets',(data) => {
        if (data === null || data === '' || data === '[]') {
            ecdsa.createKeys((public, private, err) => {
                if(err) {
                    console.error(err)
                    alert(err)
                } else {
                    var wallet = {
                        "name": "My Wallet",
                        "public": public,
                        "private": private,
                        "amount": 0
                    }
                    file.storeAll('wallets',[wallet])
                }
            })
        }
    })
    file.getAll('txpool',(data) => {
        if (data === null || data === '') {
            file.storeAll('txpool',[])
        }
    })
    file.getAll('recenttx',(data) => {
        if (data === null || data === '') {
            file.storeAll('recenttx',[])
        }
    })
    file.getAll('network-settings',(data) => {
        if (data === null || data === '') {
            var defaults = {
                "advertise": "true",
                "target-connections": 5
            }
            file.storeAll('network-settings',defaults)
        }
    })
    file.getAll('blockchain',(data) => {
        if (data === null || data === '' || data === '[]') {
            file.storeAll('blockchain',{})
        }
    })
    file.getAll('balances',(data) => {
        if (data === null || data === '' || data === '[]') {
            file.storeAll('blockchain',{})
        }
    })
    file.getAll('connections',(data) => {
        if (data === null || data === '') {
            file.storeAll('connections',[])
        }
    })
    file.getAll('recent-connections',(data) => {
        if (data === null || data === '') {
            file.storeAll('recent-connections',[])
        }
    })
}

exports.init = init
```

`network-settings.js`:

```javascript
const network = require('../network.js')
const file = require('../file.js')

function init() {

    // setting the current target connections
    file.get('target-connections','network-settings',(target) => {
        document.getElementById('curr').textContent = target
    })

    // ping an IP
    document.getElementById('send').addEventListener('click',() => {
        file.get('advertise','network-settings',(data) => {
            var msg = {
                "header": {
                    "type": "pg"
                },
                "body": {
                    "advertise": data
                }
            }
            network.sendMsg(msg,document.getElementById('sendto').value)
            document.getElementById('pg-save').classList -= 'hidden'
        })
    })

    // saving the "target number of connections"
    document.getElementById('target-save').addEventListener('click',() => {
        var min = document.getElementById('target').value
        file.store('target-connections',min,'network-settings',() => {
            document.getElementById('curr').textContent = min
            document.getElementById('min-save').classList -= 'hidden'
        })
    })

    // saving the advertise toggle
    document.getElementById('save').addEventListener('click',() => {
        var options = document.getElementById('advertise')
        file.store('advertise',options.value,'network-settings',() => {
            document.getElementById('ad-save').classList -= 'hidden'
        })
    })

    // refreshing the cache
    document.getElementById('refresh').addEventListener('click',() => {
        file.storeAll('connections','[]')
        document.getElementById('connections').textContent = 0
        network.connect(false)
        document.getElementById('re-save').classList -= 'hidden'
    })
}

exports.init = init
```

`mine.js`:

```javascript
const Worker = require('tiny-worker')
const blockchain = require('../blockchain.js')
const network = require('../network.js')
const file = require('../file.js')
const remote = require('electron').remote

function init() {
    var miner = null
    var button = document.getElementById('toggle')
    var clear = document.getElementById('clear')
    var pre = document.getElementById('console')

    clear.addEventListener('click',() => {
        pre.innerHTML = ''
    })

    button.addEventListener('click',() => {
        if (button.textContent == 'Start') {
            if (miner === null) {
                try {
                    miner = new Worker('js/mining-script.js')
                    miner.onmessage = (msg) => {
                        if(typeof msg.data === 'string') {
                            pre.innerHTML += msg.data+'<br>'
                        } else {
                            console.log(JSON.stringify(msg.data))
                            blockchain.addBlock(msg.data)
                            network.sendToAll(msg.data)
                        }
                    }
                    // Workers can't get remote so we need to send them the path manually
                    var path = remote.app.getPath('appData')+'/arbitra-client/'
                    miner.postMessage(path)
                } catch(e) {
                    pre.innerHTML = 'Problem starting mining script, sorry :/'
                }
            }
            button.textContent = 'Stop'
        } else {
            if (miner !== null) {
                miner.terminate()
                miner = null
            }
            pre.innerHTML += 'Mining stopped<br>'
            button.textContent = 'Start'
        }
    })
}

exports.init = init
```

`make.js`:

```javascript
const file = require('../file.js')
const parse = require('../parse.js')
const ecdsa = require('../ecdsa.js')
const network = require('../network.js')

function init() {
    addInput()
    var add = document.getElementById('addInput')
    var send = document.getElementById('send')
    add.addEventListener('click',addInput)
    send.addEventListener('click',sendTx)
}

function addInput() {
    var inputGroup = document.createElement('div')
    inputGroup.classList.add('input-group')
    // add select
    // <select name="dropdown"></select>
    var select = document.createElement('select')
    select.name = 'dropdown'
    // add placeholder
    select.innerHTML = '<option value="" selected disabled>Choose a wallet</option>'
    // add actual dropdown items
    populateDropdown(select)
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

function populateDropdown(select) {
    var option
    // get list of wallets
    file.getAll('wallets',(data) => {
        var wallets = JSON.parse(data)
        wallets.forEach((wallet) => {
            option = document.createElement('option')
            option.value = wallet.public
            option.text = wallet.amount/1000000+"au - "+wallet.name
            select.add(option)
        })
    })
}

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

exports.init = init
```

`app-settings.js`:

```javascript
const file = require('../file.js')
const version = require('../../package.json').version
const fs = require('fs')
const network = require('../network.js')
const dialog = require('electron').remote.dialog

function init() {
    document.getElementById('version').textContent = version

    document.getElementById('save').addEventListener('click',() => {
        file.getAll('wallets',(data) => {
            dialog.showSaveDialog({
                    filters: [
                        {name:'JSON',extensions:['json']},
                        {name:'All files',extensions:['*']}
                    ]
                },(file) => {
                fs.writeFile(file,data,(err) => {
                    if (err) throw err
                })
            })
        })
    })

    document.getElementById('clear').addEventListener('click',() => {
        file.storeAll('blockchain',{})
        file.storeAll('balances',{})
        file.storeAll('connections',[])
        file.storeAll('network-settings',{"advertise":"true","target-connections":5})
        file.storeAll('recent-connections',[])
        file.storeAll('txpool',[])
        file.storeAll('recenttx',[])
        file.storeAll('sent',[])
        file.storeAll('error-log',[])
        document.getElementById('ca-save').classList.remove('hidden')
        document.getElementById('connections').textContent = 0
        document.getElementById('height').textContent = 0
        console.warn('All files wiped')
        network.connect(false)
    })
}

exports.init = init
```