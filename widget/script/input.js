var LDUIInput = (function() {
    var _uiInputDefOpts = {
        rect: {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        },
        styles: {
            bgColor: 'rgba(0, 0, 0, 0)',
            size: 15,
            color: '#F1F2F7',
            placeholder: {
                color: '#F1F2F7'
            }
        },
        autoFocus: false,
        maxRows: 1,
        placeholder: '请输入您的账号或手机号',
        keyboardType: 'default',
        alignment: 'center',
        fixedOn: '',
        fixed: false
    };

    var Constr = function(UIInput, input, placeholder, inputType,positionKeyboardFn) {
        var _uiInputId = null,
            _uiInputValue = null;

        var rect = $api.offset(input);

        _uiInputDefOpts.placeholder = placeholder;
        _uiInputDefOpts.rect.x = rect.l;
        _uiInputDefOpts.rect.y = rect.t;
        _uiInputDefOpts.rect.w = rect.w;
        _uiInputDefOpts.rect.h = rect.h;
        _uiInputDefOpts.fixedOn = api.frameName;
        _uiInputDefOpts.inputType = inputType;

        UIInput.open(_uiInputDefOpts, function(ret, err) {
            if (ret && ret.eventType == "show") {
                _uiInputId = ret.id;

                UIInput.addEventListener({
                    id: ret.id,
                    name: 'becomeFirstResponder'
                }, function() {
                    if (typeof positionKeyboardFn === 'function') {
                        positionKeyboardFn();
                    }
                });
            } else if (ret.eventType == "change") {
                UIInput.value({
                    id: ret.id
                }, function(ret, err) {
                    if (ret) {
                        if (ret.status) {
                            _uiInputValue = ret.msg;
                        }
                    }
                });
            }
        });

        this.value = function() {
            return _uiInputValue;
        };

        this.id = function() {
            return _uiInputId;
        };

        this.closeKeyboard = function() {
            UIInput.closeKeyboard({
                id: _uiInputId
            });
        }
    };
    return Constr;
})();