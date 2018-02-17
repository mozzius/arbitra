function init() {
    var miner = null
    var button = document.getElementById('toggle')
    var pre = document.getElementById('console')

    button.addEventListener('click',() => {
        if (button.textContent === 'Start') {
            if (miner !== null) {
                // webworkers run in the background so it doesn't stop the app
                miner = new Worker('./mining-script.js')
                miner.onmessage = (msg) => {
                    console.warn(msg.data)
                    pre.innerHTML += msg.data+'<br>'
                }
                button.textContent = 'Stop'
            }
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