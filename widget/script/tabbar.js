var LDTabbar = (function() {
    var defOpts = {
            styles: {
                bg: 'transition',
                h: 49,
                dividingLine: {
                    width: 1,
                    color: '#E4E6F0'
                },
                badge: {
                    bgColor: '#ff0',
                    numColor: '#fff',
                    size: 6.0,
                    centerX: 40,
                    centerY: 6
                }
            },
            selectedIndex: 2,
            items: []
        },
        menus = [
            { 'title': '消息', 'icon': '11.png', 'sicon': '12.png' },
            { 'title': '视频监控', 'icon': '21.png', 'sicon': '22.png' },
            { 'title': '智慧水利', 'icon': '31.png', 'sicon': '32.png' },
            { 'title': '通讯录', 'icon': '41.png', 'sicon': '42.png' },
            { 'title': '我的', 'icon': '51.png', 'sicon': '52.png' },
        ];

    var Constr = function(NVTabBar, selectedIndex) {
        NVTabBar.bringToFront();

        var tabItems = [],
            tabItemW = api.winWidth / menus.length,
            tabItem = null;
        for (var i = 0, max = menus.length, item = null; i < max; i++) {
            item = menus[i];

            tabItem = {
                w: tabItemW,
                bg: {
                    marginB: -2
                },
                iconRect: {
                    w: 22.0,
                    h: 22.0,
                },
                icon: {
                    normal: 'widget://image/home/tabbar/' + item.icon,
                    highlight: 'widget://image/home/tabbar/' + item.sicon,
                    selected: 'widget://image/home/tabbar/' + item.sicon
                },
                title: {
                    text: item.title,
                    size: 10.0,
                    normal: '#A1A6BB',
                    selected: '#222328',
                    marginB: 5.0
                }
            };
            tabItems.push(tabItem);
        }

        defOpts.items = tabItems;
        defOpts.selectedIndex = selectedIndex;

        NVTabBar.open(defOpts, function(ret, err) {
            if (ret.eventType == 'click') {
                api.sendEvent({
                    name: 'tabbar_changed',
                    extra: {
                        selectedIndex: ret.index
                    }
                });

                setTimeout(function() {
                    NVTabBar.setSelect({
                        index: selectedIndex,
                        selected: true
                    });
                }, 500);
            }
        });
    };
    return Constr;
})();