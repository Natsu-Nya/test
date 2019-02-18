var LDScrollNav = (function() {
    var elements = null,
        navSelected = function(ele, navIndex) {
            for (var i = 0; i < elements.length; i++) {
                if (ele == elements[i]) {
                    setSelect(elements[i]);
                } else {
                    setUnSelect(elements[i]);
                }
            }
        },
        setNavSelected = function(index) {
            for (var i = 0; i < elements.length; i++) {
                if (index == i) {
                    setSelect(elements[i]);
                } else {
                    setUnSelect(elements[i]);
                }
            }
        },
        setSelect = function(ele) {
            ele.classList.add('active');
        },
        setUnSelect = function(ele) {
            ele.classList.remove('active');
        };

    var Constr = function(eleId, onNavSelectedCallback) {
        elements = document.getElementById(eleId).getElementsByClassName('nav-item');
        for (var i = 0; i < elements.length; i++) {
            var ele = elements[i];
            ele.onclick = (function() {
                var el = ele,
                    index = i;

                return function() {
                    navSelected(el, index);
                    onNavSelectedCallback(index);
                };
            })();
        }

        this.setIndex = function(index) {
            setNavSelected(index);
        };
    };

    return Constr;
})();