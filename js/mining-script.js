const hash = require(__dirname+'/js/hashing.js')
const fs = require('fs')

class Miner {
    constructor(path) {
        this.path = path
        // determine difficulty some other way
        this.block = {
            "header": {
                "type": "bl"
            },
            "body": {}
        }
        fs.readFile(this.path+'blockchain.json','utf-8',(err,data) => {
            if (err) {
                // real problem if this doesn't exist, so throw error
                throw err.message
            }
            var blockchain = JSON.parse(data)

            // this is for the printing later
            this.hashes = 0
            this.dhash = 0
            this.t1 = Date.now()
            this.t2 = Date.now()
            this.tt = Date.now()
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
                postMessage('Block formed, mining initiated')
            })
        })
        /*
        // need to add this but without depending on file
        file.getAll('wallets',(data2) => {
            var wallets = JSON.parse(data2)
            block.body['miner'] = wallets[0]

            // gets the parent block
            file.get('latest','blockchain',(data3) => {
                var latest = JSON.parse(data3)
                block.body['parent'] = latest

                // return the block
                callback(block)
            })
        })
        */
    }

    mine() {
        // repeatedly hashes with a random nonce
        try {
            while (true) {
                var body = this.block.body
                this.rand((nonce) => {
                    body['nonce'] = nonce
                    // t2 is updated every loop
                    body['time'] = this.t2
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

                        // this triggers if the block has passed the difficulty test
                        if (pass) {
                            postMessage('Hash found! Nonce: '+nonce)
                            postMessage(hash)
                            // get rid of the pending transactions
                            fs.writeFile(this.path+'txpool.json','[]','utf-8',(err) => {
                                if (err) throw err
                                network.sendToAll(this.block)
                            })
                        } else {
                            // printing for the console
                            this.t2 = Date.now()
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

    getDifficulty(blockhash,callback) {
        var difficulty
        fs.readFile(this.path+'blockchain.json',(err,data) => {
            // even if file is empty throw as that's a problem
            if (err) throw err
            var blockchain = JSON.parse(data)
            var oldtime = blockchain[blockhash].time
            if (Date.now - oldtime < 60000) {
                difficulty = blockchain[blockhash].difficulty + 1
            } else {
                difficulty = blockchain[blockhash].difficulty
            }
            callback(difficulty)
        })
    }

    getTopBlock() {
        fs.readFile(this.path+'blockchain.json',(err,data) => {
            if (err) throw err
            var blockchain = JSON.parse(data)
            // get the first key in the object
            // doesn't matter if it's best it just needs to be valid
            var best = Object.keys(ahash)[0]
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