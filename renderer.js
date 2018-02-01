const remote = require('electron').remote
const fs = require('fs')
const network = require('./js/network.js')

function changePage(name) {
    var path = 'pages\\' + name + '.html'
    fs.readFile(path, 'utf-8', (err, data) => {
        if (err) {
            alert('An error ocurred reading the file :' + err.message)
            console.warn('An error ocurred reading the file :' + err.message)
            return
        }
        console.log('Page change: ' + name)
        document.getElementById('body').innerHTML = data
        const pageJS = require('./js/' + name + '.js')
        pageJS.init()
    })
}

document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
        const window = remote.getCurrentWindow()
        // Close Buttons
        document.getElementById('min').addEventListener('click', function (e) {
            window.minimize()
        })
        document.getElementById('max').addEventListener('click', function (e) {
            if (window.isMaximized()) {
                window.unmaximize()
            } else {
                window.maximize()
            }
        })
        document.getElementById('close').addEventListener('click', function (e) {
            window.close()
        })

        // Changing pages

        // this opens the initial page
        changePage('overview')

        // event listeners for each button
        // there is probably a better way of doing this
        document.getElementById('overview').addEventListener('click', function () {
            changePage('overview')
        })
        document.getElementById('make').addEventListener('click', function () {
            changePage('make')
        })
        document.getElementById('wallets').addEventListener('click', function () {
            changePage('wallets')
        })
        document.getElementById('history').addEventListener('click', function () {
            changePage('history')
        })
        document.getElementById('view').addEventListener('click', function () {
            changePage('view')
        })
        document.getElementById('mine').addEventListener('click', function () {
            changePage('mine')
        })
        document.getElementById('network').addEventListener('click', function () {
            changePage('network')
        })
        document.getElementById('app').addEventListener('click', function () {
            changePage('app')
        })
        document.getElementById('testing').addEventListener('click', function () {
            changePage('testing')
        })
        document.getElementById('dev').addEventListener('click', function () {
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
