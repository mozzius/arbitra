const file = require('../file.js')
const version = require('../../package.json').version
const fs = require('fs')
const dialog = require('electron').remote.dialog

function init() {
    document.getElementById('version').textContent = version

    document.getElementById('save').addEventListener('click',() => {
        file.getAll('wallets',(data) => {
            dialog.showSaveDialog({
                    filters: [
                        {name:'JSON',extensions:['json']},
                        {name:'All files',extensions:['*']}
                    ]
                },(file) => {
                fs.writeFile(file,data,(err) => {
                    if (err) throw err
                })
            })
        })
    })

    document.getElementById('clear').addEventListener('click',() => {
        file.storeAll('blockchain',{})
        file.storeAll('balances',{})
        file.storeAll('connections',[])
        file.storeAll('network-settings',{"advertise":"true","target-connections":5})
        file.storeAll('recent-connections',[])
        file.storeAll('txpool',[])
        file.storeAll('sent',[])
        file.storeAll('error-log',[])
        document.getElementById('ca-save').classList.remove('hidden')
        console.warn('All files wiped')
    })
}

exports.init = init