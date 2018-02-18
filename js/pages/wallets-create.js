const ecdsa = require('../ecdsa.js')
const changePage = require('../changepage').changePage
const file = require('../file.js')

function init() {
    ecdsa.createKeys((public, private, err) => {
        if(err) {
            console.error(err)
            changePage('wallets')
        } else {
            document.getElementById('public').innerText = public
            document.getElementById('private').innerText = private
        }
    })
    document.getElementById('create').addEventListener('click',() => {
        var name = document.getElementById('name').value
        console.log('Creating wallet: '+name)
        var data = {}
        data['name'] = name
        data['public'] = document.getElementById('public').textContent
        data['private'] = document.getElementById('private').textContent
        data['amount'] = '0'
        console.log(JSON.stringify(data))
        file.append('wallets',data,() => {
            changePage('wallets')
        })
    })
}

exports.init = init