const Worker = require('tiny-worker')
const blockchain = require('../blockchain.js')
const network = require('../network.js')
const file = require('../file.js')

function init() {
    var miner = null
    var button = document.getElementById('toggle')
    var clear = document.getElementById('clear')
    var pre = document.getElementById('console')

    miner = new Worker('js/mining-script.js')
    miner.onmessage = (msg) => {
        pre.innerHTML += msg.data+'<br>'
    }

    clear.addEventListener('click',() => {
        pre.textContent = ''
    })

    button.addEventListener('click',() => {
        if (button.textContent == 'Start') {
            miner.postMessage('start')
            button.textContent = 'Stop'
        } else {
            miner.postMessage('stop')
            button.textContent = 'Start'
        }
    })
}

exports.init = init