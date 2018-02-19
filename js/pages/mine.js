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
                    var blockTemplate = {
                        "header": {
                            "type": "bl"
                        },
                        "body": {}
                    }

                    ///////////////////////////////////
                    // PROBLEM: SENDING NEW MESSAGES //
                    // DOESN'T STOP THE OLD HASHING  //
                    ///////////////////////////////////

                    // create a block
                    var currentBlock
                    blockchain.createBlock((block) => {
                        currentBlock = block
                        // creates a webworker, which runs independently
                        // TODO: run from renderer.js so it truely runs in the background
                        miner = new Worker('js/mining-script.js')
                        miner.onmessage = (msg) => {
                            if (typeof msg.data == 'string') {
                                console.log(msg.data)
                                pre.innerHTML += msg.data+'<br>'
                                // checks that the block hasn't changed
                                // and updates the worker if necessary
                                blockchain.createBlock((updateBlock) => {
                                    if (currentBlock !== updateBlock) {
                                        miner.postMessage(updateBlock.body)
                                        currentBlock = updateBlock
                                    }
                                })
                            } else {
                                var sendMe = blockTemplate
                                sendMe.body = msg.data
                                console.warn('Block mined!')
                                blockchain.addBlock(sendMe)
                                network.sendToAll(sendMe)
                                // start hashing the next block
                                blockchain.createBlock((newBlock) => {
                                    miner.postMessage(newBlock.body)
                                    currentBlock = newBlock
                                })
                            }
                        }

                        // send first block
                        miner.postMessage(block.body)
                    })

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