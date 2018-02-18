const Worker = require('tiny-worker')

function init() {
    var miner = null
    var button = document.getElementById('toggle')
    var pre = document.getElementById('console')

    button.addEventListener('click',() => {
        if (button.textContent == 'Start') {
            if (miner === null) {
                // webworkers run in the background so it doesn't stop the app
                try {
                    miner = new Worker('js/mining-script.js')
                    miner.onmessage = (msg) => {
                        pre.innerHTML += msg.data+'<br>'
                        /*
                        if(typeof msg.data == 'string') {
                            console.log(msg.data)
                            pre.innerHTML += msg.data+'<br>'
                        } else {
                            alert(msg.data)
                        }*/
                    }
                    // change this
                    var time = Date.now()
                    var tempBlock = {
                        "header": {
                            "type": "bl"
                        },
                        "body": {
                            "transactions": "tx goes here"
                        }
                    }
                    tempBlock['time'] = time
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
            button.textContent = 'Start'
        }
    })
}

exports.init = init