const hash = require(__dirname+'/js/hashing.js')
const fs = require('fs')

class Miner {
    constructor(path) {
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
                "type": "bl"
            },
            "body": {
                "difficulty": 7
            }
        }
        fs.readFile(this.path+'blockchain.json','utf-8',(err,data) => {
            if (err) {
                // real problem if this doesn't exist, so throw error
                throw err.message
            }
            var blockchain = JSON.parse(data)

            fs.readFile(this.path+'txpool.json','utf-8',(err,data) => {
                if (err) {
                    // if the file doesn't exist, set content to []
                    if (err.code === 'ENOENT') {
                        data = '[]'
                    } else {
                        alert('Error opening file')
                        throw err
                    }
                }
                var transactions = JSON.parse(data)
                this.block['transactions'] = transactions
            })
        })

        // parent and height
        this.getTopBlock((top) => {
            if (top === null) {
                this.block.body['parent'] = '0000000000000000000000000000000000000000000000000000000000000000'
                this.block.body.height = blockchain[top].height = 0
            }
            this.block.body['parent'] = top
            this.block.body.height = blockchain[top].height+1
        })
        
        fs.readFile(this.path+'wallets.json','utf-8',(err,data) => {
            if (err) {
                throw 'Please create a wallet before hashing'
            }
            var wallets = JSON.parse(data)
            var miner = wallets[0].public
            this.block.body['miner'] = miner
        })

        postMessage('Block formed, mining initiated')
    }

    mine() {
        // repeatedly hashes with a random nonce
        try {
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
                            // get rid of the pending transactions
                            fs.writeFile(this.path+'txpool.json','[]','utf-8',(err) => {
                                if (err) throw err
                                network.sendToAll(this.block)
                                this.block.body.transactions = '[]'
                            })
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
                                            alert('Error opening file')
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
        } catch(e) {
            postMessage(e.message)
        }
    }

    rand(callback) {
        callback(Math.floor(10000000000000000*Math.random()))
    }
    
    hashBlock(block,callback) {
        var hashed = hash.sha256hex(JSON.stringify(block))
        callback(hashed)
    }

    getTopBlock(callback) {
        fs.readFile(this.path+'blockchain.json',(err,data) => {
            if (err) throw err
            if (data === '[]' || data === '') {
                callback(none)
            }
            var blockchain = JSON.parse(data)
            // get the first key in the object
            // doesn't matter if it's best it just needs to be valid
            for (var best in blockchain) {
                // this is the fastest way of getting the first key
                // even if it's kind of messy looking
                // Object.keys(blockchain)[0] puts the whole object into memory
                break
            }
            // iterates through the blockchain
            for (var key in blockchain) {
                // larger height the better
                if (blockchain[key].height > blockchain[best].height) {
                    best = key
                // otherwise, if they're the same pick the oldest one
                } else if (blockchain[key].height === blockchain[best].height) {
                    if (blockchain[key].time < blockchain[best].time) {
                        best = key
                    }
                } 
            }
            callback(best)
        })
    }
}

onmessage = (path) => {
    postMessage('Path recieved')
    try {
        var miner = new Miner(path.data)
        miner.mine()
    } catch(e) {
        postMessage(e)
    }
}