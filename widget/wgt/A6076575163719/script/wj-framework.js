function StringNullOrEmpty(val) {
    if (val == null || val == undefined || val == '') {
        return true;
    }

    return false;
}

function nullhandle(val) {
    if (val == undefined || val == null) {
        return '';
    }

    return val;
}

//去掉html标签
function removeHtmlTab(tab) {
    return tab.replace(/<[^<>]+?>/g, ''); //删除所有HTML标签
}

//普通字符转换成转意符
function html2Escape(sHtml) {
    return sHtml.replace(/[<>&"]/g, function(c) {
        return {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;'
        }[c];
    });
}

//转意符换成普通字符
function escape2Html(str) {
    var arrEntities = {
        'lt': '<',
        'gt': '>',
        'nbsp': ' ',
        'amp': '&',
        'quot': '"'
    };
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) {
        return arrEntities[t];
    });
}

// &nbsp;转成空格
function nbsp2Space(str) {
    var arrEntities = {
        'nbsp': ' '
    };
    return str.replace(/&(nbsp);/ig, function(all, t) {
        return arrEntities[t]
    })
}

//回车转为br标签
function return2Br(str) {
    return str.replace(/\r?\n/g, "<br />");
}

//去除开头结尾换行,并将连续3次以上换行转换成2次换行
function trimBr(str) {
    str = str.replace(/((\s|&nbsp;)*\r?\n){3,}/g, "\r\n\r\n"); //限制最多2次换行
    str = str.replace(/^((\s|&nbsp;)*\r?\n)+/g, ''); //清除开头换行
    str = str.replace(/((\s|&nbsp;)*\r?\n)+$/g, ''); //清除结尾换行
    return str;
}

// 将多个连续空格合并成一个空格
function mergeSpace(str) {
    str = str.replace(/(\s|&nbsp;)+/g, ' ');
    return str;
}

function padLeftZero(str) {
    return ('00' + str).substr(str.length);
}


/*
验证是否为空
*/
function IsNullOrEmpty(str) {
    var isOK = true;
    if (str == undefined || str == "" || str == 'null') {
        isOK = false;
    }
    return isOK;
}
/**
短暂提示
msg: 显示消息
time：停留时间
type：类型 >1：成功，<1：失败，其他：警告
**/
function tipDialog(msg, type, time) {
    if (time == null || time == undefined) {
        time = 3;
    }

    var msg = "<div class='ui_alert_tip'>" + msg + "</div>"
    if (type >= 1) {
        top.$.dialog.tips(msg, time, 'succ.png');
    } else if (type == -1) {
        top.$.dialog.tips(msg, time, 'fail.png');
    } else if (type == 0) {
        top.$.dialog.tips(msg, time, 'fail.png');
    } else {
        top.$.dialog.tips(msg, time, 'i.png');
    }
}

/**
短暂提示
msg: 显示消息
time：停留时间
type：类型 >1：成功，<1：失败，其他：警告
**/
function alertDialog(msg, type) {

    var msg = "<div class='ui_alert'>" + msg + "</div>"
    var icon = "";
    if (type >= 1) {
        icon = "succ.png";
    } else if (type == -1) {
        icon = "fail.png";
    } else {
        icon = "i.png";
    }
    top.$.dialog({
        id: "alertDialog",
        icon: icon,
        content: msg,
        title: "温馨提示",
        ok: function() {
            return true;
        }
    });

    //var t = "info";
    //var title = "消息";
    //if (type > 1) {
    //    t = "success";
    //    title = "成功";
    //}
    //else if (type < 1) {
    //    t = "error";
    //    title = "错误";
    //}

    //var delayTime = 3000;
    //if (IsNullOrEmpty(time)) {
    //    delayTime = time * 1000;
    //}

    //new PNotify({
    //    title: title,
    //    text: msg,
    //    delay: delayTime,
    //    type: t,
    //    addclass: "stack-modal",
    //    buttons: {
    //        sticker: false
    //    }

    //});
}

