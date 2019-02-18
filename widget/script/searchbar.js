var LDSearchBar = (function() {
    var defOpts = {
        placeholder: '输入关键字名称查询',
        historyCount: 10,
        showRecordBtn: false,
        texts: {
            cancelText: '取消',
            clearText: '清除搜索记录'
        },
        styles: {
            navBar: {
                bgColor: '#FFFFFF',
                borderColor: '#E4E7F0'
            },
            searchBox: {
                bgImg: '',
                color: '#000',
                height: 44,
                size: 13
            },
            cancel: {
                bg: 'rgba(0,0,0,0)',
                color: '#D2691E',
                size: 13
            },
            list: {
                color: '#696969',
                bgColor: '#FFFFFF',
                borderColor: '#eee',
                size: 13
            },
            clear: {
                color: '#696969',
                borderColor: '#ccc',
                size: 13
            }
        }
    };

    var Constr = function(UISearchBar, placeholder, onCompleteBackcall) {
        defOpts.placeholder = placeholder;
        
        var searchValue = '';

        this.open = function() {
            UISearchBar.open(defOpts, function(ret, err) {
                if (ret) {
                    searchValue = ret.text;

                    onCompleteBackcall(ret);
                } else {
                    alert(JSON.stringify(err));
                }
            });

            UISearchBar.setText({
                text: searchValue
            });
        };
    };

    return Constr;
})();