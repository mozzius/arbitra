const file = require('../file.js')

function init() {
    document.getElementById('clear').addEventListener('click',() => {
        file.storeAll('blockchain',[])
        file.storeAll('connections',[])
        file.storeAll('network-settings',{"advertise":"true","target-connections":5})
        file.storeAll('recent-connections',[])
        file.storeAll('txpool',[])
        document.getElementById('ca-save').classList.remove('hidden')
    })
}

exports.init = init