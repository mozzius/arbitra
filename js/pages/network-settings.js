const network = require('../network.js')
const file = require('../file.js')

function init() {

    // setting the current target connections
    file.get('target-connections','network-settings',(target) => {
        document.getElementById('curr').textContent = target
    })

    // ping an IP
    document.getElementById('send').addEventListener('click',() => {
        file.get('advertise','network-settings',(data) => {
            var msg = {
                "header": {
                    "type": "pg"
                },
                "body": {
                    "advertise": data
                }
            }
            network.sendMsg(msg,document.getElementById('sendto').value)
            document.getElementById('pg-save').classList -= 'hidden'
        })
    })

    // saving the "target number of connections"
    document.getElementById('target-save').addEventListener('click',() => {
        var min = document.getElementById('target').value
        file.store('target-connections',min,'network-settings',() => {
            document.getElementById('curr').textContent = min
            document.getElementById('min-save').classList -= 'hidden'
        })
    })

    // saving the advertise toggle
    document.getElementById('save').addEventListener('click',() => {
        var options = document.getElementById('advertise')
        file.store('advertise',options.value,'network-settings',() => {
            document.getElementById('ad-save').classList -= 'hidden'
        })
    })

    // refreshing the cache
    document.getElementById('refresh').addEventListener('click',() => {
        file.storeAll('connections','[]')
        document.getElementById('connections').textContent = 0
        network.connect(false)
        document.getElementById('re-save').classList -= 'hidden'
    })
}

exports.init = init