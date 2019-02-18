app.Charts.DamRsvrWater = (function() {
    var init = function(container) {
        var chart = Highcharts.chart(container, {
            chart: {
                spacingTop: 40
            },
            title: {
                text: null,
            },
            credits: {
                enabled: false
            },
            xAxis: [{
                categories: [],
                crosshair: true
            }],
            yAxis: {
                title: {
                    text: '水位(m)',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    },
                    align: 'high',
                    margin: -50,
                    rotation: 0,
                    y: -15,
                    x: -10
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }
            },
            tooltip: {
                shared: true
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
                name: '库水位',
                type: 'spline',
                data: [],
                tooltip: {
                    valueSuffix: 'm'
                }
            }]
        });
        return chart;
    };

    var Constr = function(container) {
        this.chart = init(container);
    };
    Constr.prototype = new app.Charts.BaseChart();

    Constr.prototype.load12Month = function(data) {
        var self = this;

        var categories = _.map(data, function(item) {
                var dt = moment(item.IDTM);
                return dt.format('YYYY-MM');
            }),
            series_z = _.map(data, function(item) {
                return Number(item.AVWL.toFixed(2));
            }),
            yAxisRange = app.Charts.axisRange(series_z);

        self.chart.update({
            xAxis: [{
                categories: categories
            }],
            yAxis: {
                max: yAxisRange.max,
                min: yAxisRange.min
            },
            series: [{
                data: series_z
            }]
        });
    };
    return Constr;
})();