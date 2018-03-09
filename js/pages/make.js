const file = require('../file.js')
const parse = require('../parse.js')
const ecdsa = require('../ecdsa.js')
const network = require('../network.js')

function init() {
    addInput()
    var add = document.getElementById('addInput')
    var send = document.getElementById('send')
    add.addEventListener('click',addInput)
    send.addEventListener('click',sendTx)
}

function addInput() {
    var inputGroup = document.createElement('div')
    inputGroup.classList.add('input-group')
    // add select
    // <select name="dropdown"></select>
    var select = document.createElement('select')
    select.name = 'dropdown'
    // add placeholder
    select.innerHTML = '<option value="" selected disabled>Choose a wallet</option>'
    // add actual dropdown items
    populateDropdown(select)
    // add br
    // <br>
    var br = document.createElement('br')
    // add number input
    // <input name="amount" type="number" placeholder="Amount to send">
    var number = document.createElement('input')
    number.type = 'number'
    number.placeholder = 'Amount to send'
    number.name = 'amount'
    // add them all to the page
    inputGroup.appendChild(select)
    inputGroup.appendChild(br)
    inputGroup.appendChild(number)
    document.getElementById('inputs').appendChild(inputGroup)
}

function populateDropdown(select) {
    var option
    // get list of wallets
    file.getAll('wallets',(data) => {
        var wallets = JSON.parse(data)
        wallets.forEach((wallet) => {
            option = document.createElement('option')
            option.value = wallet.public
            option.text = wallet.amount+"au - "+wallet.name
            select.add(option)
        })
    })
}

function sendTx() {
    console.log('send button clicked')
    var to = document.getElementById('to').value
    // this isn't an array for some reason
    // we can make it one using Array.from
    // https://stackoverflow.com/a/37941811/5453419
    var groups = Array.from(document.getElementsByClassName('input-group'))
    var message = {
        "header": {
            "type": "tx"
        },
        "body": {
            "from": []
        }
    }
    message.body['to'] = to
    file.getAll('wallets',(data) => {
        var time = Date.now()
        var from = []
        if (data === null) {
            document.getElementById('error').classList.remove('hidden')
            return
        } else {
            var convert =  {}
            var wallets = JSON.parse(data)
            wallets.forEach((wallet) => {
                public = wallet.public
                private = wallet.private
                convert[public] = private
            })
        }
        try {
            groups.forEach((group) => {
                var child = group.childNodes
                var wallet = child[0].value
                var amount = child[1].value
                if (wallet && amount) {
                    // carry on
                    var message = amount+to+time
                    var signature = ecdsa.signMsg(message,convert[wallet],(signature) => {
                        message.body.from.push({
                            "wallet": wallet,
                            "amount": amount,
                            "signature": signature
                        })
                    })
                } else {
                    document.getElementById('error').classList.remove('hidden')
                    return
                }
                // if it's invalid, it will throw an error and be caught by the try-catch
                parse.transaction(msg)
                network.sendToAll(msg)
            })
        } catch(e) {
            document.getElementById('error').classList.remove('hidden')
            return
        }
    })
}

exports.init = init