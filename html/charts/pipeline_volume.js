app.Charts.PipelineVolume = (function() {
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
                        '<td style="padding:0"><b>{point.y:.1f} m³</b></td></tr>',
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
        },
        map30Day = function(data, options) {
            var categories = _.map(data, function(item) {
                    var dt = moment(item.IDTM);
                    return dt.format('MM-DD');
                }),
                series = _.map(data, function(item) {
                    return Number(((item.AVC || 0) / 10000).toFixed(2));
                });
            return { categories: categories, series: series };
        },
        mapMonth = function(data, options) {
            return map30Day(data, options);
        },
        mapDay = function(data, options) {
            var categories = _.map(data, function(item) {
                    var dt = moment(item.TM);
                    return dt.format('MM-DD HH');
                }),
                series = _.map(data, function(item) {
                    return Number(((item.XSAVV || 0) / 10000).toFixed(2));
                });
            return { categories: categories, series: series };
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
            var sumVolume = _.reduce(series, function(memo, num) { return memo + num; }, 0);
            options.success({ sumVolume: Number((sumVolume || 0).toFixed(2)), data: options.data });
        }
    };

    Constr.prototype.load30Day = function(options) {
        var self = this;

        if (options.hasOwnProperty('data')) {
            var ret = map30Day(options.data);
            self.render(ret.categories, ret.series, options);
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
            self.render(ret.categories, ret.series, options);
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
            self.render(ret.categories, ret.series, options);
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