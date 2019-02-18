app.Charts.PptnBar = (function() {
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
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
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
                    name: '降雨量',
                    data: []
                }]
            });

            return chart;
        },
        mapMonth = function(data, options) {
            var categories = _.map(data, function(item) {
                    var dt = moment(item.IDTM);
                    return dt.format('MM-DD');
                }),
                series = _.map(data, function(item) {
                    return Number((item.ACCP || 0).toFixed(2));
                });
            return { categories: categories, series: series };
        },
        mapYear = function(data, options) {
            var categories = _.map(data, function(item) {
                    var dt = moment(item.IDTM);
                    return dt.format('MM月');
                }),
                series = _.map(data, function(item) {
                    return Number((item.ACCP || 0).toFixed(2));
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
            var sumDrp = _.reduce(series, function(memo, num) { return memo + num; }, 0);
            options.success({ sumDrp: sumDrp, data: options.data });
        }
    };

    Constr.prototype.loadMonth = function(options) {
        var self = this;

        if (options.hasOwnProperty('data')) {
            var ret = mapMonth(options.data);
            self.render(ret.categories, ret.series, options);
            return;
        }

        app.ajax({
            url: app.urls.pptn_detail_month,
            data: {
                Ids: options.Ids,
                sdateTime: options.sdateTime,
                edateTime: options.edateTime
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

    Constr.prototype.loadYear = function(options) {
        var self = this;

        if (options.hasOwnProperty('data')) {
            var ret = mapYear(options.data);
            self.render(ret.categories, ret.series, options);
            return;
        }
        
        app.ajax({
            url: app.urls.pptn_detail_year,
            data: {
                Ids: options.Ids,
                sdateTime: options.sdateTime,
                edateTime: options.edateTime
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