/*! linkeddt.com 30-09-2018 */
var app = app || {};app.Charts = app.Charts || {};Highcharts.setOptions({lang: {noData: "暂无数据"} });
app.Charts.axisRange = function(lst) {
    if (lst && lst.length > 0) {
        var max = _.max(lst),
            min = _.min(lst),
            old_min = min,
            old_max = max;

        min = Math.round(min * 0.95);
        if (min < 0) {
            min = 0;
        }

        if (min > old_min) {
            min = old_min;
        }

        max = Math.round(max * 1.05);
        if (max < old_max) {
            max = old_max;
        }

        return { max: max, min: min };
    }
    return { max: 10, min: 0 };
};

app.Charts.BaseChart = (function() {
    var Constr = function() {
    };

    Constr.prototype.update = function(options) {
        this.chart.update(options);
    };

    Constr.prototype.reflow = function(options) {
        this.chart.reflow();
    };

    return Constr;
})();
app.Charts.ChannelFlow = (function() {
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
                        text: '流量(m³/s)',
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
                    name: '流量',
                    type: 'spline',
                    yAxis: 1,
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
                series_z = _.map(data, function(item) {
                    return Number(item.AVZ.toFixed(2));
                }),
                series_q = _.map(data, function(item) {
                    return Number((item.AVQ || 0).toFixed(2));
                });
            return { categories: categories, series_z: series_z, series_q: series_q };
        },
        mapMonth = function(data, options) {
            return map30Day(data, options);
        },
        mapDay = function(data, options) {
            var categories = _.map(data, function(item) {
                    var dt = moment(item.TM);
                    return dt.format('MM-DD');
                }),
                series_z = _.map(data, function(item) {
                    return Number(item.Z.toFixed(2));
                }),
                series_q = _.map(data, function(item) {
                    return Number((item.Q || 0).toFixed(2));
                });
            return { categories: categories, series_z: series_z, series_q: series_q };
        };

    var Constr = function(container) {
        this.chart = init(container);
    };
    Constr.prototype = new app.Charts.BaseChart();

    Constr.prototype.render = function(categories, series_z, series_q, options) {
        var yAxisRange = app.Charts.axisRange(series_z),
            y1AxisRange = app.Charts.axisRange(series_q);

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
                data: series_q
            }]
        });

        this.data = options.data;

        if (typeof options.success === 'function') {
            options.success({ maxWater: _.max(series_z), maxFlow: _.max(series_q), data: options.data });
        }
    };

    Constr.prototype.load30Day = function(options) {
        var self = this;

        if (options.hasOwnProperty('data')) {
            var ret = map30Day(options.data);
            self.render(ret.categories, ret.series_z, ret.series_q, options);
            return;
        }

        app.ajax({
            url: app.urls.channel_30,
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
            self.render(ret.categories, ret.series_z, ret.series_q, options);
            return;
        }

        app.ajax({
            url: app.urls.channel_month,
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

        // alert(JSON.stringify(options));

        if (options.hasOwnProperty('data')) {
            var ret = mapDay(options.data);
            self.render(ret.categories, ret.series_z, ret.series_q, options);
            return;
        }

        app.ajax({
            url: app.urls.channel_day,
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
app.Charts.ChannelVolume = (function() {
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
                    return dt.format('MM-DD');
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
            url: app.urls.channel_30,
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
            url: app.urls.channel_month,
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
            url: app.urls.channel_day,
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
app.Charts.DamPerssure = (function() {
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
                    text: '渗压(Kpa)',
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
                    return Number(item.AVPR.toFixed(2));
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
            return Number(item.AVPR.toFixed(2));
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
app.Charts.FxRsvrWater = (function() {
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
    };

    var Constr = function(container) {
        this.chart = init(container);
    };
    Constr.prototype = new app.Charts.BaseChart();

    Constr.prototype.load24Hour = function(options) {
        var self = this;
        
        app.ajax({
            url: app.urls.fxrsvr_detail_24H,
            data: {
                stcd: options.ReservoirId,
                dateTime: options.dateTime
            },
            debug: false,
            success: function(data, html) {
                api.hideProgress();
                app.refreshHeaderLoadDone();

                data = data.data;

                var categories = _.map(data, function(item) {
                        var dt = moment(item.TM);
                        return dt.format('MM-DD HH');
                    }),
                    series_z = _.map(data, function(item) {
                        return item.RZ;
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

                if (typeof options.success === 'function') {
                    options.success({ data: data });
                }
            },
            error: function (err) {
                alert(JSON.stringify(err));
            }
        });
    };

    return Constr;
})();
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
app.Charts.PptnPie = (function() {
    var init = function(container) {
        var chart = Highcharts.chart(container, {
            title: {
                text: null
            },
            tooltip: {
                headerFormat: '{series.name}<br>',
                pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true, // 可以被选择
                    cursor: 'pointer', // 鼠标样式
                    dataLabels: {
                        enabled: false,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    },
                    showInLegend: true
                }
            },
            credits: {
                enabled: false
            },
            series: [{
                type: 'pie',
                name: '降雨等级分布',
                data: []
            }]
        });
        return chart;
    };

    var Constr = function(container) {
        this.chart = init(container);
    };
    Constr.prototype = new app.Charts.BaseChart();
    return Constr;
})();
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
app.Charts.RsvrVolume = (function() {
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
                    name: '水量',
                    data: []
                }]
            });
            return chart;
        },
        map30Day = function(data, options) {
            var categories = _.map(data, function(item) {
                    var dt = moment(item.CreateDate);
                    return dt.format('MM-DD');
                }),
                series = _.map(data, function(item) {
                    return Number((item.DayOTQ || 0).toFixed(2));
                })
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
                    return Number((item.OTC || 0).toFixed(2));
                })
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
            options.success({ sumVolume: (sumVolume || 0).toFixed(2), data: options.data });
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
            url: app.urls.rsvr_30_volume,
            data: {
                ReservoirId: options.reservoirId,
                Stime: options.stime,
                Etime: options.etime,
                CompareLast: options.compareLast
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
            url: app.urls.rsvr_30_volume,
            data: {
                ReservoirId: options.reservoirId,
                Stime: options.stime,
                Etime: options.etime,
                CompareLast: options.compareLast
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