const file = require('../file.js')
const changePage = require('../changepage').changePage
const blockchain = require('../blockchain.js')

function init() {
    document.getElementById('create').addEventListener('click',() => {
        changePage('wallets-create')
    })
    blockchain.calcBalances()
    file.getAll('wallets',(data) => {
        wallets = JSON.parse(data)
        var walletList = document.getElementById('wallet-list')
        var listItem
        if (wallets) {
            wallets.forEach((wallet) => {
                listItem = document.createElement('div')
                listItem.classList.add('list-item')
                listItem.innerHTML = '<p><b>Name:</b> '+wallet.name+'</p><p><b>Public:</b> '+wallet.public+'</p><p><b>Amount:</b> <span class="money">'+wallet.amount/1000000+'</span></p>'
                walletList.appendChild(listItem)
            })
        }
    })
}

exports.init = init
