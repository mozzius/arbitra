const file = require('../file.js')
const version = require('../../package.json').version

function init() {
    console.error(version)
    document.getElementById('version').textContent = version
    document.getElementById('clear').addEventListener('click',() => {
        file.storeAll('blockchain',[])
        file.storeAll('connections',[])
        file.storeAll('network-settings',{"advertise":"true","target-connections":5})
        file.storeAll('recent-connections',[])
        file.storeAll('txpool',[])
        file.storeAll('sent',[])
        file.storeAll('error-log',[])
        document.getElementById('ca-save').classList.remove('hidden')
    })
}

exports.init = init