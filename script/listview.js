var LDListView = (function() {
    var setItemSelected = function(elements, index) {
            for (var i = 0; i < elements.length; i++) {
                if (index == i) {
                    setSelect(elements[i]);
                } else {
                    setUnSelect(elements[i]);
                }
            }
        },
        setSelect = function(ele) {
            ele.classList.add('selected');
        },
        setUnSelect = function(ele) {
            ele.classList.remove('selected');
        };

    var Constr = function(container, listItem, onSelectedCallback) {
        var self = this;
        var $container = document.querySelector(container);
        if ($container == null) {
            return;
        }
        
        elements = $container.querySelectorAll(listItem);
        if (elements == null) {
            return;
        }

        for (var i = 0; i < elements.length; i++) {
            var ele = elements[i];
            ele.onclick = (function() {
                var target = ele,
                    index = i;

                return function() {
                    var collapse = target.querySelector('.collapse');
                    var arrow = target.querySelector('.collapse-arrow');

                    if (collapse !== null) {
                        collapse.classList.toggle('in');
                    }
                    if (arrow !== null) {
                        arrow.classList.toggle('in');
                    }

                    onSelectedCallback.apply(self, [index, target]);
                };
            })();
        }

        this.items = elements;
    };

    Constr.prototype.setIndex = function(index) {
        setItemSelected(this.items, index);
    };

    Constr.prototype.getItem = function(index) {
        if (!index < this.items.length) {
            return null;
        }
        return this.items[index];
    };
    return Constr;
})();