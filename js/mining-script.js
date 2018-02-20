const hash = require(__dirname+'/js/hashing.js')

onmessage = (block) => {
    postMessage('New block received, initiating mining')
    // the hash, initialised in advance
    var hash
    // different in hashes between prints
    var dhash = 0
    // total number of hashes
    var hashes = 0
    var body = block.data
    var t1, t2, tt
    t1 = Date.now()
    t2 = Date.now()
    tt = Date.now()
    while (true) {
        mine(body)
    }
}

function mine(body,callback) {
    // generate random nonce
    rand((nonce) => {
        body['nonce'] = nonce
        // t2 is updated every loop
        body['time'] = t2
        hashBlock(body,(hash) => {
            hashes++
            dhash++
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
            } else {
                // printing for the console
                t2 = Date.now()
                if ((t2-t1) > 10000) {
                    // calculate hashes per second (maybe)
                    // *1000 turns it into seconds
                    var hs = (dhash/(t2-t1))*1000
                    dhash = 0
                    t1 = Date.now()
                    postMessage('Hashing at '+hs.toFixed(3)+' hashes/sec - '+hashes+' hashes in '+Math.floor((t1-tt)/1000)+' seconds')
                }
            }
        })
    })
}

function rand(callback) {
    callback(Math.floor(10000000000000000*Math.random()))
}

function hashBlock(block,callback) {
    hashed = hash.sha256hex(JSON.stringify(block))
    callback(hashed)
}

/* 

OLD CODE FROM MINE.JS

var blockTemplate = {
    "header": {
        "type": "bl"
    },
    "body": {}
}

var currentBlock
blockchain.createBlock((block) => {
    currentBlock = block
    // creates a webworker, which runs independently
    // TODO: run from renderer.js so it truely runs in the background
    miner = new Worker('js/mining-script.js')
    miner.onmessage = (msg) => {
        if (typeof msg.data == 'string') {
            console.log(msg.data)
            pre.innerHTML += msg.data+'<br>'
            // checks that the block hasn't changed
            // and updates the worker if necessary
            blockchain.createBlock((updateBlock) => {
                if (currentBlock !== updateBlock) {
                    miner.postMessage(updateBlock.body)
                    currentBlock = updateBlock
                }
            })
        } else {
            var sendMe = blockTemplate
            sendMe.body = msg.data
            console.warn('Block mined!')
            blockchain.addBlock(sendMe)
            network.sendToAll(sendMe)
            // start hashing the next block
            blockchain.createBlock((newBlock) => {
                miner.postMessage(newBlock.body)
                currentBlock = newBlock
            })
        }
    }

    // send first block
    miner.postMessage(block.body)
})
*/