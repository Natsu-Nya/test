app.Charts.IrrVolume = (function() {
    var init = function(container) {
        var chart = Highcharts.chart(container, {
            chart: {
                type: 'column'
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: [],
                crosshair: false
            },
            yAxis: {
                min: 0,
                title: {
                    text: null
                }
            },
            tooltip: {
                // head + 每个 point + footer 拼接成完整的 table
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f} 万m³</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    borderWidth: 0
                },
                spline: {
                    lineWidth: 2,
                    states: {
                        hover: {
                            lineWidth: 3
                        }
                    },
                    marker: {
                        enabled: false
                    }
                }
            },
            series: [{
                name: '用水量',
                data: []
            }]
        });

        return chart;
    };

    var Constr = function(container) {
        this.chart = init(container);
    };
    // Constr.prototype = new app.Charts.BaseChart();
    return Constr;
})();