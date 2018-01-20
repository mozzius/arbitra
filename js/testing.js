const ecdsa = require('ecdsa.js')

ecdsa.createKeys(function(public,private) {
    console.log(public)
    console.log(private)
})