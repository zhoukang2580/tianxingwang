Winner.ImageRecover = function (failover) {
  this.Failover = failover; //{[[Url:"",IsNormal:true,GroupName:'']],DefaultUrl:''}
};
Winner.ImageRecover.prototype = {
  Initialize: function (container) {
    //加载css样式文件
    this.LoadImages(container || document);
  },
  LoadImages: function (content) {
    const isInstanceofHTMLDiv = content instanceof HTMLDivElement;
    const img = document.createElement("img");
    if (content instanceof HTMLDivElement) {
      img.onload = _ => {
        console.log("div background image ", img.src);
        // content.style.backgroundColor = "#FFCC80";
        content.style.backgroundImage = `url(${img.src})`;
      }
    }
    var allImages = content instanceof HTMLImageElement ? [content] : isInstanceofHTMLDiv ? [img] : content.getElementsByTagName("img");
    for (var i = 0; i < allImages.length; i++) {
      this.BindErrorEvent(allImages[i]);
    }
  },
  BindErrorEvent: function (img) {
    if (!img.onerror) {
      var self = this;
      var tempImg = document.createElement("img");
      img.onerror = function () {
        self.Replace(img);
      };
      tempImg.onerror = function () {
        self.Replace(img);
      };
      tempImg.src = img.src;
    }
  },
  Replace: function (img) {
    //替换
    if (
      img.src != undefined &&
      this.Failover.DefaultUrl != undefined &&
      img.src.toLowerCase() == this.Failover.DefaultUrl.toLowerCase()
    )
      return;
    var date = new Date();
    var node = this.GetNode(img.src);
    if (node == null && this.Failover.DefaultUrl) {
      if (img.src.includes("?")) {
        img.src = this.Failover.DefaultUrl + "&v=" + date;
      } else {
        img.src = this.Failover.DefaultUrl + "?v=" + date;
      }
      return;
    }
    var isRecover = false;
    for (var i = 0; i < this.Failover.Nodes.length; i++) {
      if (
        this.Failover.Nodes[i].IsNormal == false ||
        this.Failover.Nodes[i].GroupName != node.GroupName
      )
        continue;
      var src = img.src.split("?")[0];
      img.src =
        src.replace(node.Url, this.Failover.Nodes[i].Url)
      if (img.src.includes("?")) {
        img.src += "&v=" + date;
      } else {
        img.src += "?v=" + date
      }
      isRecover = true;
      break;
    }
    if (
      isRecover == false &&
      this.Failover.DefaultUrl != undefined &&
      this.Failover.DefaultUrl != ""
    ) {
      if (img.src.includes("?")) {
        img.src = this.Failover.DefaultUrl + "&v=" + date;
      } else {
        img.src = this.Failover.DefaultUrl + "?v=" + date;
      }
    }
  },
  GetNode: function (url) {
    //得到负载数据
    for (var i = 0; i < this.Failover.Nodes.length; i++) {
      if (url.indexOf(this.Failover.Nodes[i].Url) > -1) {
        this.Failover.Nodes[i].IsNormal = false;
        return this.Failover.Nodes[i];
      }
    }
    return null;
  }
};
