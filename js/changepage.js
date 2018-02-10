const remote = require('electron').remote
const fs = require('fs')

function changePage(name) {
    var path = '..\\arbitra-client\\pages\\' + name + '.html'
    fs.readFile(path, 'utf-8', (err, data) => {
        if (err) {
            alert('An error ocurred reading the file: ' + err.message)
            console.warn('An error ocurred reading the file: ' + err.message)
            return
        }
        console.info('Page change: ' + name)
        document.getElementById('body').innerHTML = data
        try {
            const pageJS = require('./'+name + '.js')
            pageJS.init()
        } catch(e) {
            console.error(e)
        }
    })
}

exports.changePage = changePage