const hash = require(__dirname+'/js/hashing.js')
const fs = require('fs')

class Miner {
    constructor(path) {
        const difficulty = 5
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

        // talk about switching to syncronous

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

    getTopBlock() {
        try {
            var data = fs.readFileSync(this.path+'blockchain.json','utf8')
        } catch(e) {
            return null
        }
        if (data === '{}' || data === '') {
            return null
        }
        var fullchain = JSON.parse(data)
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
        return best
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