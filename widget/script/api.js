/*
 * APICloud JavaScript Library
 * Copyright (c) 2014 apicloud.com
 */
(function(window) {
    var u = {};
    var isAndroid = (/android/gi).test(navigator.appVersion);
    var uzStorage = function() {
        var ls = window.localStorage;
        if (isAndroid) {
            ls = os.localStorage();
        }
        return ls;
    };

    function parseArguments(url, data, fnSuc, dataType) {
        if (typeof(data) == 'function') {
            dataType = fnSuc;
            fnSuc = data;
            data = undefined;
        }
        if (typeof(fnSuc) != 'function') {
            dataType = fnSuc;
            fnSuc = undefined;
        }
        return {
            url: url,
            data: data,
            fnSuc: fnSuc,
            dataType: dataType
        };
    }
    u.trim = function(str) {
        if (String.prototype.trim) {
            return str == null ? "" : String.prototype.trim.call(str);
        } else {
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }
    };
    u.trimAll = function(str) {
        return str.replace(/\s*/g, '');
    };
    u.isElement = function(obj) {
        return !!(obj && obj.nodeType == 1);
    };
    u.isArray = function(obj) {
        if (Array.isArray) {
            return Array.isArray(obj);
        } else {
            return obj instanceof Array;
        }
    };
    u.isEmptyObject = function(obj) {
        if (JSON.stringify(obj) === '{}') {
            return true;
        }
        return false;
    };
    u.addEvt = function(el, name, fn, useCapture) {
        if (!u.isElement(el)) {
            console.warn('$api.addEvt Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        if (el.addEventListener) {
            el.addEventListener(name, fn, useCapture);
        }
    };
    u.rmEvt = function(el, name, fn, useCapture) {
        if (!u.isElement(el)) {
            console.warn('$api.rmEvt Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        if (el.removeEventListener) {
            el.removeEventListener(name, fn, useCapture);
        }
    };
    u.one = function(el, name, fn, useCapture) {
        if (!u.isElement(el)) {
            console.warn('$api.one Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        var that = this;
        var cb = function() {
            fn && fn();
            that.rmEvt(el, name, cb, useCapture);
        };
        that.addEvt(el, name, cb, useCapture);
    };
    u.dom = function(el, selector) {
        if (arguments.length === 1 && typeof arguments[0] == 'string') {
            if (document.querySelector) {
                return document.querySelector(arguments[0]);
            }
        } else if (arguments.length === 2) {
            if (el.querySelector) {
                return el.querySelector(selector);
            }
        }
    };
    u.domAll = function(el, selector) {
        if (arguments.length === 1 && typeof arguments[0] == 'string') {
            if (document.querySelectorAll) {
                return document.querySelectorAll(arguments[0]);
            }
        } else if (arguments.length === 2) {
            if (el.querySelectorAll) {
                return el.querySelectorAll(selector);
            }
        }
    };
    u.byId = function(id) {
        return document.getElementById(id);
    };
    u.first = function(el, selector) {
        if (arguments.length === 1) {
            if (!u.isElement(el)) {
                console.warn('$api.first Function need el param, el param must be DOM Element');
                return;
            }
            return el.children[0];
        }
        if (arguments.length === 2) {
            return this.dom(el, selector + ':first-child');
        }
    };
    u.last = function(el, selector) {
        if (arguments.length === 1) {
            if (!u.isElement(el)) {
                console.warn('$api.last Function need el param, el param must be DOM Element');
                return;
            }
            var children = el.children;
            return children[children.length - 1];
        }
        if (arguments.length === 2) {
            return this.dom(el, selector + ':last-child');
        }
    };
    u.eq = function(el, index) {
        return this.dom(el, ':nth-child(' + index + ')');
    };
    u.not = function(el, selector) {
        return this.domAll(el, ':not(' + selector + ')');
    };
    u.prev = function(el) {
        if (!u.isElement(el)) {
            console.warn('$api.prev Function need el param, el param must be DOM Element');
            return;
        }
        var node = el.previousSibling;
        if (node.nodeType && node.nodeType === 3) {
            node = node.previousSibling;
            return node;
        }
    };
    u.next = function(el) {
        if (!u.isElement(el)) {
            console.warn('$api.next Function need el param, el param must be DOM Element');
            return;
        }
        var node = el.nextSibling;
        if (node.nodeType && node.nodeType === 3) {
            node = node.nextSibling;
            return node;
        }
    };
    u.closest = function(el, selector) {
        if (!u.isElement(el)) {
            console.warn('$api.closest Function need el param, el param must be DOM Element');
            return;
        }
        var doms, targetDom;
        var isSame = function(doms, el) {
            var i = 0,
                len = doms.length;
            for (i; i < len; i++) {
                if (doms[i].isSameNode(el)) {
                    return doms[i];
                }
            }
            return false;
        };
        var traversal = function(el, selector) {
            doms = u.domAll(el.parentNode, selector);
            targetDom = isSame(doms, el);
            while (!targetDom) {
                el = el.parentNode;
                if (el != null && el.nodeType == el.DOCUMENT_NODE) {
                    return false;
                }
                traversal(el, selector);
            }

            return targetDom;
        };

        return traversal(el, selector);
    };
    u.contains = function(parent, el) {
        var mark = false;
        if (el === parent) {
            mark = true;
            return mark;
        } else {
            do {
                el = el.parentNode;
                if (el === parent) {
                    mark = true;
                    return mark;
                }
            } while (el === document.body || el === document.documentElement);

            return mark;
        }

    };
    u.remove = function(el) {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    };
    u.attr = function(el, name, value) {
        if (!u.isElement(el)) {
            console.warn('$api.attr Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length == 2) {
            return el.getAttribute(name);
        } else if (arguments.length == 3) {
            el.setAttribute(name, value);
            return el;
        }
    };
    u.removeAttr = function(el, name) {
        if (!u.isElement(el)) {
            console.warn('$api.removeAttr Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 2) {
            el.removeAttribute(name);
        }
    };
    u.hasCls = function(el, cls) {
        if (!u.isElement(el)) {
            console.warn('$api.hasCls Function need el param, el param must be DOM Element');
            return;
        }
        if (el.className.indexOf(cls) > -1) {
            return true;
        } else {
            return false;
        }
    };
    u.addCls = function(el, cls) {
        if (!u.isElement(el)) {
            console.warn('$api.addCls Function need el param, el param must be DOM Element');
            return;
        }
        if ('classList' in el) {
            el.classList.add(cls);
        } else {
            var preCls = el.className;
            var newCls = preCls + ' ' + cls;
            el.className = newCls;
        }
        return el;
    };
    u.removeCls = function(el, cls) {
        if (!u.isElement(el)) {
            console.warn('$api.removeCls Function need el param, el param must be DOM Element');
            return;
        }
        if ('classList' in el) {
            el.classList.remove(cls);
        } else {
            var preCls = el.className;
            var newCls = preCls.replace(cls, '');
            el.className = newCls;
        }
        return el;
    };
    u.toggleCls = function(el, cls) {
        if (!u.isElement(el)) {
            console.warn('$api.toggleCls Function need el param, el param must be DOM Element');
            return;
        }
        if ('classList' in el) {
            el.classList.toggle(cls);
        } else {
            if (u.hasCls(el, cls)) {
                u.removeCls(el, cls);
            } else {
                u.addCls(el, cls);
            }
        }
        return el;
    };
    u.val = function(el, val) {
        if (!u.isElement(el)) {
            console.warn('$api.val Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 1) {
            switch (el.tagName) {
                case 'SELECT':
                    var value = el.options[el.selectedIndex].value;
                    return value;
                    break;
                case 'INPUT':
                    return el.value;
                    break;
                case 'TEXTAREA':
                    return el.value;
                    break;
            }
        }
        if (arguments.length === 2) {
            switch (el.tagName) {
                case 'SELECT':
                    el.options[el.selectedIndex].value = val;
                    return el;
                    break;
                case 'INPUT':
                    el.value = val;
                    return el;
                    break;
                case 'TEXTAREA':
                    el.value = val;
                    return el;
                    break;
            }
        }

    };
    u.prepend = function(el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.prepend Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('afterbegin', html);
        return el;
    };
    u.append = function(el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.append Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('beforeend', html);
        return el;
    };
    u.before = function(el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.before Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('beforebegin', html);
        return el;
    };
    u.after = function(el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.after Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('afterend', html);
        return el;
    };
    u.html = function(el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.html Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 1) {
            return el.innerHTML;
        } else if (arguments.length === 2) {
            el.innerHTML = html;
            return el;
        }
    };
    u.text = function(el, txt) {
        if (!u.isElement(el)) {
            console.warn('$api.text Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 1) {
            return el.textContent;
        } else if (arguments.length === 2) {
            el.textContent = txt;
            return el;
        }
    };
    u.offset = function(el) {
        if (!u.isElement(el)) {
            console.warn('$api.offset Function need el param, el param must be DOM Element');
            return;
        }
        var sl = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
        var st = Math.max(document.documentElement.scrollTop, document.body.scrollTop);

        var rect = el.getBoundingClientRect();
        return {
            l: rect.left + sl,
            t: rect.top + st,
            w: el.offsetWidth,
            h: el.offsetHeight
        };
    };
    u.css = function(el, css) {
        if (!u.isElement(el)) {
            console.warn('$api.css Function need el param, el param must be DOM Element');
            return;
        }
        if (typeof css == 'string' && css.indexOf(':') > 0) {
            el.style && (el.style.cssText += ';' + css);
        }
    };
    u.cssVal = function(el, prop) {
        if (!u.isElement(el)) {
            console.warn('$api.cssVal Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 2) {
            var computedStyle = window.getComputedStyle(el, null);
            return computedStyle.getPropertyValue(prop);
        }
    };
    u.jsonToStr = function(json) {
        if (typeof json === 'object') {
            return JSON && JSON.stringify(json);
        }
    };
    u.strToJson = function(str) {
        if (typeof str === 'string') {
            return JSON && JSON.parse(str);
        }
    };
    u.setStorage = function(key, value) {
        if (arguments.length === 2) {
            var v = value;
            if (typeof v == 'object') {
                v = JSON.stringify(v);
                v = 'obj-' + v;
            } else {
                v = 'str-' + v;
            }
            var ls = uzStorage();
            if (ls) {
                ls.setItem(key, v);
            }
        }
    };
    u.getStorage = function(key) {
        var ls = uzStorage();
        if (ls) {
            var v = ls.getItem(key);
            if (!v) { return; }
            if (v.indexOf('obj-') === 0) {
                v = v.slice(4);
                return JSON.parse(v);
            } else if (v.indexOf('str-') === 0) {
                return v.slice(4);
            }
        }
    };
    u.rmStorage = function(key) {
        var ls = uzStorage();
        if (ls && key) {
            ls.removeItem(key);
        }
    };
    u.clearStorage = function() {
        var ls = uzStorage();
        if (ls) {
            ls.clear();
        }
    };
    u.fixIos7Bar = function(el) {
        return u.fixStatusBar(el);
    };
    u.fixStatusBar = function(el) {
        if (!u.isElement(el)) {
            console.warn('$api.fixStatusBar Function need el param, el param must be DOM Element');
            return 0;
        }
        el.style.paddingTop = api.safeArea.top + 'px';
        return el.offsetHeight;
    };
    u.fixTabBar = function(el) {
        if (!u.isElement(el)) {
            console.warn('$api.fixTabBar Function need el param, el param must be DOM Element');
            return 0;
        }
        el.style.paddingBottom = api.safeArea.bottom + 'px';
        return el.offsetHeight;
    };
    u.toast = function(title, text, time) {
        var opts = {};
        var show = function(opts, time) {
            api.showProgress(opts);
            setTimeout(function() {
                api.hideProgress();
            }, time);
        };
        if (arguments.length === 1) {
            var time = time || 500;
            if (typeof title === 'number') {
                time = title;
            } else {
                opts.title = title + '';
            }
            show(opts, time);
        } else if (arguments.length === 2) {
            var time = time || 500;
            var text = text;
            if (typeof text === "number") {
                var tmp = text;
                time = tmp;
                text = null;
            }
            if (title) {
                opts.title = title;
            }
            if (text) {
                opts.text = text;
            }
            show(opts, time);
        }
        if (title) {
            opts.title = title;
        }
        if (text) {
            opts.text = text;
        }
        time = time || 500;
        show(opts, time);
    };
    u.post = function( /*url,data,fnSuc,dataType*/ ) {
        var argsToJson = parseArguments.apply(null, arguments);
        var json = {};
        var fnSuc = argsToJson.fnSuc;
        argsToJson.url && (json.url = argsToJson.url);
        argsToJson.data && (json.data = argsToJson.data);
        if (argsToJson.dataType) {
            var type = argsToJson.dataType.toLowerCase();
            if (type == 'text' || type == 'json') {
                json.dataType = type;
            }
        } else {
            json.dataType = 'json';
        }
        json.method = 'post';
        api.ajax(json,
            function(ret, err) {
                if (ret) {
                    fnSuc && fnSuc(ret);
                }
            }
        );
    };
    u.get = function( /*url,fnSuc,dataType*/ ) {
        var argsToJson = parseArguments.apply(null, arguments);
        var json = {};
        var fnSuc = argsToJson.fnSuc;
        argsToJson.url && (json.url = argsToJson.url);
        //argsToJson.data && (json.data = argsToJson.data);
        if (argsToJson.dataType) {
            var type = argsToJson.dataType.toLowerCase();
            if (type == 'text' || type == 'json') {
                json.dataType = type;
            }
        } else {
            json.dataType = 'text';
        }
        json.method = 'get';
        api.ajax(json,
            function(ret, err) {
                if (ret) {
                    fnSuc && fnSuc(ret);
                }
            }
        );
    };

    /*end*/


    window.$api = u;

})(window);

var app = app || {};

app.innerHTML = function(ele, value) {
    var ele = document.querySelector(ele);
    if (ele !== null) {
        if (_) {
            if (!_.isFinite(value)) {
                value = '--';
            }
        }
        ele.innerHTML = value;
    }
};

app.console = (function() {
    var Constr = function() {
        var $console = document.createElement("div", { id: 'debug-console' });
        var $main = document.getElementById("main");

        this.log = function(msg) {
            var tNode = document.createTextNode(msg);
            $console.appendChild(tNode);
            document.body.insertBefore($console, $main);
        };

        this.json = function(data) {
            try {
                if (!data) {
                    alert('json is null');
                    return;
                }
                $console.innerHTML = '';

                preElement = document.createElement("pre");
                preElement.innerHTML = JSON.stringify(data, null, 2);
                $console.appendChild(preElement);
                document.body.insertBefore($console, $main);
            } catch (ex) {
                alert(ex);
            }
        };

    };
    return new Constr();
})();

app.dateUTC = function(dt) {
    return Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds())
}

app.getUser = function() {
    return $api.getStorage('userInfo');
};

app.setUser = function(userInfo) {
    /*
    var now = new Date();
    now.setMinutes(now.getMinutes() + userInfo.Expires);
    userInfo.__expireDate = app.dateUTC(now);
    */

    $api.setStorage('userInfo', userInfo);
};

app.toFixed = function(value, num) {
    num = num || 2;
    if (value !== undefined && value !== null) {
        return value.toFixed(num);
    }
    return '--';
}

app.isNull = function (value, defValue) {
    defValue = defValue || '--';
    if (value !== undefined && value !== null) {
        return value;
    }
    return defValue;
}

app.DatePicker = (function() {
    var humanize = function(d, format) {
            if (format == 'now') {
                return d.year + "年" + d.month + "月" + d.day + "日";
            } else if (format == 'year') {
                return d.year + "年";
            } else if (format == 'date') {
                return d.year + "年" + d.month + "月" + d.day + "日";
            } else if  (format == 'yearAndMonth') {
                return d.year + "年" + d.month + "月";
            }
        },
        toString = function(d, format) {
            if (format == 'now') {
                return d.year + "-" + d.month + "-" + d.day + " 00:00:00";
            } else if (format == 'year') {
                return d.year;
            } else if (format == 'date') {
                return d.year + "-" + d.month + "-" + d.day;
            } else if (format == 'yearAndMonth') {
                return d.year + "-" + d.month;
            }
        },
        getDateNow = function() {
            var now = new Date();
            return {
                'year': now.getFullYear(),
                'month': now.getMonth() + 1,
                'day': now.getDate(),
                'hour': now.getHours(),
                'minute': now.getMinutes(),
                'seconds': now.getSeconds()
            };
        };

    var Constr = function(UIDatePicker, options) {
        var options = options || {},
            selectedDate = null,
            selectedValue = null,
            selectedText = null;

        // 初始化默认值
        if (!options.hasOwnProperty('title')) {
            options.title = "选择时间";
        }

        if (!options.hasOwnProperty('type')) {
            options.type = 'now'
        }

        if (!options.hasOwnProperty('date')) {
            selectedDate = getDateNow();
        }

        this.open = function(type, title) {
            if (type) {
                options.type = type;
            }

            if (title) {
                options.title = title;
            }

            if (options.type == 'now') {
                return;
            }

            UIDatePicker.open({
                type: options.type,
                title: options.title,
                date: toString(selectedDate, 'now'), // 用于初始化控件选择的时间。
                maxDate: '2034-05-01 12:30:08',
                minDate: '2004-05-01 12:30:08',
                rowHeight: 40,
                styles: {
                    bg: 'rgba(0,0,0,0)',
                    headerViewBackgroundColor: 'rgba(0,0,0,0)',
                    lineBackgroundColor: 'rgba(0,0,0,0)',
                    item: {
                        normal: '#000',
                        normalFont: 14,
                        selected: '#000079',
                        selectedFont: 17,
                        cancelBtn: {
                            cancelButtonTextColor: '#1E1E1E',
                            cancelButtonText: '取消',
                            cancelButtonFont: 17
                        },
                        confirmBtn: {
                            confirmButtonTextColor: '#1E1E1E',
                            confirmButtonText: '确认',
                            confirmButtonFont: 17
                        }
                    }
                }
            }, function(ret, err) {
                if (ret) {
                    selectedDate = {
                        'year': ret.year,
                        'month': ret.month || '01',
                        'day': ret.day || '01',
                        'hour': '00',
                        'minute': '00',
                        'seconds': '00'
                    };

                    selectedText = humanize(ret, options.type);
                    selectedValue = toString(ret, options.type);

                    if (typeof options.success === 'function') {
                        options.success(selectedValue, selectedText, options.type, ret);
                    }
                } else {
                    alert(JSON.stringify(err));
                }
            });
        };

        this.getSelectedValue = function() {
            if (options.type == 'now') {
                selectedDate = getDateNow();
                return toString(selectedDate, options.type);
            } else {
                return toString(selectedDate, options.type);
            }
        };

        this.getSelectedText = function() {
            if (options.type == 'now') {
                selectedDate = getDateNow();
                return humanize(selectedDate, options.type);
            } else {
                return humanize(selectedDate, options.type);
            }
        };
    };
    return Constr;
})();

app.ActionSheet = (function() {
    var Constr = function(options) {
        var selectedIndex = 0;

        var options = options || {},
            mapDataSource = [];

        if (options.hasOwnProperty('selectedIndex')) {
            selectedIndex = options.selectedIndex;
        }

        if (!options.hasOwnProperty('title')) {
            options.title = '请选择切换项';
        }

        if (!options.hasOwnProperty('cancelTitle')) {
            options.cancelTitle = '取消';
        }

        if (!options.hasOwnProperty('dataSource')) {
            options.dataSource = [];
        }

        if (options.hasOwnProperty('fieldName')) {
            var ds = options.dataSource,
                fieldName = options.fieldName;

            for (var i = 0; i < ds.length; i++) {
                mapDataSource.push(ds[i][fieldName]);
            }
        } else {
            mapDataSource = options.dataSource;
        }

        this.open = function() {
            api.actionSheet({
                title: options.title,
                cancelTitle: options.cancelTitle,
                destructiveTitle: mapDataSource[0],
                buttons: mapDataSource.slice(1)
            }, function(ret, err) {
                if (ret.buttonIndex <= mapDataSource.length) {
                    selectedIndex = ret.buttonIndex - 1;
                    var selectedValue = mapDataSource[selectedIndex];

                    if (typeof options.success === 'function') {
                        options.success(selectedIndex, selectedValue, options.dataSource[selectedIndex]);
                    }
                }
            });
        };

        this.getSelectedItem = function() {
            return options.dataSource[selectedIndex];
        };

        this.getSelectedValue = function() {
            return mapDataSource[selectedIndex];
        };

        this.getSelectedIndex = function() {
            return selectedIndex;
        };
    };
    return Constr;
})();

app.unitActionSheet = function(element, success, before) {
    var lst = $api.getStorage('getListOrganizationHasChild'),
        $element = document.querySelector(element);

    if (typeof before === 'function') {
        before(lst, $element);
    }

    var sheet = new app.ActionSheet({
        title: '切换管理单位',
        cancelTitle: '取消',
        dataSource: lst,
        fieldName: 'Name',
        selectedIndex: 0,
        success: function(selectedIndex, selectedValue, selectedItem) {
            $element.innerHTML = selectedValue;

            if (typeof success === 'function') {
                success(selectedIndex, selectedValue, selectedItem);
            }
        }
    });
    $element.innerHTML = sheet.getSelectedValue();
    return sheet;
};

app.setRefreshHeaderInfo = function(fn) {
    api.setRefreshHeaderInfo({
        loadingImg: 'widget://image/refresh.png',
        bgColor: '#ccc',
        textColor: '#fff',
        textDown: '下拉刷新...',
        textUp: '松开刷新...'
    }, function(ret, err) {
        fn();
    });
};

app.refreshHeaderLoadDone = function() {
    api.refreshHeaderLoadDone();
};

DEBUG = true;

app.ajax = function(options) {
    var options = options || {},
        headers = {
            'Content-Type': 'application/json'
        };


    if (!options.hasOwnProperty('url')) {
        throw {
            name: 'Error',
            message: 'url不能为空'
        }
    }

    if (DEBUG) {
        options.error = function (err) {
            api.alert({
                title: '警告',
                msg: options.url.uri + JSON.stringify(err),
            });
        }
    }

    if (!options.hasOwnProperty('success')) {
        throw {
            name: 'Error',
            message: 'success不能为空'
        }
    }

    if (!typeof options.success === 'function') {
        throw {
            name: 'Error',
            message: 'success必须为function'
        }
    }

    if (!options.hasOwnProperty('data')) {
        options.data = {};
    }

    if (!options.hasOwnProperty('authorization')) {
        options.authorization = true;
    }

    if (!options.hasOwnProperty('showProgress')) {
        options.showProgress = true;
    }

    if (!options.hasOwnProperty('progress')) {
        options.progress = {
            title: '努力加载中...',
            text: '请稍后...',
            modal: true
        }
    }

    if (!options.hasOwnProperty('template_data')) {
        options.template_data = function(row) {
            return row;
        };
    }

    if (!options.hasOwnProperty('debug')) {
        options.debug = false;
    }

    if (options.authorization) {
        var userInfo = $api.getStorage('userInfo');
        headers.Authorization = 'Bearer ' + userInfo.Token;
    }

    if (options.showProgress) {
        api.showProgress(options.progress);
    }

    var render = function(data, t) {
        if (!data) {
            return '';
        }

        var output = [];
        if (Array.isArray(data)) {
            for (var i = 0, max = data.length; i < max; i++) {
                output.push(t(options.template_data(data[i], data, i)));
            }
        } else {
            output.push(t(options.template_data(data)));
        }
        return output.join('');
    };

    for (var key in options.data) {
        var rep = '{' + key + '}';
        options.url.uri = options.url.uri.replace(rep, options.data[key]);
    }

    api.ajax({
        url: options.url.uri,
        method: options.url.action,
        headers: headers,
        data: {
            body: options.data
        },
        timeout: options.url.timeout || 30
    }, function(ret, err) {
        if (err) {
            api.hideProgress();
            // api.alert({
            //     title: '警告',
            //     msg: JSON.stringify(err),
            // });

            if (options.hasOwnProperty('error') && typeof options.error === 'function') {
                options.error(err);
            } else {
                api.alert({
                    title: '警告',
                    msg: '服务器正忙，请稍后再试。'
                });
            }
        } else {
            if (ret.Code == 200) {
                if (options.debug) {
                    app.console.json(ret);
                }

                if (options.hasOwnProperty('loadFilter')) {
                    ret.Data = options.loadFilter(ret.Data);
                }

                if (options.hasOwnProperty('sortBy')) {
                    ret.Data = options.sortBy(ret.Data);
                }

                if (options.hasOwnProperty('template')) {
                    var html = render(ret.Data, options.template);
                    options.success(ret.Data, html);
                } else {
                    options.success(ret.Data, '');
                }
            } else {
                api.hideProgress();
                if (options.hasOwnProperty('error') && typeof options.error === 'function') {
                    options.error(ret);
                } else {
                    api.toast({
                        msg: ret.Message,
                        duration: 2000,
                        location: 'middle'
                    });
                }
            }
        }
    });
};

app.urls = {
    'loginApp2': {
        'uri': 'http://117.146.25.22:5561/framework/Account/LoginApp2',
        'name': '用户登录',
        'action': 'post'
    },
    'accountInfo': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppAccount/GetAccountInfo',
        'name': '账号信息',
        'action': 'get'
    },
    'getListOrganizationHasChild': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/Organization/GetListOrganizationHasChild',
        'name': '获取水管所',
        'action': 'get'
    },
    'getAlarmFeatures': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/WaterStation/GetAlarmFeatures',
        'name': '今日预警数统计',
        'action': 'get',
        'timeout': 60
    },
    'getListWH_Reservoir_RealByParam': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/Reservoir/GetListWH_Reservoir_RealByParam',
        'name': '获取水库',
        'action': 'get'
    },
    'rsvr_realdata': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppReservoir/GetWH_Reservoir',
        'name': '水库监测实时数据',
        'action': 'get'
    },
    'rsvr_30': {
        // 'uri': 'http://117.146.25.22:5561/irrigation/api/AppStatistics/GetReservoirRecent30Days',
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/Reservoir/Recent30Days',
        'name': '水库监测最近30天数据统计',
        'action': 'get'
    },
    'rsvr_month': {
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/Reservoir/ByDays',
        'name': '水库监测按月查询每日的数据',
        'action': 'get'
    },
    'rsvr_day': {
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/Reservoir/Recent24IntegralHours',
        'name': '水库监测按天查询每小时的数据(通过查询最近24小时接口实现)',
        'action': 'get'
    },
    'rsvr_30_volume': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/Reservoir/GetReservoirDtosList',
        'name': '水库监测最近30天，查询每天的水量)',
        'action': 'get'
    },
    'getSystemMessageList': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppHome/GetSystemMessageList',
        'name': '消息通知列表',
        'action': 'get'
    },
    'getPolicyList': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/PoliciesRegulations/GetPoliciesFileList',
        'name': '政策法规列表',
        'action': 'get'
    },
    'GetListWH_ProjectByVideo': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/VideoStationSet/GetListWH_ProjectByVideo',
        'name': '视频监控-获取工程列表',
        'action': 'get'
    },
    'GetVideoStationGroupListByProjectId': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/VideoStationSet/GetVideoStationGroupListByProjectId',
        'name': '视频监控-获取闸门',
        'action': 'get'
    },
    'GetListByGroupId': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/VideoStationSet/GetListByGroupId',
        'name': '视频监控-获取视频',
        'action': 'get'
    },
    'LoadImageListByDeviceId': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/ImageMonitor/LoadImageListByDeviceId',
        'name': '图像监测-获取图像',
        'action': 'get'
    },
    'irr_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppIrrigatedArea/GetIrrigatedArea',
        'name': '灌区列表',
        'action': 'get'
    },
    'irr_realdata': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppIrrigatedArea/GetIrrigatedAreaAll',
        'name': '灌区实时数据',
        'action': 'get'
    },
    'irr_chart': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppStatistics/GetAreaByMonths',
        'name': '灌区报表',
        'action': 'get'
    },
    'channel_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/WaterStation/GetListByStationId',
        'name': '渠道计量（渠道水情列表）',
        'action': 'get'
    },
    'channel_30': {
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/River/Recent30Days',
        'name': '渠道计量（查最近30天）',
        'action': 'get'
    },
    'channel_month': {
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/River/ByDays',
        'name': '渠道计量（按月查询）',
        'action': 'get'
    },
    'channel_day': {
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/River/CurrentDay',
        'name': '渠道计量（按日查询）',
        'action': 'get'
    },
    'river_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/WaterStation/GetListByStationId',
        'name': '河道水情',
        'action': 'get'
    },
    'river_detail_24H': {
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/River/Recent24IntegralHours',
        'name': '河道水情',
        'action': 'get'
    },
    'pptn_list': {
        // 'uri': 'http://117.146.25.22:5561/irrigation/api/RainStation/GetRainStationListByOid',2
        'uri': 'http://117.146.25.22:5561/irrigation/api/RainStation/GetRainWarnListAll',
        'name': '降雨信息列表',
        'action': 'get'
    },
    'pptn_detail_year': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/RainStation/GetMonthRainStationList',
        'name': '降雨信息 年(查询每月的数据)',
        'action': 'post'
    },
    'pptn_detail_month': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/RainStation/GetDayRainStationList',
        'name': '降雨信息 月(查询每天的数据)',
        'action': 'post'
    },
    'groundwater_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/WaterStation/GetListByStationId',
        'name': '地下水监测列表',
        'action': 'get'
    },
    'groundwater_12month': {
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/GroundWater/Recent12Months',
        'name': '地下水监测图表 最近12个月',
        'action': 'get'
    },
    'groundwater_month': {
        // 'uri': 'http://117.146.25.22:5561/irrigation/api/WaterStation/GetGroundWaterStatisticsDays',
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/GroundWater/ByDays',
        'name': '地下水监测图表 月查询，查询每天的水位',
        'action': 'get'
    },
    'groundwater_year': {
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/GroundWater/Recent12Months',
        'name': '地下水监测图表 年查询，通过最近12个月的接口获取',
        'action': 'get'
    },
    'fxrsvr_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/FloodPrevention/GetReservoirWaterList',
        'name': '防汛抗旱水库水位站列表',
        'action': 'get'
    },
    'fxrsvr_detail_24H': {
        // 'uri': 'http://117.146.25.22:5561/irrigation/api/AppStatistics/GetRecent24IntegralHours',
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/Reservoir/Recent24IntegralHours',
        'name': '防汛抗旱水库水位站列表最近24小时',
        'action': 'get'
    },
    'dam_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/Reservoir/GetListWH_Reservoir_RealByParam',
        'name': '大坝安全获取水库',
        'action': 'get'
    },
    'dam_realdata': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/Reservoir/GetReservoirPressureById',
        'name': '大坝安全 实时数据',
        'action': 'get'
    },
    'dam_detail_12month': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/Reservoir/GetReservoirTotalPressureById',
        'name': '大坝安全 最近12个月',
        'action': 'get'
    },
    'gate_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/YiTiGate/GetGateInfoAllList',
        'name': '闸门列表',
        'action': 'get'
    },
    'gate_control': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/YiTiGate/ControlGate',
        'name': '闸门控制',
        'action': 'get'
    },
    'gate_info_details': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/YiTiGate/GetGateInfoDetails',
        'name': '闸门详细信息',
        'action': 'get'
    },
    'pipeline_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/WH_Flow_Station/GetDitchList',
        'name': '田间计量',
        'action': 'get'
    },
    'pipeline_30': {
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/River/Recent30Days',
        'name': '田间计量（查最近30天）',
        'action': 'get'
    },
    'pipeline_month': {
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/River/ByDays',
        'name': '田间计量（按月查询）',
        'action': 'get'
    },
    'pipeline_day': {
        'uri': 'http://117.146.25.22:5561/converge/api/Sites/{stcd}/River/CurrentDay',
        'name': '田间计量（按日查询）',
        'action': 'get'
    },
    'soil_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/SLMC/GetSlmcStationList',
        'name': '墒情列表',
        'action': 'get'
    },
    'soil_detail': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/SLMC/GetSoilLast',
        'name': '墒情详情',
        'action': 'get'
    },
    'plan_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppUsewaterYearPlan/GetReservoirAreaList',
        'name': '年度用水计划列表',
        'action': 'get'
    },
    'program_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppFxPlan/FxPlanList',
        'name': '防汛预案',
        'action': 'get'
    },
    'contacts_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppPhone/GetListContacts',
        'name': '通讯录',
        'action': 'get'
    },
    'fxcontacts_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppPhone/GetListFXContacts',
        'name': '防汛通讯录',
        'action': 'get'
    },
    'report_rsvr_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppStatistics/GetReservoirStatistics',
        'name': '统计报表 水库统计报表',
        'action': 'get'
    },
    'report_irr_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppStatistics/GetRiverStatistics',
        'name': '统计报表 灌区统计报表',
        'action': 'get'
    },
    'user_project_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/UserProject/GetProjectListByUserId',
        'name': '个人中心 管理工程',
        'action': 'get'
    },
    'project_list': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppProject/GetProjectAll',
        'name': '工程信息列表',
        'action': 'get'
    },
    'project_detail': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppProject/GetProjectDetails',
        'name': '工程信息 详细信息',
        'action': 'get'
    },
    'project_photo': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppProject/GetProjectDrawing',
        'name': '工程信息 图纸信息',
        'action': 'get'
    },
    'project_file': {
        'uri': 'http://117.146.25.22:5561/irrigation/api/AppProject/GetProjectFile',
        'name': '工程信息 文件信息',
        'action': 'get'
    }
};
app.rootDomain = 'http://117.146.25.22:5561';
