const Worker = require('tiny-worker')
const blockchain = require('../blockchain.js')
const network = require('../network.js')

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
                // webworkers run in the background so it doesn't stop the app
                try {
                    miner = new Worker('js/mining-script.js')
                    miner.onmessage = (msg) => {
                        if(typeof msg.data == 'string') {
                            console.log(msg.data)
                            pre.innerHTML += msg.data+'<br>'
                        } else {
                            console.warn(msg.data)
                            blockchain.addBlock()
                        }
                    }
                    // change this
                    var tempBlock = {
                        "header": {
                            "type": "bl"
                        },
                        "body": {
                            "transactions": "tx goes here",
                            "difficulty": 5
                        }
                    }
                    // send new block
                    miner.postMessage(tempBlock)
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