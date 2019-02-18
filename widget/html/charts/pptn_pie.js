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