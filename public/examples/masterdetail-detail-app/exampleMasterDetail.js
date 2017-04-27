var secondCellFormatter = function (params) {
    return params.value.toLocaleString() + 's';
};

addSearchFeature = function () {
    var tfSearch = document.querySelector('.full-width-search');
    var gridApi = detailGridOptions.api;

    var searchListener = function () {
        var filterText = tfSearch.value;
        gridApi.setQuickFilter(filterText);
    };

    tfSearch.addEventListener('input', searchListener);
};

addButtonListeners = function () {
    var eButtons = document.querySelectorAll('.full-width-grid-toolbar button');

    console.log(eButtons);
    console.log(eButtons.length);
    for (var i = 0; i < eButtons.length; i++) {
        console.log("here");
        eButtons[i].addEventListener('click', function () {
            window.alert('Sample button pressed!!');
        });
    }
};

var detailColumnDefs = [
    {headerName: 'Call ID', field: 'callId', cellClass: 'call-record-cell'},
    {headerName: 'Direction', field: 'direction', cellClass: 'call-record-cell'},
    {headerName: 'Number', field: 'number', cellClass: 'call-record-cell'},
    {headerName: 'Duration', field: 'duration', cellClass: 'call-record-cell', cellFormatter: secondCellFormatter},
    {headerName: 'Switch', field: 'switchCode', cellClass: 'call-record-cell'}
];

var detailGridOptions = {
    enableSorting: true,
    enableFilter: true,
    enableColResize: true,
    rowData: null,
    columnDefs: detailColumnDefs,
    onGridReady: function (params) {
        addSearchFeature();
        addButtonListeners();

        setTimeout(function () {
            params.api.sizeColumnsToFit();
        }, 0);
    }
};

(function () {
    'use strict';

    //event listeners.
    document.addEventListener('DOMContentLoaded', function () {
        //OpenFin is ready
        fin.desktop.main(function () {
            var gridDiv = document.querySelector('#myGrid');
            new agGrid.Grid(gridDiv, detailGridOptions);

            fin.desktop.InterApplicationBus.subscribe("ag-grid-master", "master row clicked", function (message, uuid, name) {
                document.getElementById("parentImage").src = '/images/' + message.image + '.png';
                document.getElementById("parentName").innerText = message.name;
                document.getElementById("parentAccount").innerText = message.account;
                detailGridOptions.api.setRowData(message.callRecords)
            });
        });
    });
}());

