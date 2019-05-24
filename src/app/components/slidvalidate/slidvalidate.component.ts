import { Component, OnInit, AfterViewInit, Renderer2, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { Platform, ToastController } from '@ionic/angular';
import { LanguageHelper } from 'src/app/languageHelper';

@Component({
  selector: 'app-slidvalidate-com',
  templateUrl: './slidvalidate.component.html',
  styleUrls: ['./slidvalidate.component.scss'],
})
export class SlidvalidateComponent implements OnInit, AfterViewInit {
  l = 42; // 滑块边长
  r = 9; // 滑块半径
  w = 310; // canvas宽度
  h = 155; // canvas高度
  PI = Math.PI;
  L = this.l + this.r * 2 + 3; // 滑块实际边长
  isIE = window.navigator.userAgent.indexOf('Trident') > -1;
  @ViewChild('pic')
  pic: ElementRef;
  el:HTMLElement;
  canvasCtx: CanvasRenderingContext2D;
  blockCtx: CanvasRenderingContext2D;
  @ViewChild('canvas')
  canvasEl: ElementRef; // 画布
  @ViewChild('blockcanvas')
  blockCanvasEl: ElementRef;
  canvas: HTMLCanvasElement; // 画布
  block: HTMLCanvasElement;
  sliderContainer;
  refreshIcon;
  sliderMask;
  slider;
  sliderIcon;
  text;
  y = 0;
  img;
  x = 0;
  trail: number[] = [];
  failed:boolean;
  slideValid:boolean=false;
  timeUsed:number;
  @Output()  slideEvent:EventEmitter<boolean>;
  constructor(private render: Renderer2, private plt: Platform,private toastCtrl:ToastController) { 
    this.slideEvent=new EventEmitter();
  }
  ngOnInit() {
    this.w = this.plt.width();
    this.h = Math.floor(this.plt.height() * 0.4);
  }
  ngAfterViewInit() {
    // this.w = this.el.clientWidth;
    // this.h = this.el.clientHeight;
    this.el = this.pic.nativeElement;
    this.block=this.blockCanvasEl.nativeElement;
    this.canvas=this.canvasEl.nativeElement;
    console.dir(this.el);
    this.init();
  }
  getRandomNumberByRange(start, end) {
    return Math.round(Math.random() * (end - start) + start);
  }
  onSuccess() {
    this.failed=false;
    this.slideValid=true;
    this.slideEvent.emit(true);
    // if(+(this.timeUsed/1000).toFixed(2)>=0){
    //   this.toastCtrl.create({
    //     position:"middle",
    //     duration:1000,
    //     message:LanguageHelper.slideValidateUseTime()
    //     // +` ${(this.timeUsed/1000).toFixed(2)}s`
    //   }).then(t=>t.present());
    // }
  }
  onFail() {
    this.failed=true;
    this.slideValid=false;
    this.slideEvent.emit(false);
  }
  onRefresh() {
    this.failed=false;
    this.slideValid=false;
  };
  createCanvas(width, height) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
  }

  createImg(onload: () => any) {
    const tempImage = new Image();
    tempImage.crossOrigin = "Anonymous";
    tempImage.onload = () => {
      onload();
    };
    tempImage.onerror = () => {
      tempImage.src = this.getRandomImgSrc(true);
    }
    tempImage.src = this.getRandomImgSrc();
    return tempImage;
  }

  createElement(tagName, className) {
    const el = document.createElement(tagName);
    this.render.addClass(el, className);
    return el;
  }

  addClass(tag: HTMLElement, className) {
    this.render.addClass(tag, className);
  }

  removeClass(tag: HTMLElement, className) {
    this.render.removeClass(tag, className);
  }

  getRandomImgSrc(defaultImage: boolean = false) {
    if (defaultImage) {
      return 'assets/images/train.jpg';
    }
    return AppHelper.getApiUrl() + "/home/ImageCodeUrl?width=" + this.w + "&height=" + this.h;
    // return `//picsum.photos/${this.w}/150/?image=` + this.getRandomNumberByRange(0, 1084);
    // const images = ['airplane-l.jpg', 'airplane.jpg', 'train.jpg'];
    // return "assets/images/" + images[Math.floor(Math.random() * images.length)];
  }

  drawPic(ctx: CanvasRenderingContext2D, x, y, operation) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x + this.l / 2, y - this.r + 2, this.r, 0.72 * this.PI, 2.26 * this.PI);
    ctx.lineTo(x + this.l, y);
    ctx.arc(x + this.l + this.r - 2, y + this.l / 2, this.r, 1.21 * this.PI, 2.78 * this.PI);
    ctx.lineTo(x + this.l, y + this.l);
    ctx.lineTo(x, y + this.l);
    ctx.arc(x + this.r - 2, y + this.l / 2, this.r + 0.4, 2.76 * this.PI, 1.24 * this.PI, true);
    ctx.lineTo(x, y);
    // ctx.shadowBlur = 1;
    // ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.stroke();
    ctx[operation]();
    ctx.globalCompositeOperation = this.isIE ? 'xor' : 'overlay';
  }

  sum(x, y) {
    return x + y;
  }

  square(x) {
    return x * x;
  }


  init() {
    this.initDOM();
    this.initImg();
    this.bindEvents();
  }

  initDOM() {
    this.render.setStyle(this.el, 'width', this.w + "px");
    // this.canvas = document.getElementById("canvas") as HTMLCanvasElement;//this.createCanvas(this.w, this.h) // 画布
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    // this.block = document.getElementById("block") as HTMLCanvasElement; // 拼图部分
    this.block.width=this.w;
    this.block.height=this.h;
    this.sliderContainer = this.el.querySelector(".sliderContainer");//  this.createElement('div','sliderContainer');
    this.refreshIcon = this.el.querySelector(".refreshIcon");// this.createElement('div', 'refreshIcon')
    this.sliderMask = this.el.querySelector(".sliderMask");// this.createElement('div', 'sliderMask')
    this.slider = this.el.querySelector(".slider");//this.createElement('div', 'slider')
    this.sliderIcon = this.el.querySelector(".sliderIcon");//this.createElement('span', 'sliderIcon')
    this.text = this.el.querySelector(".sliderText");// this.createElement('span', 'sliderText')
    this.text.innerHTML = LanguageHelper.getSlidvalidateInnerTip();
    this.canvasCtx = this.canvas.getContext('2d');
    this.blockCtx = this.block.getContext('2d');
  }
  initImg() {
    const img = this.createImg(() => {
      this.draw();
      // this.drawGrayLayer();
      this.canvasCtx.drawImage(img, 0, 0, this.w, this.h);
      this.blockCtx.drawImage(img, 0, 0, this.w, this.h);
      const y = this.y - this.r * 2 - 1;
      const ImageData = this.blockCtx.getImageData(this.x - 3, y, this.L, this.L);
      this.block.width = this.L;
      this.blockCtx.putImageData(ImageData, 0, y);
    })
    this.img = img;
  }
  drawPicScale(img: HTMLImageElement, ctx: CanvasRenderingContext2D, width: number = 300, height: number = 200) {
    var w = img.width;
    var h = img.height;
    var dw = width / w;         //canvas与图片的宽高比
    var dh = height / h;
    var ratio
    // 裁剪图片中间部分
    if (w > width && h > height || w < width && h < height) {
      if (dw > dh) {
        ctx.drawImage(img, 0, (h - height / dw) / 2, w, height / dw, 0, 0, width, height)
      } else {
        ctx.drawImage(img, (w - width / dh) / 2, 0, width / dh, h, 0, 0, width, height)
      }
    }
    // 拉伸图片
    else {
      if (w < width) {
        ctx.drawImage(img, 0, (h - height / dw) / 2, w, height / dw, 0, 0, width, height)
      } else {
        ctx.drawImage(img, (w - width / dh) / 2, 0, width / dh, h, 0, 0, width, height)
      }
    }
  }

  draw() {
    // 随机创建滑块的位置
    this.x = this.getRandomNumberByRange(this.L + 10, this.w - (this.L + 10));
    this.y = this.getRandomNumberByRange(10 + this.r * 2, this.h - (this.L + 10));
    this.drawPic(this.canvasCtx, this.x, this.y, 'fill')
    this.drawPic(this.blockCtx, this.x, this.y, 'clip')
  }
  drawGrayLayer() {
    this.canvasCtx.restore();
    this.canvasCtx.fillStyle = 'rgba(0,0,0,.5)';
    this.canvasCtx.fillRect(0, 0, this.w, this.h);
    this.canvasCtx.restore();
  }

  clean() {
    this.canvasCtx.clearRect(0, 0, this.w, this.h);
    this.blockCtx.clearRect(0, 0, this.w, this.h);
    this.block.width = this.w;
  }
  refreshIconClick() {
    this.reset();
    this.onRefresh();
  }
  bindEvents() {
    let originX, originY, trail = [], isMouseDown = false;
    const handleDragStart = (e) => {
      this.timeUsed=Date.now();
      originX = e.clientX || e.touches[0].clientX;
      originY = e.clientY || e.touches[0].clientY;
      isMouseDown = true;
    }
    let lastTime = Date.now();
    const handleDragMove = (e) => {
      if (Date.now() - lastTime <= 32) {
        return;
      }
      if (!isMouseDown) return false
      const eventX = e.clientX || e.touches[0].clientX
      const eventY = e.clientY || e.touches[0].clientY
      const moveX = eventX - originX
      const moveY = eventY - originY
      if (moveX < 0 || moveX + 38 >= this.w) return false;
      this.render.setStyle(this.slider, 'left', moveX + 'px');
      const blockLeft = (this.w - 40 - 20) / (this.w - 40) * moveX;
      this.render.setStyle(this.block, 'left', blockLeft + "px");
      this.addClass(this.sliderContainer, 'sliderContainer_active');
      this.render.setStyle(this.sliderMask, 'width', moveX + 'px');
      trail.push(moveY);
    }

    const handleDragEnd = (e) => {
      this.timeUsed=Date.now()-this.timeUsed;
      if (!isMouseDown) return false
      isMouseDown = false
      const eventX = e.clientX || e.changedTouches[0].clientX
      if (eventX == originX) return false
      this.removeClass(this.sliderContainer, 'sliderContainer_active')
      this.trail = trail;
      const { spliced, verified } = this.verify();
      if (spliced) {
        if (verified) {
          this.addClass(this.sliderContainer, 'sliderContainer_success')
          this.onSuccess()
        } else {
          this.addClass(this.sliderContainer, 'sliderContainer_fail')
          this.text.innerHTML = ''
          this.reset()
        }
      } else {
        this.addClass(this.sliderContainer, 'sliderContainer_fail')
        this.onFail()
        setTimeout(() => {
          this.reset()
        }, 1000)
      }
    }
    this.slider.addEventListener('mousedown', handleDragStart.bind(this));
    this.slider.addEventListener('touchstart', handleDragStart.bind(this));
    this.slider.addEventListener('mousemove', handleDragMove.bind(this));
    this.slider.addEventListener('touchmove', handleDragMove.bind(this));
    this.slider.addEventListener('mouseup', handleDragEnd.bind(this));
    this.slider.addEventListener('touchend', handleDragEnd.bind(this));
  }

  verify() {
    const arr = this.trail // 拖动时y轴的移动距离
    if (arr.length == 0) {
      return {
        spliced: false,
        verified: false
      }
    }
    const average = arr.reduce(this.sum) / arr.length;
    const deviations = arr.map(x => x - average);
    const stddev = Math.sqrt(deviations.map(this.square).reduce(this.sum) / arr.length);
    const left = parseInt(this.block.style.left);
    return {
      spliced: Math.abs(left - Math.abs(this.x)) <= 6,
      verified: stddev !== 0, // 简单验证下拖动轨迹，为零时表示Y轴上下没有波动，可能非人为操作
    }
  }

  reset() {
    this.sliderContainer.className = 'sliderContainer';
    this.render.setStyle(this.block, 'left', 0);
    this.render.setStyle(this.slider, 'left', 0);
    this.render.setStyle(this.sliderMask, 'width', 0);
    this.clean();
    // this.drawGrayLayer();
    this.img.src = this.getRandomImgSrc();
    this.onRefresh();
  }
}




