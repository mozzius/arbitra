const hash = require(__dirname+'/js/hashing.js')
const network = require(__dirname+'/js/network.js')
const file = require(__dirname+'/js/file.js')
const remote = require('electron').remote

class Miner {
    constructor(block) {
        this.go = false
        this.block = block
        this.hashes = 0
        this.dhash = 0
        this.t1 = Date.now()
        this.t2 = Date.now()
        this.tt = Date.now()
        file.getAll('txpool',(data) => {
            if (data === null) {
                this.block['transactions'] = []
            } else {
                var transactions = JSON.parse(data)
                this.block['transactions'] = transactions
            }
            // hash the transactions to see if there's any difference later
            hash.sha256hex(this.block.transactions,(hashed) => {
                this.txhash = hashed
            })
        })
    }

    mine() {
        while (this.go) {
            var body = this.block.body
            this.rand((nonce) => {
                body['nonce'] = nonce
                // t2 is updated every loop
                body['time'] = t2
                this.hashBlock(body,(hash) => {
                    this.hashes++
                    this.dhash++
                    // checks difficulty
                    var pass = true
                    for (var i = 0; i < body.difficulty; i++) {
                        if (hash.charAt(i) !== 'a') {
                            pass = false
                        }
                    }
                    if (pass) {
                        postMessage('Hash found! Nonce: '+nonce)
                        postMessage(hash)
                        // do stuff
                        file.storeAll('txpool','[]')
                        network.sendToAll(this.block)
                    } else {
                        // printing for the console
                        t2 = Date.now()
                        if ((t2-t1) > 10000) {
                            // calculate hashes per second (maybe)
                            // *1000 turns it into seconds
                            var hs = (dhash/(t2-t1))*1000
                            dhash = 0
                            this.t1 = Date.now()
                            postMessage('Hashing at '+hs.toFixed(3)+' hashes/sec - '+hashes+' hashes in '+Math.floor((t1-tt)/1000)+' seconds')
                            // check to see if the block has updated
                            file.getAll('txpool',(data) => {
                                var current = JSON.stringify(this.block.body.transactions)
                                if (current !== data) {
                                    var newtx = JSON.stringify(data)
                                    this.block.body['transactions'] = newtx
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
        hashed = hash.sha256hex(JSON.stringify(block))
        callback(hashed)
    }

    switch(to) {
        if (to === "start") {
            this.go = true
        } else {
            this.go = false
        }
    }
}

var blockTemplate = {
    "header": {
        "type": "bl"
    },
    "body": {}
}

var miner = new Miner(blockTemplate)
miner.mine(blockTemplate)

onmessage = (msg) => {
    miner.toggle(msg.data)
}