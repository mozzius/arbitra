const remote = require('electron').remote

function sha256 (data) {
  	// creates a sha256 hash, updates it with data, and turns it into a hexadecimal string
    var hash = crypto.createHash('sha256').update(data).digest("hex")
    return hash
}

