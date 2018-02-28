const file = require('../file')

function init() {
    // since it runs when you start the program
    // might as well check all the files exist
    file.get('txpool',(data) => {
        if (data === null) {
            file.storeAll('txpool','[]')
        }
    })
    file.get('network-settings',(data) => {
        if (data === null) {
            var defaults = {
                "advertise": true,
            }
            file.storeAll('txpool',JSON.parse(defaults))
        }
    })
}

exports.init = init