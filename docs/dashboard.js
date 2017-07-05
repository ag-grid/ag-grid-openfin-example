function initAppPanels() {
    let exchangeService = new ExchangeService();
    exchangeService.init();

    let fxDataService = new FxDataService();
    fxDataService.init();

    let stockHistoricalChart = new StockHistoricalChart();
    stockHistoricalChart.init("historyGraph");

    let stockDetailPanel = new StockDetailPanel();
    stockDetailPanel.init(exchangeService, stockHistoricalChart);

    let priceChangesGrid = new PriceChangesGrid();
    priceChangesGrid.init(exchangeService, stockDetailPanel);

    let fxQuoteMatrix = new FxQuoteMatrix();
    fxQuoteMatrix.init(fxDataService);

    let topMoversGrid = new TopMoversGrid();
    topMoversGrid.init(fxDataService);

    fxDataService.addFxDataSubscriber(fxQuoteMatrix);
    fxDataService.addFxTopMoverSubscriber(topMoversGrid);

    priceChangesGrid.render("priceChangesGrid");
    topMoversGrid.render("topMovers");
    fxQuoteMatrix.render("quoteMatrix");
}

function createBlankTearout(name) {
    const onSuccess = function (e) {
    };

    const onFail = function (e) {
    };

    return new fin.desktop.Window({
        "name": "tearout" + name,
        'defaultWidth': 430,
        'defaultHeight': 470,
        defaultTop: 100,
        'autoShow': false,
        'opacity': 1,
        // 'url': 'about:blank',
        'url': 'http://localhost:8000/examples/trader-dashboard/tearOutWindow.html', //note this must be a valid url, or 'about:blank'
        'frame': true,
        'resizable': false,
        'maximizable': true,
        'saveWindowState': false,
        'showTaskbarIcon': false
    }, onSuccess, onFail);
}

function initTearoutListeners() {
    // get all the divs which have a draggable property and covert them into an Array from a nodeList - there'll only
    // be one in our example
    const detailPanel = [].slice.call(document.querySelectorAll('div[draggable]'))[0];
    detailPanel.addEventListener('dragend', onDragEnd, false);

    externalChildWindow = {"element": detailPanel, "target": createBlankTearout("externalChildWindow")}
}

/*
 When the drag has finished, work out from the mouse position if it is outside
 of the main window and should, therefore, reparent the DOM Element, or not.
 */
function onDragEnd(e) {
    _currentDragger = e.target;
    isMouseOutOfMainWindow(e, onMouseOutsideOfMainWindow, onMouseInsideOfMainWindow);
    e.stopPropagation(); // Stops some browsers from redirecting.
    e.preventDefault();
}

//What to do if the mouse is dragged outside of the main window...
function onMouseOutsideOfMainWindow(e) {
    externalChildWindow.target
        .contentWindow
        .document
        .body
        .appendChild(externalChildWindow.element); //this is the actual piece of DOM you are tearing out

    externalChildWindow.target.show();
    externalChildWindow.target.bringToFront();
    externalChildWindow.target.moveTo(e.screenX, 100);
}

function onMouseInsideOfMainWindow(e) {
    _currentDropTarget = document.getElementById("detailPanel");

    if (_currentDropTarget && _currentDragger) {
        _currentDragger.parentNode.removeChild(_currentDragger);
        _currentDropTarget.appendChild(_currentDragger);
        try {
            externalChildWindow.target.hide();
        } catch (err) {
        }
    }
}

function isMouseOutOfMainWindow(e, outsideCallback, insideCallback) {
    let _xMin, _xMax, _yMin, _yMax;
    fin.desktop.Application.getCurrent().getWindow().getBounds(function (evt) {
        _xMin = evt.left;
        _xMax = evt.left + evt.width;
        _yMin = evt.top;
        _yMax = evt.top + evt.height;
        if (e.screenX > _xMin && e.screenX < _xMax && e.screenY > _yMin && e.screenY < _yMax) {
            insideCallback.call(this, e);
        } else {
            outsideCallback.call(this, e);
        }
    });
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function () {
    try {
        fin.desktop.main(function () {
            initTearoutListeners();
            initAppPanels();
        })
    } catch (err) {
        alert("OpenFin is not available - you are probably running in a browser.");
    }
});

