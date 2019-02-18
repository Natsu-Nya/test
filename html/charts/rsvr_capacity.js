app.Charts.RsvrCapacity = (function() {
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
                yAxis: [{
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
                }, {
                    title: {
                        text: '库容(万m³)',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        },
                        align: 'high',
                        margin: -60,
                        rotation: 0,
                        y: -15
                    },
                    labels: {
                        format: '{value}',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    opposite: true
                }],
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

                }, {
                    name: '库容',
                    type: 'spline',
                    yAxis: 1,
                    data: [],
                    tooltip: {
                        valueSuffix: '万m³'
                    }
                }]
            });
            return chart;
        },
        map30Day = function(data, options) {
            var categories = _.map(data, function(item) {
                    var dt = moment(item.IDTM);
                    return dt.format('MM-DD');
                }),
                series_z = _.map(data, function(item) {
                    return Number(item.AVRZ.toFixed(2));
                }),
                series_c = _.map(data, function(item) {
                    return Number(((item.AVW || 0)).toFixed(2));
                });
            return { categories: categories, series_z: series_z, series_c: series_c };
        },
        mapMonth = function(data, options) {
            return map30Day(data, options);
        },
        mapDay = function(data, options) {
            var categories = _.map(data, function(item) {
                    var dt = moment(item.TM);
                    return dt.format('MM-DD HH');
                }),
                series_z = _.map(data, function(item) {
                    return Number((item.RZ || 0).toFixed(2));
                }),
                series_c = _.map(data, function(item) {
                    return Number(((item.W || 0)).toFixed(2));
                });
            return { categories: categories, series_z: series_z, series_c: series_c };
        };

    var Constr = function(container) {
        this.chart = init(container);
    };

    Constr.prototype = new app.Charts.BaseChart();

    Constr.prototype.render = function(categories, series_z, series_c, options) {
        var yAxisRange = app.Charts.axisRange(series_z),
            y1AxisRange = app.Charts.axisRange(series_c);

        this.chart.update({
            xAxis: [{
                categories: categories
            }],
            yAxis: [{
                max: yAxisRange.max,
                min: yAxisRange.min
            }, {
                max: y1AxisRange.max,
                min: y1AxisRange.min
            }],
            series: [{
                data: series_z
            }, {
                data: series_c
            }]
        });

        this.data = options.data;
        
        if (typeof options.success === 'function') {
            options.success({ maxWater: _.max(series_z), maxCapacity: _.max(series_c), data: options.data });
        }
    };

    Constr.prototype.load30Day = function(options) {
        var self = this;

        if (options.hasOwnProperty('data')) {
            var ret = map30Day(options.data);
            self.render(ret.categories, ret.series_z, ret.series_c, options);
            return;
        }

        app.ajax({
            url: app.urls.rsvr_30,
            data: {
                stcd: options.stcd,
                compareLast: options.compareLast,
                dateTime: options.dateTime
            },
            debug: false,
            success: function(data, html) {
                api.hideProgress();
                app.refreshHeaderLoadDone();

                options.data = data;
                self.load30Day(options);
            }
        });
    };

    Constr.prototype.loadMonth = function(options) {
        var self = this;

        if (options.hasOwnProperty('data')) {
            var ret = mapMonth(options.data);
            self.render(ret.categories, ret.series_z, ret.series_c, options);
            return;
        }

        app.ajax({
            url: app.urls.rsvr_month,
            data: {
                stcd: options.stcd,
                start: options.start,
                end: options.end,
                compareLast: options.compareLast
            },
            debug: false,
            success: function(data, html) {
                api.hideProgress();
                app.refreshHeaderLoadDone();

                options.data = data;
                self.loadMonth(options);
            }
        });
    };

    Constr.prototype.loadDay = function(options) {
        var self = this;

        if (options.hasOwnProperty('data')) {
            var ret = mapDay(options.data);
            self.render(ret.categories, ret.series_z, ret.series_c, options);
            return;
        }

        app.ajax({
            url: app.urls.rsvr_day,
            data: {
                stcd: options.stcd,
                dateTime: options.dateTime,
                compareLast: options.compareLast
            },
            debug: false,
            success: function(data, html) {
                api.hideProgress();
                app.refreshHeaderLoadDone();

                options.data = data;
                self.loadDay(options);
            }
        });
    };
    return Constr;
})();