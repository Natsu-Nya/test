app.Charts.GroundWater = (function() {
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
                noData: {
                    style: {
                        fontWeight: 'bold',
                        fontSize: '15px',
                        color: '#303030'
                    }
                },
                series: [{
                    name: '当前水位',
                    type: 'spline',
                    data: [],
                    tooltip: {
                        valueSuffix: 'm'
                    }
                }, {
                    name: '历史同期',
                    type: 'spline',
                    yAxis: 0,
                    data: [],
                    tooltip: {
                        valueSuffix: 'm'
                    }
                }]
            });
            return chart;
        },
        mapMonth12 = function(data, options) {
            var categories = _.map(data, function(item) {
                    var dt = moment(item.IDTM);
                    return dt.format('MM月');
                }),
                series_z = _.map(data, function(item) {
                    return Number((item.AVGWBD || 0).toFixed(2));
                }),
                series_his_z = _.map(data, function(item) {
                    return Number((item.AVSPQ || 0).toFixed(2));
                });
            return { categories: categories, series_z: series_z, series_his_z: series_his_z };

        },
        mapMonth = function(data, options) {
            var categories = _.map(data, function(item) {
                    var dt = moment(item.IDTM);
                    return dt.format('MM-DD');
                }),
                series_z = _.map(data, function(item) {
                    return Number((item.AVGWBD || 0).toFixed(2));
                }),
                series_his_z = _.map(data, function(item) {
                    return Number((item.AVSPQ || 0).toFixed(2));
                });
            return { categories: categories, series_z: series_z, series_his_z: series_his_z };
        },
        mapYear = function(data, options) {
            return mapMonth12(data, options);
        };;

    var Constr = function(container) {
        this.chart = init(container);
    };

    Constr.prototype = new app.Charts.BaseChart();

    Constr.prototype.render = function(categories, series_z, series_his_z, options) {
        var yAxisRange = app.Charts.axisRange(series_z);

        this.chart.update({
            xAxis: [{
                categories: categories
            }],
            yAxis: [{
                max: yAxisRange.max,
                min: yAxisRange.min
            }],
            series: [{
                data: series_z
            }, {
                data: series_his_z
            }]
        });

        this.data = options.data;

        if (typeof options.success === 'function') {
            options.success({ maxWater: _.max(series_z), data: options.data });
        }
    };

    Constr.prototype.loadMonth12 = function(options) {
        var self = this;

        if (options.hasOwnProperty('data')) {
            var ret = mapMonth12(options.data);
            self.render(ret.categories, ret.series_z, ret.series_his_z, options);
            return;
        }

        app.ajax({
            url: app.urls.groundwater_12month,
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
                self.loadMonth12(options);
            }
        });
    };

    Constr.prototype.loadMonth = function(options) {
        var self = this;

        if (options.hasOwnProperty('data')) {
            var ret = mapMonth(options.data);
            self.render(ret.categories, ret.series_z, ret.series_his_z, options);
            return;
        }

        app.ajax({
            url: app.urls.groundwater_month,
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
            },
            error: function(err) {
                alert(JSON.stringify(err));
            }
        });
    };

    Constr.prototype.loadYear = function(options) {
        var self = this;

        if (options.hasOwnProperty('data')) {
            var ret = mapYear(options.data);
            self.render(ret.categories, ret.series_z, ret.series_his_z, options);
            return;
        }

        app.ajax({
            url: app.urls.groundwater_year,
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
                self.loadYear(options);
            }
        });
    };

    return Constr;
})();