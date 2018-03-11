const file = require('../file')

function init() {
    // since it runs when you start the program
    // might as well check all the files exist
    file.getAll('wallets',(data) => {
        if (data === null) {
            ecdsa.createKeys((public, private, err) => {
                if(err) {
                    console.error(err)
                    alert(err)
                } else {
                    var wallet = {
                        "name": "My Wallet",
                        "public": public,
                        "private": private,
                        "amount": 0
                    }
                    file.storeAll('wallets',wallet)
                }
            })
        }
    })
    file.getAll('txpool',(data) => {
        if (data === null || data === '') {
            file.storeAll('txpool',[])
        }
    })
    file.getAll('network-settings',(data) => {
        if (data === null || data === '') {
            var defaults = {
                "advertise": "true",
                "target-connections": 5
            }
            file.storeAll('network-settings',defaults)
        }
    })
    file.getAll('blockchain',(data) => {
        if (data === null || data === '' || data === '[]') {
            file.storeAll('blockchain',{})
        }
    })
    file.getAll('connections',(data) => {
        if (data === null || data === '') {
            file.storeAll('connections',[])
        }
    })
    file.getAll('recent-connections',(data) => {
        if (data === null || data === '') {
            file.storeAll('recent-connections',[])
        }
    })
}

exports.init = init