const file = require('./file.js')
const changePage = require('./changepage').changePage

function init() {
    document.getElementById('create').addEventListener('click', function () {
        changePage('make')
    })
    file.getAll('recenttx',(data) => {
        transactions = JSON.parse(data)
        var txList = document.getElementById('tx-list')
        var listItem
        if (transactions) {
            transactions.forEach((tx) => {
                listItem = document.createElement('div')
                listItem.classList.add('list-item')
                // timestamp to date
                // from https://stackoverflow.com/a/35890537
                var date = new Date(tx.time*1000).toISOString().slice(-13, -5)
                listItem.innerHTML = '<p><b>Time:</b> '+date+'</p><p><b>To:</b> '+tx.to+'</p><p><b>Amount:</b> <span class="money">'+tx.amount+'</span></p>'
                txList.appendChild(listItem)
            })
        }
    })
}

exports.init = init