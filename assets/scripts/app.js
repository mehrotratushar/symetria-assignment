var app = new Vue({
    el: '#app',
    data: {
        connected: false,
        error: false,
        statusHeading: 'Status',
        statusTitle: 'Connecting',
        statusMessage: 'One moment, please.',
        panelHeading: 'Your Portfolio',
        panelSubheading: 'Portfolio Value',
        portfolio: [],
        portfolioValue: 0,
        portfolioValueFormatted: '',
        portfolioValueChangeType: 'ChangeNone',
        portfolioValueChangeSign: '',
        portfolioValueChange: 0,
        portfolioValueChangeFormatted: '',
        connecting: true,
        show: false
    },
    methods: {
        connect: function (event) {
            connectToAPI();
        }
    }

});

const providers = {
    btc: {
        id: 'btc',
        identifier: 'BTC',
        name: 'Bitcoin',
        url: 'https://bitcoin.org/'
    },
    doge: {
        id: 'doge',
        identifier: 'DOGE',
        name: 'Dogecoin',
        url: 'https://dogecoin.com/'
    },
    eth: {
        id: 'eth',
        identifier: 'ETH',
        name: 'Ethereum',
        url: 'https://www.ethereum.org/'
    },
    ltc: {
        id: 'ltc',
        identifier: 'LTC',
        name: 'Litecoin',
        url: 'https://litecoin.com/'
    },
    mxr: {
        id: 'mxr',
        identifier: 'MXR',
        name: 'MaxVR',
        url: 'https://mxrcoin.com/'
    },
    xmr: {
        id: 'xmr',
        identifier: 'XMR',
        name: 'Monero',
        url: 'https://monero.org/'
    }
}

const portfolio = connectToAPI();

const formatNumber = (x) => {
  return x.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function connectToAPI() {
    app.connecting = true;
    app.statusTitle = 'Connecting';
    app.statusMessage = 'One moment, please.';
    let data = GetWallets().then(response => {
        console.log(response);
        app.connected = true;
        app.panelHeading = 'Your Portfolio';
        app.panelSubheading = 'Portfolio Value';
        app.portfolio = mergeData(response);
        app.connecting = false;
        app.error = false;
        app.show = true;
    }).catch(e => {
        console.log(e);
        app.connecting = false;
        app.connected = false;
        app.error = true;
        app.statusTitle = 'Server Error'
        app.statusMessage = e;
    });
    return data;
}

function mergeData(arr) {
    let items = [];
    arr.map(item => {
        let key = item.currency.toLowerCase();
        item.id = providers[key].id;
        item.identifier = providers[key].identifier;
        item.name = providers[key].name;
        item.url = providers[key].url;
        item.svg = 'assets/images/icons/icons.svg#' + key;
        item.rate = ExchangeRatesToCAD.filter(rate => rate.currency == item.identifier)[0].rate;
        item.amountCDN = (item.amount * item.rate).toFixed(2);
        item.amountCDNFormatted = formatNumber(Math.abs(item.amountCDN));
        item.changeType = item.changeToday > 0 ? 'ChangeUp' : item.changeToday == 0 ? 'ChangeNone' : 'ChangeDown';
        item.changeSign = item.changeToday > 0 ? '+' : item.changeToday == 0 ? '' : '–';
        item.changeTodayCDN = (item.changeToday * item.rate).toFixed(2);
        item.changeTodayCDNFormatted = formatNumber(Math.abs(item.changeTodayCDN));
        items.push(item);

        app.portfolioValue += Number(item.amountCDN);
        app.portfolioValueChange += Number(item.changeTodayCDN);

    });

    app.portfolioValueChangeType = app.portfolioValueChange > 0 ? 'ChangeUp' : app.portfolioValueChange == 0 ? 'ChangeNone' : 'ChangeDown';
    app.portfolioValueChangeSign = app.portfolioValueChange > 0 ? '+' : app.portfolioValueChange == 0 ? '' : '–';
    app.portfolioValueFormatted = "$C" + formatNumber(Math.abs(app.portfolioValue));
    app.portfolioValueChangeFormatted = app.portfolioValueChangeSign + "$C" + formatNumber(Math.abs(app.portfolioValueChange));

    return items;
}
