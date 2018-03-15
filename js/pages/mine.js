const Worker = require('tiny-worker')
const blockchain = require('../blockchain.js')
const network = require('../network.js')
const file = require('../file.js')
const remote = require('electron').remote

function init() {
    var miner = null
    var button = document.getElementById('toggle')
    var clear = document.getElementById('clear')
    var pre = document.getElementById('console')

    clear.addEventListener('click',() => {
        pre.innerHTML = ''
    })

    button.addEventListener('click',() => {
        if (button.textContent == 'Start') {
            if (miner === null) {
                try {
                    miner = new Worker('js/mining-script.js')
                    miner.onmessage = (msg) => {
                        if(typeof msg.data === 'string') {
                            pre.innerHTML += msg.data+'<br>'
                        } else {
                            console.log(JSON.stringify(msg.data))
                            blockchain.addBlock(msg.data)
                            network.sendToAll(msg.data)
                        }
                    }
                    // Workers can't get remote so we need to send them the path manually
                    var path = remote.app.getPath('appData')+'/arbitra-client/'
                    miner.postMessage(path)
                } catch(e) {
                    pre.innerHTML = 'Problem starting mining script, sorry :/'
                }
            }
            button.textContent = 'Stop'
        } else {
            if (miner !== null) {
                miner.terminate()
                miner = null
            }
            pre.innerHTML += 'Mining stopped<br>'
            button.textContent = 'Start'
        }
    })
}

exports.init = init