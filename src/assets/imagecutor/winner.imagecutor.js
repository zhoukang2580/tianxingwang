Winner = typeof (Winner) != "undefined" ? Winner : {};
Winner.ImageCutor = function (containerId, config) {
    this.Base = new Winner.ClassBase();
    this.Container = $("#" + containerId);
    this.File = this.Container.find("input[type='file']");
    this.Image = this.Container.find("img");
    this.Canvas = this.Container.find("canvas");
    this.TopMask = $(document).find("*[ImageCutor='TopMask']");
    this.BottomMask = $(document).find("*[ImageCutor='BottomMask']");
    this.LeftMask = $(document).find("*[ImageCutor='LeftMask']");
    this.RightMask = $(document).find("*[ImageCutor='RightMask']");
    this.Mask = $(document).find("*[ImageCutor='Mask']");
    this.ShowImager = $(document).find("img[ImageCutor='ShowImager']");
    this.ViewImager = $(document).find("img[ImageCutor='ViewImager']");
    this.ChangeContainer = $(document).find("*[ImageCutor='ChangeContainer']");
    this.CloseButton = $(document).find("*[ImageCutor='CloseButton']");
    this.ChangeButton = $(document).find("*[ImageCutor='ChangeButton']");
    this.CutContainer = $(document).find("*[ImageCutor='CutContainer']");
    this.ColseCutButton = $(document).find("*[ImageCutor='ColseCutButton']");
    this.SaveCutButton = $(document).find("*[ImageCutor='SaveCutButton']");
    this.CutPartButton = $(document).find("*[ImageCutor='CutPartButton']");
    this.CutFullButton = $(document).find("*[ImageCutor='CutFullButton']");
    this.Position = {};
    this.MaxWidth = 800;
    this.MaxHeight = 800;
    this.IsSynchSaveImage = true;
    this.Orientation = 1;
    this.MinZoomMultiple = 1;
    this.MaxZoomMultiple = 2.5;
    this.IsZoom = false;
    this.CutType = "Part";//"Part"|"Full"
    this.Rect = { Top: 40, Left: 0 };
    if (config != undefined) {
        this.Base.LoadConfig(this, config);
    }
};
Winner.ImageCutor.prototype =
{
    Initialize: function () { //加载css样式文件
        this.BindOperateEvent();
        this.BindMoveEvent();
        this.BindZoomEvent(this.Container, this.Image);
        var contanerHeight = $(window).height() - this.CutContainer.height();
        this.Container.css("height", contanerHeight);
    },
    Select: function () {
        this.File[0].click();
    },
    BindOperateEvent: function () {
        var self = this;
        this.ShowImager.click(function () {
            self.ChangeContainer.show();
            self.Mask.show();
        });
        this.CloseButton.click(function () {
            self.Mask.hide();
            self.ChangeContainer.hide();
            self.CutContainer.hide();
            self.Container.hide();
        });
        this.ChangeButton.click(function () {
            self.Select();
            self.Mask.hide();
            self.ChangeContainer.hide();
        });
        this.ColseCutButton.bind("click", function () {
            self.Container.hide();
            self.CutContainer.hide();
            self.ResetFile();
        });
        this.SaveCutButton.bind("click", function () {
            if (self.SaveCutButton.attr("IsClick") == "true")
                return;
            self.SaveCutButton.attr("IsClick", "true");
            self.Cut();
        });
        this.CutPartButton.bind("click", function () {
            self.CutType = "Part";
            self.SetShowImage();
        });
        this.CutFullButton.bind("click", function () {
            self.CutType = "Full";
            self.SetShowImage();
        });
    },
    SetShowImage: function () {
        var self = this;
        self.ResetMask();
        self.Image.show();
        self.Container.show();
        self.CutContainer.show();
    },
    BindMoveEvent: function () {
        var self = this;
        this.File.bind("change", function () {
            EXIF.getData(this.files[0], function () {
                self.Orientation = EXIF.getTag(this, 'Orientation');
            });
            self.Image.attr("IsTrigger", "true");
            self.LoadImage(this.files[0]);
            if (self.ChangeFunction != null) {
                self.ChangeFunction(this);
            }
        });
        this.Image.bind("load", function () {
            if ($(this).attr("IsTrigger") == "true") {
                self.ResetPartMask();
                self.SetShowImage();
            }

        });
        this.Container.bind("touchstart", function (event) {
            if (event.originalEvent.touches.length == 1) {
                self.Position.BeginX = event.originalEvent.touches[0].pageX;
                self.Position.BeginY = event.originalEvent.touches[0].pageY;
            }
            event.originalEvent.preventDefault();
        }).bind("touchmove", function (event) {
            if (event.originalEvent.touches.length == 1) {
                self.Position.EndX = event.originalEvent.touches[0].pageX;
                self.Position.EndY = event.originalEvent.touches[0].pageY;
                event.originalEvent.preventDefault();
                event.originalEvent.stopPropagation();
                self.MoveImage(event.originalEvent.touches[0].pageY <= 0);
            }
        }).bind("touchend", function (event) {
            if (event.originalEvent.changedTouches.length == 1 && self.IsZoom == false) {
                self.Position.EndX = event.originalEvent.changedTouches[0].pageX;
                self.Position.EndY = event.originalEvent.changedTouches[0].pageY;
                event.originalEvent.preventDefault();
                event.originalEvent.stopPropagation();
                self.IsCheck = false;
                self.MoveImage(true);
            }
        });
        var func = function () {
            if (self.IsZoom == false && self.IsCheck) {
                self.MoveImage(true);
            }
            setTimeout(func, 1000);
        }
        setTimeout(func, 1000);

    },
    BindZoomEvent: function (item, img) {
        var self = this;
        item.bind("touchstart", function (event) {
            if (event.originalEvent.touches.length > 1) {
                self.StartTouches = [
                    {
                        pageX: event.originalEvent.touches[0].pageX,
                        pageY: event.originalEvent.touches[0].pageY,
                        screenX: event.originalEvent.touches[0].screenX,
                        screenY: event.originalEvent.touches[0].screenY
                    }, {
                        pageX: event.originalEvent.touches[1].pageX,
                        pageY: event.originalEvent.touches[1].pageY,
                        screenX: event.originalEvent.touches[1].screenX,
                        screenY: event.originalEvent.touches[1].screenY
                    }
                ];
                self.OriginTouches = [
                 {
                     pageX: event.originalEvent.touches[0].pageX,
                     pageY: event.originalEvent.touches[0].pageY,
                     screenX: event.originalEvent.touches[0].screenX,
                     screenY: event.originalEvent.touches[0].screenY
                 }, {
                     pageX: event.originalEvent.touches[1].pageX,
                     pageY: event.originalEvent.touches[1].pageY,
                     screenX: event.originalEvent.touches[1].screenX,
                     screenY: event.originalEvent.touches[1].screenY
                 }
                ];
                self.StartZoom(img);
            }
        }).bind("touchmove", function (event) {
            event.preventDefault();
            if (event.originalEvent.touches.length > 1) {
                self.EndTouches = [
                    {
                        pageX: event.originalEvent.touches[0].pageX,
                        pageY: event.originalEvent.touches[0].pageY
                    }, {
                        pageX: event.originalEvent.touches[1].pageX,
                        pageY: event.originalEvent.touches[1].pageY
                    }
                ];
                self.Zoom(img);
                self.StartTouches = [
                  {
                      pageX: event.originalEvent.touches[0].pageX,
                      pageY: event.originalEvent.touches[0].pageY
                  }, {
                      pageX: event.originalEvent.touches[1].pageX,
                      pageY: event.originalEvent.touches[1].pageY
                  }
                ];
            }
            else if (event.originalEvent.touches.length == 1 && self.IsZoom) {
                self.EndZoom(img);
            }
        }).bind("touchend", function (event) {
            self.EndZoom(img);
        });
    },
    MoveImage: function (isCheck) {
        if (this.Image == undefined)
            return;
        if (this.Image.is(":animated")) {
            this.Image.stop();
        }
        var self = this;
        var dx = this.Position.EndX - this.Position.BeginX;
        var dy = this.Position.EndY - this.Position.BeginY;
        this.Position.BeginX = this.Position.EndX;
        this.Position.BeginY = this.Position.EndY;
        var left = this.Image.position().left + dx;
        var top = this.Image.position().top + dy;
        if (isCheck) {
            if (left > self.Canvas.position().left)
                left = self.Canvas.position().left;
            else if (left + self.Image.width() < self.Canvas.position().left + self.Canvas.width())
                left = self.Canvas.position().left + self.Canvas.width() - self.Image.width();
            if (top > self.Canvas.position().top)
                top = self.Canvas.position().top;
            else if (top + self.Image.height() < self.Canvas.position().top + self.Canvas.height())
                top = self.Canvas.position().top + self.Canvas.height() - self.Image.height();
            this.Image.animate({ left: left, top: top }, { duration: 500 });
            return;
        }
        var rev = true;
        if (left > self.Canvas.position().left || left + self.Image.width() < self.Canvas.position().left + self.Canvas.width()) {
            left = this.Image.position().left + (dx > 0 ? 1 : -1);
            rev = false;
        }
        if (top > self.Canvas.position().top || top + self.Image.height() < self.Canvas.position().top + self.Canvas.height()) {
            top = this.Image.position().top + (dy > 0 ? 1 : -1);
            rev = false;
        }
        this.Image.animate({ left: left, top: top }, { duration: 0 });
    },
    LoadImage: function (file) {
        var self = this;
        self.Image.css("width", self.Container.width());
        self.Image.css("height", self.Container.height());
        self.Image.css("position", "absolute");
        var reader = new FileReader();
        reader.onload = function (e) {
            var func = function (src) {
                self.Image.attr("src", src);
                if (self.LoadFinishFunction != null) {
                    self.LoadFinishFunction(file);
                }
            }
            self.RotateImage(this.result, func);
        }

        reader.readAsDataURL(file);
    },
    ResetMask: function () {
        var self = this;
        if (this.CutType == "Part") {
            this.ResetPartMask();
        } else {
            this.ResetFullMask();
        }
    },
    ResetPartMask: function () {
        var self = this;
        var height = parseInt(self.Image[0].naturalHeight / self.Image[0].naturalWidth * self.Image.width());
        self.Image.css("height", height + "px").css("left", "0").css("top", "0");
        if (this.MaxWidth / this.MaxHeight >= self.Image[0].naturalWidth / self.Image[0].naturalHeight) { //宽度为准
            self.Canvas.css("width", this.Image.width() + "px");
            var height = parseInt(this.MaxHeight / this.MaxWidth * self.Image.width());
            self.Canvas.css("height", height + "px");

        } else {
            self.Canvas.css("height", this.Image.height() + "px");
            var width = parseInt(this.MaxWidth / this.MaxHeight * self.Image.height());
            self.Canvas.css("width", width + "px");
        }

        var shelfHeight = parseInt((this.Container.height() - self.Canvas.height()) / 2);
        var shelfWidth = parseInt((this.Container.width() - self.Canvas.width()) / 2);

        self.TopMask.css("width", this.Container.width()).css("height", shelfHeight);
        self.BottomMask.css("width", this.Container.width()).css("height", shelfHeight)
            .css("top", self.Canvas.height() + shelfHeight + "px");

        self.LeftMask.css("width", shelfWidth).css("height", this.Container.height());
        self.RightMask.css("width", shelfWidth).css("height", this.Container.height())
            .css("left", self.Canvas.width() + shelfWidth + "px");

        self.Canvas.css("top", shelfHeight);
        self.Canvas.css("left", shelfWidth);

        if (self.Image.height() < shelfHeight + self.Canvas.height()) {
            self.Image.css("top", shelfHeight);
        }
        if (self.Image.width() < shelfWidth + self.Canvas.width()) {
            self.Image.css("left", shelfWidth);
        }
    },
    ResetFullMask: function () {
        var self = this;
        var height = parseInt(self.Image[0].naturalHeight / self.Image[0].naturalWidth * self.Image.width());
        self.Image.css("height", height + "px").css("left", "0").css("top", "0");
        self.Canvas.css("width", this.Image.width() + "px");
        self.Canvas.css("height", this.Image.height() + "px");
        var shelfHeight = 0;
        var shelfWidth = 0;
        self.TopMask.css("width", this.Container.width()).css("height", shelfHeight);
        self.BottomMask.css("width", this.Container.width()).css("height", shelfHeight)
            .css("top", self.Canvas.height() + shelfHeight + "px");

        self.LeftMask.css("width", shelfWidth).css("height", this.Container.height());
        self.RightMask.css("width", shelfWidth).css("height", this.Container.height())
            .css("left", self.Canvas.width() + shelfWidth + "px");

        self.Canvas.css("top", shelfHeight);
        self.Canvas.css("left", shelfWidth);

        if (self.Image.height() < shelfHeight + self.Canvas.height()) {
            self.Image.css("top", shelfHeight);
        }
        if (self.Image.width() < shelfWidth + self.Canvas.width()) {
            self.Image.css("left", shelfWidth);
        }
    },
    ResetFile: function () {
        this.File.val("");
    },
    RotateImage: function (file, loadFunc) {
        var self = this;
        var img = new Image();
        img.onload = function () {
            var canvas = document.createElement("canvas");
            var degree = 0;
            var width = img.naturalWidth;
            var height = img.naturalHeight;
            var drawWidth = width;
            var drawHeight = height;
            canvas.width = drawWidth;
            canvas.height = drawHeight;
            var context = canvas.getContext('2d');
            switch (self.Orientation) {
                case 3://iphone横屏拍摄，此时home键在左侧
                    degree = 180;
                    drawWidth = -width;
                    drawHeight = -height;
                    break;
                case 6://iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
                    canvas.width = height;
                    canvas.height = width;
                    drawWidth = width;
                    drawHeight = -height;
                    degree = 90;
                    break;
                case 8://iphone竖屏拍摄，此时home键在上方
                    canvas.width = height;
                    canvas.height = width;
                    degree = 180;
                    drawWidth = -width;
                    drawHeight = height;
                    break;
            }
            //使用canvas旋转校正
            context.rotate(degree * Math.PI / 180);
            context.drawImage(img, 0, 0, width, height, 0, 0, drawWidth, drawHeight);
            loadFunc(canvas.toDataURL("image/jpeg", .8));
        }
        img.src = file;

    },
    Cut: function () {
        var self = this;
        var func = function () {
            if (self.Image.is(":animated")) {
                self.Image.stop();
            }
            var canvas = document.createElement("canvas");
            var naturalWidth = self.Image[0].naturalWidth;
            var naturalHeight = self.Image[0].naturalHeight;
            var width = parseInt(naturalWidth * (self.Canvas.width() / self.Image.width()));
            var height = parseInt(naturalHeight * (self.Canvas.height() / self.Image.height()));
            var drawWidth = naturalWidth;
            var drawHeight = naturalWidth * (self.Canvas.height() / self.Canvas.width());
            if (drawWidth >= drawHeight && drawWidth > self.MaxWidth) {
                drawHeight = parseInt(drawHeight * (self.MaxWidth / drawWidth));
                drawWidth = self.MaxWidth;
            }
            else if (drawWidth < drawHeight && drawHeight > self.MaxHeight) {
                drawWidth = parseInt(drawWidth * (self.MaxHeight / drawHeight));
                drawHeight = self.MaxHeight;
            }
            if (self.Image.attr("OriginWidth") != undefined && self.Image.width() != parseInt(self.Image.attr("OriginWidth"))) {
                width = self.Canvas.width() / self.Image.width() * naturalWidth;
                height = parseInt(width * (self.Canvas.height() / self.Canvas.width()));
            }
            else if (self.Image.attr("OriginHeight") != undefined && self.Image.width() != parseInt(self.Image.attr("OriginHeight"))) {
                height = self.Canvas.height() / self.Image.height() * naturalHeight;
                width = parseInt(height * (self.Canvas.width() / self.Canvas.height()));
            }
            var x = parseInt((self.Canvas.position().left - self.Image.position().left) * (naturalWidth / self.Image.width()));
            var y = parseInt((self.Canvas.position().top - self.Image.position().top) * (naturalHeight / self.Image.height()));
            canvas.width = drawWidth;
            canvas.height = drawHeight;
            var context = canvas.getContext('2d');
            $(canvas).css("background", "#ffffff");
            context.drawImage(self.Image[0], x, y, width, height, 0, 0, drawWidth, drawHeight);
            self.ResetImage();
            var src = canvas.toDataURL("image/jpeg", .8);
            self.ViewImager.attr("src", src);
            if (this.IsSynchSaveImage) {
                self.SaveImage(src);
                self.SaveCutButton.removeAttr("IsClick");
                self.ResetFile();
            } else {
                var func = function () {
                    self.SaveCutButton.removeAttr("IsClick");
                    self.ResetFile();
                }
                self.SaveImage(src, func);
            }

        }
        func();
    },
    StartZoom: function (img) {
        this.IsZoom = true;
        if ($(img).attr("OriginWidth") == undefined) {
            $(img).attr("OriginWidth", $(img).width())
                .attr("OriginHeight", $(img).height())
                .attr("OriginLeft", $(img).position().left)
                .attr("OriginTop", $(img).position().top);

        }
    },//开始放大
    Zoom: function (img) {
        if ($(img).is(":animated"))
            return;
        var self = this;
        var originWidth = parseInt($(img).attr("OriginWidth"));
        var originHeight = parseInt($(img).attr("OriginHeight"));
        var onewidth = self.StartTouches[0].pageX - self.StartTouches[1].pageX;
        var oneheight = self.StartTouches[0].pageY - self.StartTouches[1].pageY;
        var towwidth = self.EndTouches[0].pageX - self.EndTouches[1].pageX;
        var towheight = self.EndTouches[0].pageY - self.EndTouches[1].pageY;
        var diswidth = Math.abs(towwidth) - Math.abs(onewidth);
        var disheight = Math.abs(towheight) - Math.abs(oneheight);
        //位置
        var centerX = (self.OriginTouches[0].pageX - self.OriginTouches[1].pageX) / 2 + self.OriginTouches[1].pageX;
        var centerY = (self.OriginTouches[0].pageY - self.OriginTouches[1].pageY) / 2 + self.OriginTouches[1].pageY;
        var startMinX = self.StartTouches[0].pageX < self.StartTouches[1].pageX ? self.StartTouches[0].pageX : self.StartTouches[1].pageX;
        var startMinY = self.StartTouches[0].pageY < self.StartTouches[1].pageY ? self.StartTouches[0].pageY : self.StartTouches[1].pageY;
        var endMinX = self.EndTouches[0].pageX < self.EndTouches[1].pageX ? self.EndTouches[0].pageX : self.EndTouches[1].pageX;
        var endMinY = self.EndTouches[0].pageY < self.EndTouches[1].pageY ? self.EndTouches[0].pageY : self.EndTouches[1].pageY;
        var disTop = endMinY - startMinY;
        var disLeft = endMinX - startMinX;
        var width = diswidth * 2.02 + $(img).width();
        var height = disheight * 2.02 + $(img).height();
        var left = $(img).position().left + disLeft * 2;
        var top = $(img).position().top + disTop * 2;
        if (Math.abs(diswidth / disheight) > originWidth / originHeight) {
            height = originHeight / originWidth * width;
            top = $(img).position().top + ($(img).height() - height) * centerY / originHeight;
        } else {
            width = originWidth / originHeight * height;
            left = $(img).position().left + ($(img).width() - width) * centerX / originWidth;
        }
        var info = { width: width, height: height, left: left, top: top };
        var rev = this.ResetZoom(img, info);
        $(img).animate(info, rev ? 30 : 0);
    },//放大
    EndZoom: function (img) {
        var self = this;
        if (!self.IsZoom)
            return;
        if ($(img).is(":animated")) {
            $(img).stop();
        }
        setTimeout(function () {
            self.IsZoom = false;
        }, 300);
        var info = { width: $(img).width(), height: $(img).height(), top: $(img).position().top, left: $(img).position().left };
        this.ResetZoom(img, info, true);
        $(img).animate(info, 300);
    },
    ResetZoom: function (img, info, isRestore) {
        var originWidth = parseInt($(img).attr("OriginWidth"));
        var originHeight = parseInt($(img).attr("OriginHeight"));
        var originLeft = parseInt($(img).attr("OriginLeft"));
        var originTop = parseInt($(img).attr("OriginTop"));
        var rev = false;
        if (originWidth * this.MinZoomMultiple > info.width) {
            info.width = isRestore ? originWidth * this.MinZoomMultiple : info.width - 2;
            info.height = info.width * originHeight / originWidth;
            info.top = originTop + parseInt((originHeight - info.height) / 2);
            info.left = originLeft + parseInt((originWidth - info.width) / 2);
            rev = true;
        }
        else if (originHeight * this.MinZoomMultiple > info.height) {
            info.height = isRestore ? originHeight * this.MinZoomMultiple : info.height - 2;
            info.width = info.height * originWidth / originHeight;
            info.top = originTop + parseInt((originHeight - info.height) / 2);
            info.left = originLeft + parseInt((originWidth - info.width) / 2);
            rev = true;
        }
        else if (info.width > originWidth * this.MaxZoomMultiple) {
            info.width = isRestore ? originWidth * this.MaxZoomMultiple : info.width + 2;
            info.height = info.width * originHeight / originWidth;
            info.top = $(img).position().top + parseInt(($(img).height() - info.height) / 2);
            info.left = $(img).position().left + parseInt(($(img).width() - info.width) / 2);
            rev = true;
        }
        else if (info.height > originHeight * this.MaxZoomMultiple) {
            info.height = isRestore ? originHeight * this.MaxZoomMultiple : info.height + 2;
            info.width = info.height * originWidth / originHeight;
            info.top = $(img).position().top + parseInt(($(img).height() - info.height) / 2);
            info.left = $(img).position().left + parseInt(($(img).width() - info.width) / 2);
            rev = true;
        }
        if (isRestore) {
            if (info.height > $(window).height() && info.height + info.top < $(window).height()) {//底部空白
                info.top = $(window).height() - info.height;
            } else if (info.height > $(window).height() && info.top > 0) {//头部空白
                info.top = 0;
            }
            else if (rev) {//超过
                info.top = info.height > originHeight ? $(img).position().top + ($(img).height() - info.height) / 2 : originTop;
            }
            else if (info.height < $(window).height()) {//不够
                info.top = ($(window).height() - info.height) / 2;
            }
            if (info.width > $(window).width() && info.width + info.left < $(window).width()) {//右边空白
                info.left = $(window).width() - info.width;
            }
            else if (info.width > $(window).width() && info.left > 0) {//左边空白
                info.left = 0;
            } else if (rev) {
                info.left = info.width > originWidth ? $(img).position().left + ($(img).width() - info.width) / 2 : originLeft;
            }
            else if (info.width < $(window).width()) {
                info.left = ($(window).width() - info.width) / 2;
            }

        }
        return rev;
    },
    ResetImage: function () {
        var self = this;
        if (self.Image.attr("OriginWidth") != undefined) {
            self.Image.css("width", self.Image.attr("OriginWidth") + "px")
                .css("height", self.Image.attr("OriginHeight") + "px")
                .css("left", self.Image.attr("OriginLeft") + "px")
                .css("top", self.Image.attr("OriginTop") + "px");
            self.Image.removeAttr("OriginWidth")
                .removeAttr("OriginHeight").removeAttr("OriginLeft")
                .removeAttr("OriginTop");
        }
    },
    SaveImage: function (data) {

    }

};



