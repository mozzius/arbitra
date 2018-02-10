const file = require('./file.js')
const changePage = require('./changepage').changePage

function init() {
    document.getElementById('create').addEventListener('click', function () {
        changePage('wallets-create')
    })
    file.getAll('wallets',(data) => {
        wallets = JSON.parse(data)
        var walletList = document.getElementById('wallet-list')
        var listItem
        if (wallets) {
            wallets.forEach((wallet) => {
                listItem = document.createElement('div')
                listItem.classList.add('list-item')
                listItem.innerHTML = '<p><b>Name:</b> '+wallet.name+'</p><p><b>Public:</b> '+wallet.public+'</p><p><b>Amount:</b> <span class="money">'+wallet.amount+'</span></p>'
                walletList.appendChild(listItem)
            })
        }
    })
}

exports.init = init
