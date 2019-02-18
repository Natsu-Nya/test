var LDTab = (function() {
    var tabItems = null,
        tabPanes = null,
        tabSelected = function(ele, tabPaneId) {
            for (var i = 0; i < tabItems.length; i++) {
                if (ele == tabItems[i]) {
                    setSelect(tabItems[i]);
                } else {
                    setUnSelect(tabItems[i]);
                }
            }

            for (var i = 0; i < tabPanes.length; i++) {
                var tabPane = tabPanes[i];
                if (tabPaneId == tabPane.id) {
                    setSelect(tabPane);
                } else {
                    setUnSelect(tabPane);
                }
            }
        },
        setSelect = function(ele) {
            ele.classList.add('active');
        },
        setUnSelect = function(ele) {
            ele.classList.remove('active');
        };

    var Constr = function(options) {
        var options = options || {};

        tabItems = document.getElementsByClassName('tab-item');
        tabPanes = document.getElementsByClassName('tab-pane');

        for (var i = 0; i < tabItems.length; i++) {
            var ele = tabItems[i];
            ele.onclick = (function() {
                var el = ele,
                    tabIndex = i,
                    tabPaneId = ele.getAttribute('data-toggle');
                return function() {
                    tabSelected(el, tabPaneId);

                    if (typeof options.success === 'function') {
                        options.success({ 'target': el, 'tabPaneId': tabPaneId, 'tabIndex': tabIndex });
                    }
                };
            })();
        }
    };

    return Constr;
})();