/********
接收地址栏参数
**********/
function GetQuery(key) {
    var search = location.search.slice(1); //得到get方式提交的查询字符串
    var arr = search.split("&");
    for (var i = 0; i < arr.length; i++) {
        var ar = arr[i].split("=");
        if (ar[0] == key) {
            if (unescape(ar[1]) == 'undefined') {
                return "";
            } else {
                return unescape(ar[1]);
            }
        }
    }
    return "";
}


/*
请求Ajax 带返回值
*/
function AjaxText(url, postData, callBack) {
    $.ajax({
        type: 'post',
        dataType: "text",
        url: RootPath() + url,
        data: postData,
        cache: false,
        async: false,
        success: function(data) {
            callBack(data);
        },
        error: function(data) {
            tipDialog("error:" + JSON.stringify(data), -1);
        }
    });
}
/*
请求Ajax 带返回值
*/
function AjaxTextAsync(url, postData, callBack) {
    $.ajax({
        type: 'post',
        dataType: "text",
        url: RootPath() + url,
        data: postData,
        cache: false,
        success: function(data) {
            callBack(data);
        },
        error: function(data) {
            tipDialog("error:" + JSON.stringify(data), -1);
        }
    });
}

function AjaxJson(url, postData, callBack) {
    $.ajax({
        url: RootPath() + url,
        type: "post",
        data: postData,
        dataType: "json",
        async: false,
        success: function(data) {
            if (data != null && data.Code != null && data.Code == "-1") {
                top.layer.closeAll('loading');
                top.layer.msg(data.Message);
            } else {
                callBack(data);
            }
        },
        error: function(data) {
            top.layer.closeAll('loading');
            top.layer.msg(data.responseText);
        }
    });
}
//ajax异步请求
function AjaxJsonAsync(url, postData, callBack) {
    $.ajax({
        url: RootPath() + url,
        type: "post",
        data: postData,
        dataType: "json",
        success: function(data) {
            if (data != null && data.Code != null && data.Code == "-1") {
                top.layer.closeAll('loading');
                top.layer.msg(data.Message);
            } else {
                callBack(data);
            }
        },
        error: function(data) {
            top.layer.closeAll('loading');
            top.layer.msg(data.responseText);
        }
    });
}

/*
刷新当前页面
*/
function Replace() {
    location.reload();
    return false;
}

/*
href跳转页面
*/
function Urlhref(url) {
    location.href = url;
    return false;
}

