app.Charts.DamPerssureWater = (function() {
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
                    text: '渗压水位(m)',
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
                name: '测点一',
                type: 'spline',
                data: [],
                tooltip: {
                    valueSuffix: 'm'
                }
            }, {
                name: '测点二',
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

        var arr = _.groupBy(data, 'STCD'),
            series = [],
            categories = [],
            yAxisRange = 10;

        _.each(arr, function(value, key, lst) {
            series.push({
                name: key,
                type: 'spline',
                data: _.map(value, function(item) {
                    return Number(item.AVWL.toFixed(2));
                }),
                tooltip: {
                    valueSuffix: 'm'
                }
            });
        });

        categories = _.map(data, function(item) {
            var dt = moment(item.IDTM);
            return dt.format('YYYY-MM');
        });

        var avwl = _.map(data, function(item) {
            return Number(item.AVWL.toFixed(2));
        });
        yAxisRange = app.Charts.axisRange(avwl);


        self.chart.update({
            xAxis: [{
                categories: categories
            }],
            yAxis: {
                max: yAxisRange.max,
                min: yAxisRange.min
            },
            series: series
        });
    };

    return Constr;
})();