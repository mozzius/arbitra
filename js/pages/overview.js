const file = require('../file')

function init() {
    // since it runs when you start the program
    // might as well check all the files exist
    file.getAll('txpool',(data) => {
        if (data === null) {
            file.storeAll('txpool','[]')
        }
    })
    file.getAll('network-settings',(data) => {
        if (data === null) {
            var defaults = {
                "advertise": "true",
            }
            file.storeAll('txpool',JSON.parse(defaults))
        }
    })
    file.getAll('blockchain',(data) => {
        if (data === null) {
            file.storeAll('txpool','[]')
        }
    })
}

exports.init = init