///时间格式化,用法:format="yyyy-MM-dd hh:mm:ss";
function formatDateFormat(strdate, fmt) {
    if (StringNullOrEmpty(strdate)) {
        return '';
    }
    var date = jsonDateFormat(strdate);
    if (date == null) {
        return '';
    }
    if (StringNullOrEmpty(fmt)) {
        fmt = "yyyy-MM-dd hh:mm:ss";
    }
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/**
格式化时间显示方式
*/
function jsonDateFormat(jsonDate) { //json日期格式转换为正常的日期格式
    try {
        var date;
        if (typeof jsonDate === 'string') {
            if (jsonDate.indexOf("/Date(") > -1)
                date = new Date(parseInt(jsonDate.replace("/Date(", "").replace(")/", ""), 10));
            else
                date = new Date(Date.parse(jsonDate.replace(/-/g, "/").replace("T", " ").split(".")[0])); //.split(".")[0] 用来处理出现毫秒的情况，截取掉.xxx，否则会出错
        }

        var year = date.getFullYear();
        if (year == 1 || year == 2001 || year == 1970) {
            return null; //让0001-01-01为空
        }

        return date;
    } catch (ex) {
        return null;
    }
}

/**
当前时间
*/
function CurrentTime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

/*
自动获取页面控件值
*/
function GetWebControls(element) {
    var reVal = "";
    $(element).find('input,select,textarea').each(function(r) {
        var id = $(this).attr('id');
        var value = $(this).val();
        var type = $(this).attr('type');
        switch (type) {
            case "checkbox":
                if ($(this).attr("checked")) {
                    reVal += '"' + id + '"' + ':' + '"1",'
                } else {
                    reVal += '"' + id + '"' + ':' + '"0",'
                }
                break;
            case "radio":
                if ($(this).attr("checked")) {
                    reVal += '"' + id + '"' + ':' + '"1",'
                } else {
                    reVal += '"' + id + '"' + ':' + '"0",'
                }
                break;
            case "file":
                break;
            default:
                if (value == "") {
                    value = "";
                }
                reVal += '"' + id + '"' + ':' + '"' + $.trim(value) + '",'
                break;
        }
    });
    reVal = reVal.substr(0, reVal.length - 1);
    return jQuery.parseJSON('{' + reVal + '}');
}

/*
自动给控件赋值
*/
function SetWebControls(data) {
    for (var key in data) {
        var id = $('#' + key);
        var value = $.trim(data[key]).replace("&nbsp;", "");
        var type = id.attr('type');
        switch (type) {
            case "checkbox":
                if (value == 1) {
                    id.attr("checked", 'checked');
                } else {
                    id.removeAttr("checked");
                }
                $('input').customInput();
                break;
            case "radio":
                if (value == 1) {
                    id.attr("checked", 'checked');
                } else {
                    id.removeAttr("checked");
                }
                $('input').customInput();
                break;
            default:
                id.val(value);
                break;
        }
    }
}
/*
自动给控件赋值、对Lable
*/
function SetWebLable(data) {
    for (var key in data) {
        var id = $('#' + key);
        var value = $.trim(data[key]).replace("&nbsp;", "");
        id.text(value);
    }
}

/**
获取选中复选框值
值：1,2,3,4
**/
function CheckboxValue() {
    var reVal = '';
    $('[type = checkbox]').each(function() {
        if ($(this).attr("checked")) {
            reVal += $(this).val() + ",";
        }
    });
    reVal = reVal.substr(0, reVal.length - 1);
    return reVal;
}
/**
文本框只允许输入数字
**/
function IsNumber(obj) {
    $("#" + obj).bind("contextmenu", function() {
        return false;
    });
    $("#" + obj).css('ime-mode', 'disabled');
    $("#" + obj).keypress(function(e) {
        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
            return false;
        }
    });
}
/**
只能输入数字和小数点
**/
function IsMoney(obj) {
    $("#" + obj).bind("contextmenu", function() {
        return false;
    });
    $("#" + obj).css('ime-mode', 'disabled');
    $("#" + obj).bind("keydown", function(e) {
        var key = window.event ? e.keyCode : e.which;
        if (isFullStop(key)) {
            return $(this).val().indexOf('.') < 0;
        }
        return (isSpecialKey(key)) || ((isNumber(key) && !e.shiftKey));
    });

    function isNumber(key) {
        return key >= 48 && key <= 57
    }

    function isSpecialKey(key) {
        return key == 8 || key == 46 || (key >= 37 && key <= 40) || key == 35 || key == 36 || key == 9 || key == 13
    }

    function isFullStop(key) {
        return key == 190 || key == 110;
    }
}
/**
 * 金额格式(保留2位小数)后格式化成金额形式
 */
function FormatCurrency(num) {
    num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num))
        num = "0";
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100;
    num = Math.floor(num / 100).toString();
    if (cents < 10)
        cents = "0" + cents;
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
        num = num.substring(0, num.length - (4 * i + 3)) + '' +
        num.substring(num.length - (4 * i + 3));
    return (((sign) ? '' : '-') + num + '.' + cents);
}
//保留两位小数
//功能：将浮点数四舍五入，取小数点后2位
function ToDecimal(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return 0;
    }
    f = Math.round(x * 100) / 100;
    return f;
}
/**
查找数组中是否存在某个值
arr:数组
val:对象值
**/
function ArrayExists(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val)
            return true;
    }
    return false;
}

