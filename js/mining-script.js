const hash = require(__dirname+'/js/hashing.js')

onmessage = (block) => {
    postMessage('New block received, initiating mining')
    // the hash, initialised in advance
    var hash
    // different in hashes between prints
    var dhash = 0
    // total number of hashes
    var hashes = 0
    // the nonce
    var nonce
    var t1, t2
    t1 = Date.now()
    tt = Date.now()
    while (true) {
        block['nonce'] = nonce
        hashBlock(block,(hash) => {
            // generates a random integer as the nonce
            // iterating produces a race between clients
            // that only the fastest computer will win
            // so you're better off guessing
            nonce = Math.floor(10000000000000000*Math.random())
            // checks difficulty
            for (var i = 0; i < block.body.difficulty; i++) {
                if (hash.charAt(i) == '0') {
                    postMessage('Hash found! Nonce: '+nonce)
                    postMessage(nonce)
                }
            }
            hashes++
            dhash++
            // printing for the console
            t2 = Date.now()
            if ((t2-t1) > 1000) {
                // calculate hashes per second (maybe)
                // *1000 turns it into seconds
                var hs = (dhash/(t2-t1))*1000
                dhash = 0
                t1 = Date.now()
                postMessage('Hashing at '+hs.toFixed(3)+' hashes/sec - '+hashes+' hashes in '+Math.floor((t1-tt)/1000)+' seconds')
            }
        })
    }
}

function hashBlock(block,callback) {
    hashed = hash.sha256hex(JSON.stringify(block))
    callback(hashed)
}