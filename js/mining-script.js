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
    var nonce = 0
    var t1, t2
    t1 = Date.now()
    t2 = Date.now()
    while (true) {
        body = block.body
        postMessage('hi')
        // why does this break it?!
        body['nonce'] = nonce
        postMessage('bonjour')
        // t2 is updated every loop
        body['time'] = t2
        postMessage('hello')
        hashBlock(body,(hash) => {
            // checks difficulty
            for (var i = 0; i < body.difficulty; i++) {
                if (hash.charAt(i) == '0') {
                    postMessage('Hash found! Nonce: '+nonce)
                    postMessage(nonce)
                }
            }
            hashes++
            dhash++
            nonce++
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

function rand() {
    return Math.floor(10000000000000000*Math.random())
}

function hashBlock(block,callback) {
    hashed = hash.sha256hex(JSON.stringify(block))
    callback(hashed)
}