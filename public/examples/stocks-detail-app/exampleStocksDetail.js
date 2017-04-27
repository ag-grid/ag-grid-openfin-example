function makeRequest(url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

let loadStockFile = function (metric, stockSymbols) {
    let noRowsMessage = document.querySelector('.center');
    noRowsMessage.style.display="None";

    let svg = d3.select("svg");
    svg.selectAll("*").remove();

    let margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let parseTime = d3.timeParse("%d-%b-%y");

    let x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);

    let line = d3.line()
        .curve(d3.curveBasis)
        .x(function (d) {
            return x(d.Date);
        })
        .y(function (d) {
            return y(d[metric]);
        });

    let promises = [];
    stockSymbols.forEach((stockSymbol) => {
        "use strict";
        promises.push(makeRequest(`/static/${stockSymbol}.json`))
    });

    Promise.all(promises).then(values => {
        "use strict";

        let stocks = values.map(function (value) {
            let symbol = Object.keys(value)[0];
            return {
                id: symbol,
                values: value[symbol].map(function (datum) {
                    let result = {
                        Date: parseTime(datum.Date)
                    };
                    result[metric] = +datum[metric];
                    return result;
                })
            };
        });

        let data = values.map(function (value) {
            let symbol = Object.keys(value)[0];

            return value[symbol].map(function (stockValue) {
                let result = {
                    Date: parseTime(stockValue.Date)
                };
                result[symbol] = +stockValue[metric];
                return result;
            });
        });
        data = _.merge(...data);

        x.domain(d3.extent(data, function (d) {
            return d.Date;
        }));

        y.domain([
            d3.min(stocks, function (c) {
                return d3.min(c.values, function (d) {
                    return d[metric];
                });
            }),
            d3.max(stocks, function (c) {
                return d3.max(c.values, function (d) {
                    return d[metric];
                });
            })
        ]);

        z.domain(stocks.map(function (c) {
            return c.id;
        }));

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("fill", "#000")
            .text(metric);

        let city = g.selectAll(".city")
            .data(stocks)
            .enter().append("g")
            .attr("class", "city");

        city.append("path")
            .attr("class", "line")
            .attr("d", function (d) {
                return line(d.values);
            })
            .style("stroke", function (d) {
                return z(d.id);
            });

        city.append("text")
            .datum(function (d) {
                return {id: d.id, value: d.values[0]};
            })
            .attr("transform", function (d) {
                return "translate(" + x(d.value.Date) + "," + y(d.value[metric]) + ")";
            })
            .attr("x", 3)
            .attr("dy", "0.35em")
            .style("font", "10px sans-serif")
            .text(function (d) {
                return d.id;
            });
    });
};

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // OpenFin is ready
        fin.desktop.main(function () {
            fin.desktop.InterApplicationBus.subscribe("ag-grid-stocks-master", "master row clicked", function (message, uuid, name) {
                loadStockFile(message.selectedMetric, message.selectedSymbols);
            });
        });
    });
}());

