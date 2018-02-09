const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')

function tx(msg) {
    var body = JSON.stringify(msg.body)
    ecdsa.verifyMsg(body,msg.body.sign,msg.body.from,(result) => {
        if (!result) {
            throw 'signature'
        } else {
            //need to check that they have enough au
            //blockchain.verifyAmount(msg.body.from,msg.body.amount)
        }
    })
}

exports.tx = tx