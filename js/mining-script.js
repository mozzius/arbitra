const hash = require(__dirname+'/js/hashing.js')

onmessage = (block) => {
    postMessage('New block received, initiating mining')
    var hash
    var hashes = 0
    var nonce = 0
    var t1, t2
    t1 = Date.now()
    while (true) {
        block['nonce'] = nonce
        hashBlock(block,(hash) => {
            // check difficulty pls
            hashes++
            nonce++
            t2 = Date.now()
            if ((t2-t1) % 100 === 0) {
                var hs = hashes/((t2-t1)/1000)
                postMessage('Hashing at '+hs.toFixed(4)+' hashes/sec - '+hashes+' total')
            }
        })
    }
}

function hashBlock(block,callback) {
    hashed = hash.sha256hex(JSON.stringify(block))
    callback(hashed)
}