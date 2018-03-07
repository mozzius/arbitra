const network = require('../network.js')
const file = require('../file.js')

function init() {

    file.get('target-connections','network-settings',(target) => {
        document.getElementById('curr').textContent = target
    })

    document.getElementById('send').addEventListener('click',() => {
        file.get('advertise','network-settings',(data) => {
            var msg = {
                "header": {
                    "type": "pg",
                },
                "body": {
                    "advertise": data
                }
            }
            network.sendMsg(msg,document.getElementById('sendto').value)
            document.getElementById('pg-save').classList -= 'hidden'
        })
    })

    document.getElementById('target-save').addEventListener('click',() => {
        var min = document.getElementById('min').value
        console.error(min)
        file.store('target-connections',min,'network-settings',() => {
            document.getElementById('curr').textContent = min
            document.getElementById('min-save').classList -= 'hidden'
        })
    })

    document.getElementById('save').addEventListener('click',() => {
        var options = document.getElementById('advertise')
        file.store('advertise',options.value,'network-settings',() => {
            document.getElementById('ad-save').classList -= 'hidden'
        })
    })

    document.getElementById('refresh').addEventListener('click',() => {
        network.connect()
        document.getElementById('re-save').classList -= 'hidden'
    })
}

exports.init = init