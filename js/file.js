const remote = require('electron').remote
const fs = require('fs')

function store(key,data,file) {
    // put data in file
    // no callbacks because it's a subroutine
    var path = remote.app.getPath('appData')+'\\arbitra-client\\'+file+'.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, it creates an empty object literal
            // it will then continue on and create the file later
            if (err.code === 'ENOENT') {
                content = '{}'
            } else {
                alert('Error opening '+file+'.json')
                throw err
            }
        }
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            console.log(jsondata)
            if (jsondata.hasOwnProperty(key) && Array.isArray(data)) {
                // if the key exists it concatenates the two arrays, creates a new set
                // which removes duplicates, then turns it back to an array
                // https://gist.github.com/telekosmos/3b62a31a5c43f40849bb#gistcomment-1826809
                var set = new Set(jsondata[key].concat(data))
                jsondata[key] = Array.from(set)
            } else {
                // otherwise sets the key to the data
                jsondata[key] = data
            }
        } catch(e) {
            console.warn(e)
            var jsondata = {}
            jsondata[key] = data
        } finally {
            // writes the contents back to the file
            // or makes the file if it doesn't exist yet
            content = JSON.stringify(jsondata)
            fs.writeFile(path,content,'utf-8',(err) => {
                if (err) throw err
            })
        }
    })
}

function get(key,file,callback) {
    var path = remote.app.getPath('appData')+'\\arbitra-client\\'+file+'.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, return null
            if (err.code === 'ENOENT') {
                callback(null)
                return
            } else {
                alert('Error opening '+file+'.json')
                throw err
            }
        }
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            var result = jsondata[key]
        } catch(e) {
            // if the key doesn't exist, return null
            console.warn(e)
            var result = null
        } finally {
            callback(result)
            return
        }
    })
}

exports.store = store
exports.get = get