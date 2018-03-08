const remote = require('electron').remote
const changePage = require('./js/changepage.js').changePage
const network = require('./js/network.js')
const blockchain = require('./js/blockchain.js')

document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
        const window = remote.getCurrentWindow()
        // Close Buttons
        document.getElementById('min').addEventListener('click',() => {
            window.minimize()
        })
        document.getElementById('max').addEventListener('click',() => {
            if (window.isMaximized()) {
                window.unmaximize()
            } else {
                window.maximize()
            }
        })
        document.getElementById('close').addEventListener('click',() => {
            window.close()
        })

        // Changing pages

        // this opens the initial page
        changePage('overview')

        // event listeners for each button
        // there is probably a better way of doing this
        document.getElementById('overview').addEventListener('click',() => {
            changePage('overview')
        })
        document.getElementById('make').addEventListener('click',() => {
            changePage('make')
        })
        document.getElementById('wallets').addEventListener('click',() => {
            changePage('wallets')
        })
        document.getElementById('history').addEventListener('click',() => {
            changePage('history')
        })
        document.getElementById('view').addEventListener('click',() => {
            changePage('view')
        })
        document.getElementById('mine').addEventListener('click',() => {
            changePage('mine')
        })
        document.getElementById('network-settings').addEventListener('click',() => {
            changePage('network-settings')
        })
        document.getElementById('app-settings').addEventListener('click',() => {
            changePage('app-settings')
        })
        document.getElementById('dev').addEventListener('click',() => {
            // toggle dev tools
            var webcontents = remote.getCurrentWebContents()
            if (webcontents.isDevToolsOpened()) {
                webcontents.closeDevTools()
            } else {
                webcontents.openDevTools()
            }
        })

        // start server
        network.init()
    }
}