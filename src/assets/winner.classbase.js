Winner = typeof (Winner) != "undefined" ? Winner : {};
Winner.ClassBase = function () { };
Winner.ClassBase.prototype =
{
    GetHtmlHead: function () { //得到Html的Head
        return document.getElementsByTagName("head").item(0);
    },
    LoadCssFile: function (src, container, loadFunction) { //加载样式文件
        var obj = document.createElement("link");
        obj.rel = "stylesheet";
        obj.type = "text/css";
        obj.href = src;
        if (src != null && src != "") {
            container = container == undefined ? this.GetHtmlHead() : container;
            container.appendChild(obj);
            if (loadFunction != undefined) {
                this.BindEvent(obj, "load", function () {
                    loadFunction();
                });
            }
        }
        return obj;
    },
    LoadScriptFile: function (src, container, loadFunction) { //加载脚本文件
        var obj = document.createElement("script");
        obj.type = "text/javascript";
        obj.src = src;
        if (src != null && src != "") {
            container = container == undefined ? this.GetHtmlHead() : container;
            container.appendChild(obj);
            if (loadFunction != undefined) {
                this.BindEvent(obj, "load", function () {
                    loadFunction();
                });
            }
        }
        return obj;
    },
    BindEvent: function (obj, eventName, func) { //添加事件
        if (obj.attachEvent) {
            obj.attachEvent("on" + eventName, func);
        } else if (obj.addEventListener) {
            obj.addEventListener(eventName, func, false);
        }
    },
    RemoveEvent: function (obj, eventName, func) { //取消绑定
        if (obj.detachEvent) {
            obj.detachEvent('on' + eventName, func);
        } else if (obj.removeEventListener) {
            obj.removeEventListener(eventName, func, false);
        }
    },
    GetAttribute: function (obj, name) { //得到属性值
        if (obj.attributes != null && obj.attributes[name] != null) {
            return obj.attributes[name].value;
        }
        return null;
    },
    SetAttribute: function (obj, name, value) { //设置属性值
        if (obj.setAttribute != null) {
            obj.setAttribute(name, value);
            return true;
        }
        return false;
    },
    RemoveAttribute: function (obj, name) { //移除属性值
        if (obj.setAttribute != null) {
            obj.removeAttribute(name);
            return true;
        }
        return false;
    },
    CancelEventUp: function (event) { //取消事件冒泡
        event = window.event ? window.event : event;
        if (document.all) {
            event.returnValue = false;
            event.cancelBubble = true;
        } else {
            event.preventDefault();
            event.stopPropagation();
        }
        return false;
    },
    GetElementTop: function (obj, endObj) { //显示Y坐标
        var top = obj.offsetTop;
        var style = this.GetElementStyle(obj.offsetParent);
        if (obj.offsetParent != null && (endObj == undefined || obj.offsetParent != endObj)
            && (style == null || style.position != "absolute")) {
            top += this.GetElementTop(obj.offsetParent, endObj);
        }
        return top;
    },
    GetElementLeft: function (obj, endObj) { //显示X坐标
        var left = obj.offsetLeft;
        var style = this.GetElementStyle(obj.offsetParent);
        if (obj.offsetParent != null && (endObj == undefined || obj.offsetParent != endObj)
            && (style == null || style.position != "absolute")) {
            left += this.GetElementLeft(obj.offsetParent, endObj);
        }
        return left;
    },
    GetElementStyle: function (obj) { //得到元素样式
        if (obj == null) return null;
        if (obj.currentStyle)
            return obj.currentStyle;
        else if (document.defaultView && document.defaultView.getComputedStyle)
            return document.defaultView.getComputedStyle(obj);
        return null;
    },
    LoadConfig: function (sender, config) { //加载自定义配置
        if (config == undefined)
            return;
        for (var con in config) {
            if (con != "undefined") {
                eval("sender." + con.toString() + " = config[con]");
            }
        }
    },
    LoadInstances: function (sender, ctrl, name) { //加载实例
        if (sender == null || ctrl == null)
            return;
        name = name == undefined ? "Instance" : name;
        for (var i = 0; i < ctrl.childNodes.length; i++) {
            var instance = this.GetAttribute(ctrl.childNodes[i], name);
            if (instance != undefined && instance != "") {
                eval("sender." + instance + "=ctrl.childNodes[i]");
                this.RemoveAttribute(ctrl.childNodes[i], name);
            }
            this.LoadInstances(sender, ctrl.childNodes[i], name);
        }
    },
    Deserialize: function (value) { //解析Json
        if (value == null || value == "")
            return new Array();
        try {
            return eval(value);
        } catch (e) {

        }
        return new Array();
    },
    Serialize: function (obj) { //序列化json
        var value = [];
        var rev = "null";
        if (Object.prototype.toString.apply(obj) === '[object Array]') {
            for (var i = 0; i < obj.length; i++)
                value.push(this.Serialize(obj[i]));
            rev = '[' + value.join(',') + ']';
        } else if (Object.prototype.toString.apply(obj) === '[object Date]') {
            rev = "new Date(" + obj.getTime() + ")";
        } else if (Object.prototype.toString.apply(obj) === '[object RegExp]' || Object.prototype.toString.apply(obj) === '[object Function]') {
            rev = obj.toString();
        } else if (Object.prototype.toString.apply(obj) === '[object Object]') {
            for (var name in obj) {
                var val = typeof (obj[name]) == 'string' ? '"' + obj[name] + '"' :
                    (typeof (obj[name]) === 'object' ? this.Serialize(obj[name]) : obj[name]);
                value.push(name + ':' + val);
            }
            rev = '{' + value.join(',') + '}';
        }
        return rev;
    },
    GetFileSize: function (file) {//得到文件大小
        try {
            var filesize = [];
            for (var i = 0; i < file.files.length; i++) {
                filesize.push(file.files[i].size);
            }
            return filesize;
        } catch (e) {
            return null;
        }
    },
    Clone: function (obj) {  //克隆
        function func() { }
        func.prototype = obj;
        var o = new func();
        for (var a in o) {
            if (typeof o[a] == "object") {
                o[a] = this.Clone(o[a]);
            }
        }
        return o;
    },
    ReplaceAll: function (source, oldString, newString) {//替换所有
        var reg = new RegExp("\\" + oldString, "g");
        return source.replace(reg, newString);
    },
    GetDto: function (content) {
        var result = (result == undefined ? {} : result);
        $(content).find("input,select,textarea").each(function () {
            if ($(this).attr("disabled") == "disabled" || this.type == "radio" || this.type =="checkbox")
                return null;
            var name = $(this).attr("name");
            if (name != undefined && name != "") {
                if ($(this).attr("ismul") != "true") {
                    var value = $(this).val();
                    eval("result." + name + "=value;");
                } else {
                    var vals = [];
                    $(content).find('*[name=' + name + '],').each(function (index, sender) {
                        if ($(this).attr("disabled") == "disabled")
                            return;
                        vals.push($.trim(this.value));
                    });
                    var value = vals.join(",");
                    eval("result." + name + "=value;");
                }
              
            }
        });
        $(content).find("input[type=radio]").each(function () {
            if ($(this).attr("disabled") == "disabled")
                return null;
            var name = $(this).attr("name");
            if (name != undefined && name != "") {
                $(content).find('input:radio[name=' + name + ']').each(function (index, sender) {
                    if (this.checked) {
                        var value = $.trim(this.value);
                        eval("result." + name + "=value;");
                        return false;
                    }
                });
            }
        });
        $(content).find("input[type=checkbox]").each(function () {
            if ($(this).attr("disabled") == "disabled")
                return null;
            var name = $(this).attr("name");
            if (name != undefined && name != "") {
                var vals = [];
                $(content).find('input[name=' + name + ']').each(function (index, sender) {
                    if($(this).attr("disabled") == "disabled")
                        return ;
                    if (this.value == "on") {
                        vals.push(this.checked);
                        return;
                    }
                    if (this.checked) {
                        vals.push($.trim(this.value));
                    }
                    else if ($(this).attr("uncheckvalue") != undefined) {
                        vals.push($(this).attr("uncheckvalue"));
                    }
                });
                var value = vals.join(",");
                eval("result." + name + "=value;");
            }
        });
       
        return result;
    },
    SetDto: function (content, data) {
        var setVal = function (ctrl, con) {
            if (ctrl.attr("ShowValue") != undefined && (data[con] == null || data[con] == "")) {
                ctrl.val(ctrl.attr("ShowValue"));
            } else if (ctrl.attr("ismul") == "true") {
                var vals = data[con].toString().split(',');
                for (var i = 0; i < ctrl.length; i++) {
                    if (i < vals.length) {
                        $(ctrl[i]).val(vals[i]);
                    }
                }
            }
            else {
                ctrl.val(data[con]);
            }
        }
        var setRadio = function (content, con) {
            $(content).find('input:radio[name="' + con + '"]').each(function () {
                this.checked = this.value == data[con];
            });
        }
        var setCheckBox = function (content, con) {
            var arr = data[con] == null?[]: data[con].toString().split(',');
            $(content).find('input[name="' + con + '"]').each(function () {
                var rev = false;
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] == this.value || this.value == "on" && arr[i].toString()=="true") {
                       rev= true;
                        break;
                    }
                }
                this.checked = rev;
            });
        }
        for (var con in data) {
            var ctrl = $(content).find("*[name='" + con + "']");
            if (ctrl.length == 0)
                continue;
            if (ctrl.attr("type") == "radio")
                setRadio(content, con);
            else if (ctrl.attr("type") == "checkbox")
                setCheckBox(content, con);
            else if (ctrl.attr("type") != "file")
                setVal(ctrl, con);
        }
    },
    GetForm: function (content) {
        var form = new FormData();
        $(content).find("input,select,textarea").each(function () {
            if ($(this).attr("disabled") == "disabled" || this.type == "radio" || this.type == "checkbox")
                return null;
            var name = $(this).attr("name");
            if (name != undefined && name != "") {
                if ($(this).attr("ismul") != "true") {
                    var value = $(this).val();
                    form.append(name, $.trim(value));
                } else {
                    var vals = [];
                    $(content).find('*[name="' + name + '"]').each(function (index, sender) {
                        var val = $(this).val();
                        vals.push($.trim(val));
                    });
                    var value = vals.join(",");
                    form.append(name, value);
                }
              
            }
        });
        var names = [];
        $(content).find("input[type=radio]").each(function () {
            if ($(this).attr("disabled") == "disabled")
                return null;
            var name = $(this).attr("name");
            if (names.indexOf(name)>-1)
                return null;
            names.push(name);
            if (name != undefined && name != "") {
                $(content).find('input:radio[name="' + name + '"]').each(function (index, sender) {
                    if (this.checked) {
                        form.append(name, $.trim(this.value));
                        return false;
                    }
                });
            }
        });
        names = [];
        $(content).find("input[type=checkbox]").each(function () {
            if ($(this).attr("disabled") == "disabled")
                return null;
            var name = $(this).attr("name");
            if (names.indexOf(name) > -1)
                return null;
            names.push(name);
            if (name != undefined && name != "") {
                var vals = [];
                $(content).find('input[name="' + name + '"]').each(function (index, sender) {
                    if ($(this).attr("disabled") == "disabled")
                        return ;
                    if (this.value == "on") {
                        vals.push(this.checked);
                        return;
                    }
                    if (this.checked) {
                        vals.push($.trim(this.value));
                    }
                    else if ($(this).attr("uncheckvalue") != undefined) {
                        vals.push($(this).attr("uncheckvalue"));
                    }
                });
                var value = vals.join(",");
                form.append(name, value);
            }
        });
        return form;
    },
    SetForm : function (content, forms) {
        var setVal = function (ctrl, form) {
            if (ctrl.attr("ShowValue") != undefined && (form.value == null || form.value == "")) {
                ctrl.val(ctrl.attr("ShowValue"));
            } else if (ctrl.attr("ismul") == "true") {
                var vals = form.value.toString().split(',');
                for (var i = 0; i < ctrl.length; i++) {
                    if (i < vals.length) {
                        $(ctrl[i]).val(vals[i]);
                    }
                }
            }
            else {
                ctrl.val(form.value);
            }
        }
        var setRadio = function (content, form) {
            $(content).find('input[name="' + form.name + '"]').each(function () {
                this.checked = this.value == form.value;
            });
        }
        var setCheckBox = function (content, form) {
            $(content).find('input[name="' + form.name + '"]').each(function () {
                var arr = form.value == null ? [] :  form.value.toString().split(',');
                var rev = false;
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] == this.value || this.value == "on" && arr[i].toString() == "true") {
                        rev = true;
                        break;
                    }
                }
                this.checked = rev;
            });
        }
        for (var i = 0; i < forms.length; i++) {
            var ctrl = $(content).find("*[name='" + forms[i].name + "']");
            if (ctrl.length == 0)
                continue;
            if (ctrl.attr("type") == "radio")
                setRadio(content, forms[i]);
            else if (ctrl.attr("type") == "checkbox")
                setCheckBox(content, forms[i]);
            else if (ctrl.attr("type") != "file")
                setVal(ctrl, forms[i]);
        }
    }
};
var Wcb = new Winner.ClassBase();
var winner = new Winner.ClassBase();
