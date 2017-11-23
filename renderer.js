const remote = require("electron").remote
const crypto = require("crypto")
const fs = require("fs")
const net = require("net")

function changePage(name) {
  var path = "pages\\"+name+".html"
  fs.readFile(path, 'utf-8', (err, data) => {
    if (err) {
      alert("An error ocurred reading the file :" + err.message)
      console.log("An error ocurred reading the file :" + err.message)
      return
    }
    console.log("Page change: "+name)
    document.getElementById("body").innerHTML = data
  })
}

function sha256(data) {
  // creates a sha256 hash, updates it with data, and turns it into a hexadecimal string
  var hash = crypto.createHash('sha256').update(data).digest("hex")
  return hash
}

document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    // Close Buttons
    document.getElementById("min").addEventListener("click", function (e) {
      const window = remote.getCurrentWindow()
      window.minimize()
    })
    document.getElementById("max").addEventListener("click", function (e) {
      const window = remote.getCurrentWindow()
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }	
    })
    document.getElementById("close").addEventListener("click", function (e) {
      const window = remote.getCurrentWindow()
      window.close()
    })

    // Changing pages
    // Default is overview
    changePage("overview")

    document.getElementById("overview").addEventListener("click", function () {
      changePage("overview")
    })
    document.getElementById("testing").addEventListener("click", function () {
      changePage("testing")
    })
  }
}