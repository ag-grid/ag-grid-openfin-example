// a list of names we pick from when generating data
var firstnames = ['Sophia', 'Emma', 'Olivia', 'Isabella', 'Mia', 'Ava', 'Lily', 'Zoe', 'Emily', 'Chloe', 'Layla', 'Madison', 'Madelyn', 'Abigail', 'Aubrey', 'Charlotte', 'Amelia', 'Ella', 'Kaylee', 'Avery', 'Aaliyah', 'Hailey', 'Hannah', 'Addison', 'Riley', 'Harper', 'Aria', 'Arianna', 'Mackenzie', 'Lila', 'Evelyn', 'Adalyn', 'Grace', 'Brooklyn', 'Ellie', 'Anna', 'Kaitlyn', 'Isabelle', 'Sophie', 'Scarlett', 'Natalie', 'Leah', 'Sarah', 'Nora', 'Mila', 'Elizabeth', 'Lillian', 'Kylie', 'Audrey', 'Lucy', 'Maya'];
var lastnames = ['Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Johnson'];

var images = ['niall', 'sean', 'alberto', 'statue', 'horse'];

// each call gets a unique id, nothing to do with the grid, just help make the sample
// data more realistic
var callIdSequence = 555;

var rowData = createRowData();

// method creates all the data, both the top level grid and the lower level grids
function createRowData() {
    var rowData = [];

    for (var i = 0; i < 20; i++) {
        var firstName = firstnames[Math.floor(Math.random() * firstnames.length)];
        var lastName = lastnames[Math.floor(Math.random() * lastnames.length)];

        var image = images[i % images.length];

        var totalDuration = 0;

        var callRecords = [];
        // call count is random number between 20 and 120
        var callCount = Math.floor(Math.random() * 100) + 20;
        for (var j = 0; j < callCount; j++) {
            // duration is random number between 20 and 120
            var callDuration = Math.floor(Math.random() * 100) + 20;
            var callRecord = {
                callId: callIdSequence++,
                duration: callDuration,
                switchCode: 'SW' + Math.floor(Math.random() * 10),
                // 50% chance of in vs out
                direction: (Math.random() > .5) ? 'In' : 'Out',
                // made up number
                number: '(0' + Math.floor(Math.random() * 10) + ') ' + Math.floor(Math.random() * 100000000)
            };
            callRecords.push(callRecord);
            totalDuration += callDuration;
        }

        var record = {
            name: firstName + ' ' + lastName,
            account: i + 177000,
            totalCalls: callCount,
            image: image,
            // convert from seconds to minutes
            totalMinutes: totalDuration / 60,
            callRecords: callRecords
        };
        rowData.push(record);
    }

    return rowData;
}

// create 200 data records

var minuteCellFormatter = function (params) {
    return params.value.toLocaleString() + 'm';
};

var masterColumnDefs = [
    {
        headerName: 'Name', field: 'name',
        // left column is going to act as group column, with the expand / contract controls
        cellRenderer: 'group',
        // we don't want the child count - it would be one each time anyway as each parent
        // not has exactly one child node
        cellRendererParams: {suppressCount: true}
    },
    {headerName: 'Account', field: 'account'},
    {headerName: 'Calls', field: 'totalCalls'},
    {headerName: 'Minutes', field: 'totalMinutes', cellFormatter: minuteCellFormatter}
];

var masterGridOptions = {
    columnDefs: masterColumnDefs,
    rowData: rowData,
    enableSorting: true,
    enableColResize: true,
    onGridReady: function (params) {
        params.api.sizeColumnsToFit();
    },
    onRowClicked: function (params) {
        "use strict";

        // the listeners below don't always capture the state correctly, esp if the detail app is started at exactly
        // the same time as the master, so double check and update the status here
        detailApplication.isRunning(function (running) {
            if (running) {
                fin.desktop.InterApplicationBus.publish("master row clicked", params.data)
            }

        });
    }
};

let setDetailAppStatus = function (running) {
    document.getElementById("detailStatus").innerText = running ? "Running!" : "Not Available.";
};

var detailApplication;
(function () {
    'use strict';

    //event listeners.
    document.addEventListener('DOMContentLoaded', function () {
        //OpenFin is ready
        fin.desktop.main(function () {
            var gridDiv = document.querySelector('#myGrid');
            new agGrid.Grid(gridDiv, masterGridOptions);

            detailApplication = fin.desktop.Application.wrap("ag-grid-detail");
            detailApplication.addEventListener("connected", function (event) {
                setDetailAppStatus(true);
            });
            detailApplication.addEventListener("closed", function (event) {
                setDetailAppStatus(false);
            });
        });
    });
}());