//js获取网站根路径(站点及虚拟目录)
function RootPath() {
    var strFullPath = window.document.location.href;
    var strPath = window.document.location.pathname;
    var pos = strFullPath.indexOf(strPath);
    var prePath = strFullPath.substring(0, pos);
    var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
    //return (prePath + postPath);如果发布IIS，有虚假目录用用这句
    return (prePath);
}

/*弹出对话框begin========================================*/
/*关闭对话框*/
function closeDialog() {
    var api = frameElement.api;
    var W = api.opener;
    api.close();
    return true;
}
/*
弹出对话框（带：确认按钮、取消按钮）
*/
function openDialog(url, _id, _title, _width, _height, callBack) {
    top.$.dialog({
        id: _id,
        width: _width,
        height: _height,
        max: false,
        min: false,
        lock: true,
        title: _title,
        resize: false,
        extendDrag: true,
        content: 'url:' + RootPath() + url,
        ok: function() {
            callBack(_id);
            return false;
        },
        cancel: true
    });
}

/*
弹出对话框（没按钮）
*/
function Dialog(url, _id, _title, _width, _height) {
    top.$.dialog({
        id: _id,
        width: _width,
        height: _height,
        max: false,
        min: false,
        lock: true,
        title: _title,
        content: 'url:' + RootPath() + url
    });
}

/*打开网页 window.open
/*url:          表示请求路径
/*windowname:   定义页名称
/*width:        宽度
/*height:       高度
---------------------------------------------------*/
function OpenWindow(url, title, w, h) {
    var width = w;
    var height = h;
    var left = ($(window).width() - width) / 2;
    var top = ($(window).height() - height) / 2;
    window.open(RootPath() + url, title, 'height=' + height + ', width=' + width + ', top=' + top + ', left=' + left + ', toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no, titlebar=yes, alwaysRaised=yes');
}


/*
确认对话框
*/
function confirmDialog(_title, msg, callBack) {
    var msg = "<div class='ui_alert'>" + msg + "</div>"
    top.$.dialog({
        id: "confirmDialog",
        lock: true,
        icon: "hits.png",
        content: msg,
        title: _title,
        ok: function() {
            if (callBack != undefined) {
                callBack(true);
            }
            return true;
        },
        cancel: function() {
            if (callBack != undefined) {
                callBack(false);
            }
            return true;
        }
    });
}

/*获取时间 0：今天 -1:昨天*/
function GetDateStr(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1; //获取当前月份的日期
    var d = dd.getDate();
    return y + "-" + m + "-" + d;
}


//比较Date1是否大于Date2
function daysCompare(DateOne, DateTwo) {
    var date1 = Date.parse(DateOne.replace(/-/g, "/"));
    var date2 = Date.parse(DateTwo.replace(/-/g, "/"));
    if (date1 > date2) {
        return 1;
    } else if (date1 < date2) {
        return -1;
    } else {
        return 0;
    }
}

//grid自适应高度宽度
function resizeGrid(obj, fixedwidth, fixedheight) {
    $(window).resize(function() {
        $(obj).setGridWidth($(window).width() - fixedwidth);
        $(obj).setGridHeight($(window).height() - fixedheight);
    });
}

function registeValidator(element) {
    $(element).validate({
        highlight: function(element) {
            $(element).children('.form-group').removeClass('success').addClass('error');
        },
        success: function(element) {
            element
                .text('OK!').addClass('valid')
                .children('.form-group').removeClass('error').addClass('success');
        }
    });
}

function downloadFile(url) {
    try {
        window.open(url);
    } catch (e) {}
}

function Loading(bool, text) {
    var ajaxbg = top.$("#loading_background,#loading");
    if (!!text) {
        top.$("#loading").css("left", (top.$('body').width() - top.$("#loading").width()) / 2);
        top.$("#loading span").html(text);
    } else {
        top.$("#loading").css("left", "42%");
        top.$("#loading span").html("加载中,请稍后…");
    }
    if (bool) {
        ajaxbg.show();
    } else {
        ajaxbg.hide();
    }
}

