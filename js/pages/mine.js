const Worker = require('tiny-worker')
const blockchain = require('../blockchain.js')
const network = require('../network.js')
const file = require('../file.js')

function init() {
    var miner = null
    var button = document.getElementById('toggle')
    var clear = document.getElementById('clear')
    var pre = document.getElementById('console')

    clear.addEventListener('click',() => {
        pre.textContent = ''
    })

    button.addEventListener('click',() => {
        if (button.textContent == 'Start') {
            if (miner === null) {
                try {
                    miner = new Worker('js/mining-script.js')
                    miner.onmessage = (msg) => {
                        pre.innerHTML += msg.data+'<br>'
                    }
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