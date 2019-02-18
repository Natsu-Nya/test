var app = app || {};

app.OnlineFile = (function() {
    var systemType = null,
        superFile = null,
        docInteraction = null,
        superFileSupportType = ['pdf', 'txt', 'ppt', 'pptx', 'xls', 'xlsx', 'doc', 'docx'];


    var Constr = function() {
        var self = this;
        systemType = api.systemType;
        superFile = api.require('superFile');
        docInteraction = api.require('docInteraction');

        this.open = function(url) {
            var fileType = self.getFileType(url);

            api.download({
                url: url,
                report: true,
                cache: true,
                allowResume: true
            }, function(ret, err) {
                if (ret.state == 1) {
                    if (systemType == 'android' && superFileSupportType.indexOf(fileType) !== -1) {
                        self.superFileOpen(ret.savePath);
                    } else {
                        self.docInteractionOpen(ret.savePath);
                    }
                } else if (ret.state == 2) {
                    api.alert({
                        title: '警告',
                        msg: '文件下载失败,请检查文件是否存在。',
                    });
                } else {

                }
            });
        };
    };

    Constr.prototype.getFileType = function(url) {
        var arr = url.toLowerCase().split('.').splice(-1);
        return arr[0];
    };

    Constr.prototype.docInteractionOpen = function(path) {
        docInteraction.open({
            path: path
        }, function(ret, err) {
            if (err) {
                // alert(JSON.stringify(err));
            } else {
                // alert(JSON.stringify(ret));
            }
        });
    };

    Constr.prototype.superFileOpen = function(path) {
        superFile.open({ path: path });
    };

    return Constr;
})();