//是否是座机号
function IsPhone(str) {
    var re = /^0\d{2,3}-?\d{7,8}$/;
    if (re.test(str)) {
        return true;
    } else {
        return false;
    }
}

function IsMobile(str) {
    var re = /^1\d{10}$/
    if (re.test(str)) {
        return true;
    } else {
        return false;
    }
}


function getViewSize(w) {
    w = w || window;
    //除了IE8以及更早版本外，其它浏览器都能用
    if (w.innerWidth != null) {
        return {
            w: w.innerWidth,
            h: w.innerHeight
        }
    };

    //对标准模式下的IE或任何浏览器
    var d = w.document;
    if (document.compatMode == "CSS1Compat") {
        return {
            w: d.documentElement.clientWidth,
            h: d.documentElement.clientHeight
        }
    }

    //对怪异模式下的浏览器
    return {
        w: d.body.clientWidth,
        h: d.body.clientHeight
    }

}

function getCenterAddr() {
    //服务器
    return "http://wjgl2017.imwork.net:20895";
    //本地测试
    //return "http://192.168.0.46:62338";
}

////实现下拉刷新
function PullToRefresh(that, domname) {
    if (StringNullOrEmpty(domname)) {
        domname = '.aui-refresh-content';
    }
    ////实现下拉刷新
    var pullRefresh = new auiPullToRefresh({
        container: document.querySelector(domname),
        triggerDistance: 100
    }, function(ret) {
        if (ret.status == "success") {
            pullRefresh.cancelLoading(); //立马关闭，因为下面已经有加载提示了，也可以解决部分手机下拉图片不收回问题
            that.loaddata(true, '刷新中...'); //注意是重新加载数据,需要传参数true
        }
    });
}

////实现加载更多数据
function LoadMoreData(that) {
    ////实现加载更多
    var scroll = new auiScroll({
        listen: true,
        distance: 200 //判断到达底部的距离，isToBottom为true
    }, function(ret) {
        //console.log(JSON.stringify(ret));
        ////需要加载下一页才执行,需要加上that.pageIndex>1条件,注意网络异常情况下不要滚动加载,可能造成重复提示
        if (ret.scrollTop > 0 && ret.isToBottom && !that.isloaderror && that.pageIndex > 1) { //加上ret.scrollTop > 0判断，未铺满的情况点击<加载更多>操作
            if (that.loadfinished && !that.isloadalldata) {

                //that.loadfinished = false; //标识未加载完成数据应该放在loaddata内部，达到统一效果
                ////延迟半秒执行，避免重复触发,注意setTimeout放在判断内部才有效果
                setTimeout(function() {
                    that.loaddata(false);
                }, 500);
            }
        }
    });
}

////获取经纬度
function GetLocation(baiduLocation, callBack, errornotice, toast) {
    baiduLocation.startLocation({
        accuracy: '10m', //精度10米
        filter: 1,
        autoStop: true
    }, function(ret, err) {
        baiduLocation.stopLocation();
        if (ret.status && ret.longitude != '4.9E-324') {
            if (callBack) {
                callBack(ret.longitude, ret.latitude);
            }
            //  console.log(JSON.stringify(ret));
        } else {
            if (toast) {
                toast.hide();
            }

            api.alert(errornotice || "手机定位失败,请重新操作!");
        }
    });
}

//获取文件名
function getfilename(path) {
    //针对不同浏览器需要进行多种判断
    var pos1 = path.lastIndexOf('/');
    var pos2 = path.lastIndexOf('\\');
    var pos = Math.max(pos1, pos2)
    var fileName = path;
    if (pos < 0) {
        fileName = path;
    } else {
        fileName = path.substring(pos + 1);
    }

    return fileName;
}
