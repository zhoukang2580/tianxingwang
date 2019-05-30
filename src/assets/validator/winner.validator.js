Winner = typeof(Winner)!="undefined" ? Winner : {};
Winner.Validator = function (config) {
    this.Base = new Winner.ClassBase();
    this.Validations = []; //[{Control:[],Handles:[{Function:null,Message:""}],Message:"",Content:[]}]
    this.StyleFile = "";//"/assets/validator/css/style.css";
    this.PropertyName = "ValidateName";
    this.IsShowMessage = true;
    if (config != undefined) {
        this.Base.LoadConfig(this, config);
    }
};
Winner.Validator.prototype =
 {
     Initialize: function () {//加载css样式文件
         this.Base.LoadCssFile(this.StyleFile);
     },
     InitializeControl: function (config, container) {
         container = container == undefined ? document : container;
         this.LoadControl(config, container.childNodes);
     },
     LoadControl: function (config, ctrls) {//加载控件
         for (var i = 0; i < ctrls.length; i++) {
             this.LoadControl(config, ctrls[i].childNodes);
             var name = this.Base.GetAttribute(ctrls[i], this.PropertyName);
             if (name == null)
                 continue;
             var names = name.split(',');
             if (names.length == 0 || config==undefined)
                 continue;
             for (var k = 0; k < config.length; k++) {
                 for (var j = 0; j < names.length; j++) {
                     if (config[k].Name == names[j]) {
                         var obj = this.Base.Clone(config[k]);
                         obj.Control = ctrls[i];
                         obj.IsEventValidate = obj.IsEventValidate == undefined ? true : obj.IsEventValidate;
                         this.AddControlRegularValidate(obj);
                     }
                 }
             }
         }
     },
     AddValidateInfo: function (info) {//{Control:[],Message:"",ValidateEvent:"",ShowMessageEvent:"",HideMessageEvent:""}添加验证信息
         if (info == null || info.Control == null) return null;
         var validInfo = this.PushValidateInfo(info.Control, info.Message);
         if (info.ShowMessageEvent != undefined && info.ShowMessageEvent != "") {
             this.Base.BindEvent(info.Control, info.ShowMessageEvent, function () {
                 if (validInfo != null) {
                     validInfo.Content.className = "validshowmess";
                     validInfo.Content.innerHTML = validInfo.Message;
                     validInfo.Content.style.display = "";
                 }
             });
         }
         if (info.HideMessageEvent != undefined && info.HideMessageEvent != "") {
             this.Base.BindEvent(info.Control, info.HideMessageEvent, function () {
                 if (validInfo != null) {
                     validInfo.Content.innerHTML = validInfo.Message;
                     validInfo.Content.style.display = "none";
                 }
             });
         }
         if (info.ValidateEvent != undefined && info.ValidateEvent != "") {
             this.BindControlValidateEvent(info.Control, info.ValidateEvent);
         }
         return validInfo;
     },
     PushValidateInfo: function (ctrl, message) { //存储验证信息
         if (ctrl == null) return null;
         var validInfo = this.GetValidateInfo(ctrl);
         if (validInfo == null) {
             var span = null;
             for (var i = 0; i < ctrl.parentElement.childNodes.length; i++) {
                 if (ctrl.parentElement.childNodes[i].className == "validshowmess") {
                     span = ctrl.parentElement.childNodes[i];
                     break;
                 }
             }
             if (span == null) {
                 span = this.GetMessageType(message);
                 ctrl.parentElement.appendChild(span);
             }
             validInfo = { Control: ctrl, Handles: [], Message: message, Content: span };
             this.Validations.push(validInfo);
         }
         return validInfo;
     },
     GetMessageType: function (message) {//得到消息容器
         var span = document.createElement('span');
         span.innerHTML = message;
         span.className = "validshowmess";
         span.style.display = this.IsShowMessage ? "" : "none";
         return span;
     },
     BindControlValidateEvent: function (ctrl, eventName) {//绑定控件的验证事件
         if (eventName == null || eventName == "")
             return;
         var self = this;
         this.Base.BindEvent(ctrl, eventName, function () {
             self.Validate(self.GetValidateInfo(ctrl));
         });
     },
     GetValidateInfo: function (ctrl) {//得到验证模型
         if (this.Validations != null && this.Validations.length > 0) {
             for (var i = 0; i < this.Validations.length; i++) {
                 if (this.Validations[i].Control == ctrl)
                     return this.Validations[i];
             }
         }
         return null;
     },
     Validate: function (validInfo) {//调用验证
         if (validInfo == null)
             return false;
         var handle = this.GetValidateHandle(validInfo);
         this.SetControlValidateStyle(validInfo.Control, handle);
         this.Message(validInfo, handle);
         return handle == null;
     },
     GetValidateHandle: function (validInfo) {//得到验证返回结果
         for (var i = 0; i < validInfo.Handles.length; i++) {
             if (!validInfo.Handles[i].Function()) {
                 return validInfo.Handles[i];
             }
         }
         return null;
     },
     SetControlValidateStyle: function (ctrl, handle) { //显示控件触发错误信息
         var errclass = " validctrlerror";
         var succlass = " validctrlsucess";
         ctrl.className = ctrl.className != null ? ctrl.className.replace(errclass, "").replace(succlass, "") : "";
         ctrl.className = ctrl.className + (handle == null ? succlass : errclass);
     },
     Message: function (validInfo, handle) {//显示错误信息
         var message = validInfo.Message;
         if (handle != null && handle.Message != undefined && handle.Message != null && handle.Message != "")
             message = handle.Message;
         validInfo.Content.style.display = "";
         validInfo.Content.innerHTML = handle == null ? "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" : message;
         validInfo.Content.className = handle == null ? "validsucessmess" : "validerrormess";
     },
     GetRegularValidateHandler: function (getValueFunc, rule) {//根据正则表达式验证函数
         return {
             Function: function () {
                 var validFunc = function (value) {
                     if (rule.IsRange) {
                         if (typeof value == 'string') {
                             var reg = new RegExp("[^\\d|^-\\d]", "g");
                             value = value.replace(reg, "");
                             value = parseFloat(value);
                         }
                         var rev = true;
                         var values = rule.Pattern.split('-');
                         if (values.length > 0)
                             rev = value >= parseFloat(values[0]);
                         if (rev && values.length > 1)
                             rev = value <= parseFloat(values[1]);
                         return rev;
                     }
                     var rg = new RegExp(rule.Pattern, rule.Options);
                     return rg.test(value);
                 };
                 var val = getValueFunc();
                 if (Object.prototype.toString.call(val) === '[object Array]') {
                     if (val.length > 0) {
                         var arrRev = true;
                         for (var i = 0; i < val.length; i++) {
                             arrRev = arrRev && validFunc(val[i]);
                         }
                         return arrRev;
                     }
                     validFunc(val.join(""));
                 }
                 return validFunc(val);
             },
             Message: rule.Message
         };
     },
     AddRegularValidate: function (info) {//添加验证表达式
         var validInfo = this.AddValidateInfo(info);
         if (validInfo == null) return null;
         for (var i = 0; i < info.Rules.length; i++) {
             var handle = this.GetRegularValidateHandler(info.GetValueHandle, info.Rules[i]);
             validInfo.Handles.push(handle);
         }
         return validInfo;
     },
     AddControlRegularValidate: function (info) {//添加控件{Control:null,Rules:null,Message:null,IsEventValidate:true,ShowMessageEvent:"",HideMessageEvent:""}
         var type = info.Control.type;
         switch (type) {
             case "file":
                 for (var i = 0; i < info.Rules.length; i++) {
                     if (info.Rules[i].IsRange) {
                         return this.AddFileSizeValidate(info);
                     }
                 }
                 return this.AddFileRegularValidate(info);
             case "text":
             case "number":
             case "email":
             case "url":
             case "range":
             case "date":
             case "month":
             case "week":
             case "time":
             case "datetime":
             case "search":
             case "datetime-local":
             case "textarea":
             case "password":
             case "hidden":
                 return this.AddInputRegularValidate(info);
             case "select-one":
                 return this.AddDrowDownListValidate(info);
             default:
                 return this.AddCheckBoxListValidate(info);
         }
     },
     AddFileRegularValidate: function (info) {//根据正则表达式验证输入框
         info.ValidateEvent = null;
         if (info.IsEventValidate)
             info.ValidateEvent = "change";
         var func = function (value) {
             if (value == "") return "";
             var index = value.lastIndexOf('\\');
             if (index < 0) return value;
             return value.substring(index, value.length);
         };
         info.GetValueHandle = function () {
             if (info.Control.files == null) {
                 return func(info.Control.value);
             } else {
                 var values = [];
                 for (var i = 0; i < info.Control.files.length; i++) {
                     values.push(func(info.Control.files[i].name));
                 }
                 return values;
             }
         };
         return this.AddRegularValidate(info);
     },
     AddFileSizeValidate: function (info) {//根据正则表达式验证输入框
         info.ValidateEvent = null;
         if (info.IsEventValidate)
             info.ValidateEvent = "change";
         var self = this;
         info.GetValueHandle = function () {
             var sizes = self.Base.GetFileSize(info.Control);
             if (sizes == null || sizes.length == 0)
                 return 0;
             return sizes;
         };
         return this.AddRegularValidate(info);
     },
     AddInputRegularValidate: function (info) {//根据正则表达式验证输入框
         var self = this;
         info.ValidateEvent = null;
         if (info.IsEventValidate)
             info.ValidateEvent = "blur";
         info.GetValueHandle = function () {
             var value = info.Control.value.replace(/\n/g, "br");
             if (self.Base.GetAttribute(info.Control, "ShowValue") == value)
                 return "";
             return value;
         };
         if (info.Control.attributes["ShowValue"] != undefined) {
             var showClass = " ctrlshow";
             this.Base.BindEvent(info.Control, "focus", function () {
                 if (info.Control.value == self.Base.GetAttribute(info.Control, "ShowValue")) {
                     info.Control.className = info.Control.className != null ? info.Control.className.replace(showClass, "") : "";
                     info.Control.value = "";
                 }
             });
             this.Base.BindEvent(info.Control, "blur", function () {
                 if (info.Control.value == "") {
                     info.Control.value = self.Base.GetAttribute(info.Control, "ShowValue");
                     info.Control.className = info.Control.className + showClass;
                 }
             });
         }
         return this.AddRegularValidate(info);
     },
     AddDrowDownListValidate: function (info) {//验证DrowDownList的选择
         var self = this;
         info.ValidateEvent = null;
         if (info.IsEventValidate)
             info.ValidateEvent = "change";
         info.GetValueHandle = function () {
             return info.Control.value;
         };
         if (info.Control.attributes["ShowValue"]!= undefined) {
             var showClass = " ctrlshow";
             this.Base.BindEvent(info.Control, "change", function () {
                 if (info.Control.value != self.Base.GetAttribute(info.Control, "ShowValue")) {
                     info.Control.className = info.Control.className != null ? info.Control.className.replace(showClass, "") : "";
                 }
                 else if (info.Control.value == "") {
                     info.Control.className = info.Control.className + showClass;
                 }
             });
         }
         return this.AddRegularValidate(info);
     },
     AddCheckBoxListValidate: function (info) {//验证CheckBoxList的选择
         var self = this;
         info.GetValueHandle = function () {
             return self.GetCheckBoxListValue(info.Control);
         };
         var validInfo = this.AddRegularValidate(info);
         if (info.IsEventValidate) {
             this.BindCheckBoxListItemClick(info.Control);
         }
         return validInfo;
     },
     BindCheckBoxListItemClick: function (ctrl) { //绑定CheckBoxList选择项的点击事件
         if (ctrl == null) return;
         var ckboxs = ctrl.getElementsByTagName('input');
         if (ckboxs != null && ckboxs.length > 0) {
             for (var i = 0; i < ckboxs.length; i++) {
                 this.Base.BindEvent(ckboxs[i], "click", function () {
                     self.Validate(self.GetValidateInfo(ctrl));
                 });
             }
         }
     },
     GetCheckBoxListValue: function (ctrl) {//得到CheckBoxList值
         var ckboxs = ctrl.getElementsByTagName('input');
         var values = [];
         if (ckboxs != null && ckboxs.length > 0) {
             for (var i = 0; i < ckboxs.length; i++) {
                 if (ckboxs[i].checked) {
                     var value = this.Base.GetAttribute(ckboxs[i].parentNode, "RealValue");
                     if (value == null) value = ckboxs[i].value;
                     values.push(value);
                 }
             }
         }
         return values.join(',');
     },
     ValidateSubmit: function () {//提交验证
         var rev = true;
         for (var i = 0; i < this.Validations.length; i++) {
             rev = this.Validate(this.Validations[i]) && rev;
         }
         return rev;
     },
     AddButtonClick: function (ctrl) {//添加按钮验证
         var self = this;
         ctrl.onclick = function () {
             return self.ValidateSubmit();
         };
     }
 };

 
 
  