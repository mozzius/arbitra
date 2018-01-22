const ecdsa = require('./ecdsa.js')
const bigInt = require('big-integer')

function init() {
    console.log("testing.js loaded")
    ecdsa.createKeys((public,private,err) => {
        if (err) {
            alert("Error: "+err)
            throw err
        } else {
            console.log(private.toString(16))
            console.log(public.x.toString(16))
            console.log(public.y.toString(16))
            ecdsa.signMsg("bean",private,(r,s,err) => {
                if (err) {
                    alert("Error: "+err)
                    throw err
                } else {
                    console.log(r.toString(16))
                    console.log(s.toString(16))
                    ecdsa.verifyMsg("bean",r,s,public,(result) => {
                        console.log(result)
                    })
                }
            })
        }
    })
}

exports.init = init

/*

function sha256(data) {
    // creates a sha256 hash, updates it with data, and turns it into a hexadecimal string
    var hash = crypto.createHash('sha256').update(data).toString('hex')
    return hash
}

var message = {
    "header": {
        "type": "transaction",
        "hash": "",
        "from": "127.0.0.1"
    },
    "body": {
        "sender": "me",
        "reciever": "also me",
        "amount": 12,
        "time": Date.now()
    }
}

message.header.hash = hashBody(message)

function hashBody(json) {
    var body = JSON.stringify(json.body)
    return sha256(body)
}

function parseMessage(message) {
    try {
        msgjson = JSON.parse(message)
    } catch (e) {
        console.log("Message does not parse as JSON")
        // should send back error to the person who sent it.
        return
    }
    if (msgjson.header.type == "transaction") {
        console.log("It's a transaction")
    } else {
        console.log("Message type unknown")
    }
    var msghash = hashBody(msgjson)
    if (msgjson.header.hash === msghash) {
        console.log("hash matches")
    } else {
        console.log("hash does not match")
    }
}

parseMessage(JSON.stringify(message))

*/