app.Charts.PipelineFlow = (function() {
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
                        text: '流量(m³/s)',
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
                    name: '流量',
                    type: 'spline',
                    data: [],
                    tooltip: {
                        valueSuffix: 'm³/s'
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
                series_q = _.map(data, function(item) {
                    return Number((item.AVQ || 0).toFixed(2));
                });
            return { categories: categories, series_q: series_q };
        },
        mapMonth = function(data, options) {
            return map30Day(data, options);
        },
        mapDay = function(data, options) {
            var categories = _.map(data, function(item) {
                    var dt = moment(item.TM);
                    return dt.format('MM-DD HH');
                }),
                series_q = _.map(data, function(item) {
                    return Number((item.Q || 0).toFixed(2));
                });
            return { categories: categories, series_q: series_q };
        };

    var Constr = function(container) {
        this.chart = init(container);
    };
    Constr.prototype = new app.Charts.BaseChart();

    Constr.prototype.render = function(categories, series_q, options) {
        var yAxisRange = app.Charts.axisRange(series_q);

        this.chart.update({
            xAxis: [{
                categories: categories
            }],
            yAxis: [{
                max: yAxisRange.max,
                min: yAxisRange.min
            }],
            series: [{
                data: series_q
            }]
        });

        this.data = options.data;

        if (typeof options.success === 'function') {
            options.success({ maxFlow: _.max(series_q), data: options.data });
        }
    };

    Constr.prototype.load30Day = function(options) {
        var self = this;

        if (options.hasOwnProperty('data')) {
            var ret = map30Day(options.data);
            self.render(ret.categories, ret.series_q, options);
            return;
        }

        app.ajax({
            url: app.urls.pipeline_30,
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
            self.render(ret.categories, ret.series_q, options);
            return;
        }

        app.ajax({
            url: app.urls.pipeline_month,
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
            self.render(ret.categories, ret.series_q, options);
            return;
        }

        app.ajax({
            url: app.urls.pipeline_day,
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