const remote = require("electron").remote
const fs = require("fs")
const net = require("net")

function changePage(name) {
    var path = "pages\\"+name+".html"
    fs.readFile(path, 'utf-8', (err, data) => {
        if (err) {
            alert("An error ocurred reading the file :" + err.message)
            console.warn("An error ocurred reading the file :" + err.message)
            return
        }
        console.log("Page change: "+name)
        document.getElementById("body").innerHTML = data
        const pageJS = require("./js/"+name+".js")
        pageJS.init()
    })
}

document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        const window = remote.getCurrentWindow()
        // Close Buttons
        document.getElementById("min").addEventListener("click", function (e) {
            window.minimize()
        })
        document.getElementById("max").addEventListener("click", function (e) {
            if (window.isMaximized()) {
                window.unmaximize()
            } else {
                window.maximize()
            }	
        })
        document.getElementById("close").addEventListener("click", function (e) {
            window.close()
        })

        // Changing pages
    
        // this opens the initial page
        changePage("testing")

        document.getElementById("overview").addEventListener("click", function () {
            changePage("overview")
        })
        document.getElementById("testing").addEventListener("click", function () {
            changePage("testing")
        })
    }
}