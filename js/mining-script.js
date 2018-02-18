const hash = require(__dirname+'/js/hashing.js')

onmessage = (block) => {
    postMessage('New block received, initiating')
    var hash
    var hashes = 0
    var nonce = 0
    while (true) {
        block['nonce'] = nonce
        hashBlock(block,(hash) => {
            postMessage('Nonce as '+nonce+' gives '+hashed)
        })
        // check difficulty
        hashes++
        nonce++
    }
}

function hashBlock(block,callback) {
    hashed = hash.sha256hex(JSON.stringify(block))
    callback(hashed)
}