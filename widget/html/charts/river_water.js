app.Charts.RiverWater = (function() {
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
                    name: '水位',
                    type: 'spline',
                    data: [],
                    tooltip: {
                        valueSuffix: 'm'
                    }

                }]
            });
            return chart;
        },
        map24Hour = function(data, options) {
            var categories = _.map(data, function(item) {
                    var dt = moment(item.TM);
                    return dt.format('MM-DD HH');
                }),
                series_z = _.map(data, function(item) {
                    return item.Z;
                });
            return { categories: categories, series: series_z };
        };

    var Constr = function(container) {
        this.chart = init(container);
    };
    Constr.prototype = new app.Charts.BaseChart();

    Constr.prototype.render = function(categories, series, options) {
        var yAxisRange = app.Charts.axisRange(series);

        this.chart.update({
            xAxis: [{
                categories: categories
            }],
            yAxis: [{
                max: yAxisRange.max,
                min: yAxisRange.min
            }],
            series: [{
                data: series
            }]
        });

        this.data = options.data;

        if (typeof options.success === 'function') {
            options.success({ data: options.data });
        }
    };

    Constr.prototype.load24Hour = function(options) {
        var self = this;

        if (options.hasOwnProperty('data')) {
            var ret = map24Hour(options.data);
            self.render(ret.categories, ret.series, options);
            return;
        }

        app.ajax({
            url: app.urls.river_detail_24H,
            data: {
                stcd: options.stcd,
                dateTime: options.dateTime
            },
            debug: false,
            success: function(data, html) {
                api.hideProgress();
                app.refreshHeaderLoadDone();

                options.data = data;
                self.load24Hour(options);
            }
        });
    };

    return Constr;
})();