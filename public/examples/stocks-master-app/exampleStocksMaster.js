let columnDefs = [
    {headerName: 'Symbol', field: 'Symbol'},
    {headerName: 'Date', field: 'Date'},
    {headerName: 'Open', field: 'Open'},
    {headerName: 'High', field: 'High'},
    {headerName: 'Low', field: 'Low'},
    {headerName: 'Close', field: 'Close'},
    {headerName: 'Volume', field: 'Volume'}
];

let getSelectedSymbols = function () {
    return gridOptions.api.getSelectedRows().map((row) => {
        return row.Symbol;
    });
};

let publishSelectedSymbols = function () {
    let selectedSymbols = getSelectedSymbols();

    // the listeners below don't always capture the state correctly, esp if the detail app is started at exactly
    // the same time as the master, so double check and update the status here
    detailApplication.isRunning(function (running) {
        if (running) {
            fin.desktop.InterApplicationBus.publish("master row clicked", {
                selectedMetric,
                selectedSymbols
            })
        }
        setDetailAppStatus(running);
    });
};

let gridOptions = {
    columnDefs: columnDefs,
    enableSorting: true,
    enableColResize: true,
    rowSelection: 'multiple',
    onGridReady: function (params) {
        params.api.sizeColumnsToFit();
    },
    onSelectionChanged: function (params) {
        "use strict";
        publishSelectedSymbols();
    }
};

let selectedMetric = 'Close';
function metricChanged(metric) {
    "use strict";
    selectedMetric = metric;

    publishSelectedSymbols();
}

let setDetailAppStatus = function (running) {
    document.getElementById("detailStatus").innerText = running ? "Running!" : "Not Available.";
};

let detailApplication;
(function () {
    'use strict';

    //event listeners.
    document.addEventListener('DOMContentLoaded', function () {
        //OpenFin is ready
        fin.desktop.main(function () {
            let gridDiv = document.querySelector('#myGrid');
            new agGrid.Grid(gridDiv, gridOptions);

            // do http request to get our sample data - not using any framework to keep the example self contained.
            // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
            let httpRequest = new XMLHttpRequest();
            httpRequest.open('GET', '/static/summary.json');
            httpRequest.send();
            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    let httpResult = JSON.parse(httpRequest.responseText);
                    gridOptions.api.setRowData(httpResult);
                }
            };

            detailApplication = fin.desktop.Application.wrap("ag-grid-stocks-detail");
            detailApplication.addEventListener("connected", function (event) {
                setDetailAppStatus(true);
            });
            detailApplication.addEventListener("closed", function (event) {
                setDetailAppStatus(false);
            });
        });
    });
}());

