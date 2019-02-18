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