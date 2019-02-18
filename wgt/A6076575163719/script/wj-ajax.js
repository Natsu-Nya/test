//get请求
function wjget(actionurl, callback) {
    wjbaseget('', actionurl, callback);
}

//post请求
function wjpost(actionurl, param, callback) {
    wjbasepost('', actionurl, param, callback);
}

//get请求
function wjbaseget(apiserviceurl, actionurl, callback) {
    if (actionurl.substr(0, 1) == '/') {
        actionurl = actionurl.substr(1); //去掉多余斜杠
    }

    if (!apiserviceurl) {
        apiserviceurl = $api.getStorage('apiserviceurl');
    }

    var Token = '';
    var logininfo = $api.getStorage('logininfo');
    if (logininfo) {
        Token = logininfo.Token;
    }

    if (apiserviceurl.substr(apiserviceurl.length - 1, 1) == '/') {
        apiserviceurl = apiserviceurl.substr(0, apiserviceurl.length - 1); //去掉多余斜杠
    }

    actionurl = apiserviceurl + '/' + actionurl;
    if (actionurl.indexOf("?") > 0) {
        actionurl = actionurl + "&tm=" + new Date().getTime();
    } else {
        actionurl = actionurl + "?tm=" + new Date().getTime();
    }
    //console.log("开始请求:" + actionurl);
    api.ajax({
        url: actionurl,
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + Token
        },
        timeout: '20', //等待时间20秒和加载提示时间一致
        dataType: 'json'
    }, function(ret, err) {
        //console.log("请求" + actionurl + "结果:" + JSON.stringify(ret) + "|" + JSON.stringify(err));
        if (callback) {
            callback(ret, err);
        }
    });
}

//post请求
function wjbasepost(apiserviceurl, actionurl, param, callback) {
    if (actionurl.substr(0, 1) == '/') {
        actionurl = actionurl.substr(1); //去掉多余斜杠
    }

    if (!apiserviceurl) {
        apiserviceurl = $api.getStorage('apiserviceurl');
    }

    var Token = '';
    var logininfo = $api.getStorage('logininfo');
    if (logininfo) {
        Token = logininfo.Token;
    }

    if (apiserviceurl.substr(apiserviceurl.length - 1, 1) == '/') {
        apiserviceurl = apiserviceurl.substr(0, apiserviceurl.length - 1); //去掉多余斜杠
    }

    actionurl = apiserviceurl + '/' + actionurl;
    //console.log("开始请求:" + actionurl);
    api.ajax({
        url: actionurl,
        method: 'post',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': 'Bearer ' + Token
        },
        data: {
            body: param
        },
        timeout: '20', //等待时间20秒和加载提示时间一致
        dataType: 'json'
    }, function(ret, err) {
        //console.log("请求" + actionurl + "结果:" + JSON.stringify(ret) + "|" + JSON.stringify(err));
        if (callback) {
            callback(ret, err);
        }
    });
}
