import { MapService, MapPoint } from "./../../services/map/map.service";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  Optional,
  OnDestroy,
} from "@angular/core";
import { AppComponent } from "src/app/app.component";
import { Subscription, fromEvent, interval } from "rxjs";
// const BMap = window["BMap"];
const BMapLib = window["BMapLib"];
@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private subscription = Subscription.EMPTY;
  private bouncAnimate: any;
  @Input() latLng: {
    lat: string;
    lng: string;
  };
  @ViewChild("container") private container: ElementRef<HTMLElement>;
  map: any;
  private marker: any;
  private dragendTimer: any;
  constructor(private mapService: MapService) {}
  ngOnInit() {
    // this.getCurPosition();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.map) {
      this.map.removeEventListener("dragend", this.onMapDragEnd.bind(this));
      this.map.removeEventListener("dragstart", this.onMapDragstart.bind(this));
      const iframs = document.querySelectorAll("iframe");
      if (iframs) {
        iframs.forEach((el: HTMLIFrameElement) => {
          if (el.src.includes("baidu")) {
            try {
              document.body.removeChild(el);
            } catch (e) {
              console.error("删除iframe", e);
            }
          }
        });
      }
    }
  }
  private createMap(container: HTMLElement) {
    // console.log(container);
    // if (!this.lat || !this.lng) {
    //   this.lat = "40.057031";
    //   this.lng = "116.307852";
    // }
    if (!window["BMap"]) {
      return;
    }
    if (!this.map) {
      this.map = this.mapService.getBMap(container);
    }
    // 定义一个控件类，即function
    const ZoomControl = {
      // 设置默认停靠位置和偏移量
      defaultAnchor: window["BMap"].BMAP_ANCHOR_TOP_LEFT,
      defaultOffset: new window["BMap"].Size(15, 15),
      initialize: (map) => {
        // 创建一个DOM元素
        const div = document.createElement("div");
        // 添加文字说明
        div.appendChild(document.createTextNode("放大2级"));
        // 设置样式
        div.style.cursor = "pointer";
        div.style.border = "1px solid gray";
        div.style.backgroundColor = "white";
        // 绑定事件，点击一次放大两级
        div.onclick = (e) => {
          map.zoomTo(map.getZoom() + 2);
        };
        // 添加DOM元素到地图中
        map.getContainer().appendChild(div);
        // 将DOM元素返回
        return div;
      },
    };
    if (this.map && window["BMap"] && window["BMap"].Point) {
      this.map.addControl(ZoomControl);
      // this.map.addEventListener("dragstart", this.onMapDragstart.bind(this));
      // this.map.addEventListener("dragend", this.onMapDragEnd.bind(this));
      const point = new window["BMap"].Point(this.latLng.lng, this.latLng.lat);
      const opts = { offset: new window["BMap"].Size(10, 10) };
      this.map.addControl(new window["BMap"].ScaleControl(opts));
      if (this.marker) {
        this.map.removeOverlay(this.marker);
      }
      // this.map.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放
      this.map.centerAndZoom(point, 18);
    }
  }
  private onMapDragstart() {
    console.log("dragstart");
  }
  onBackToLatLng() {
    this.initAndPanToMarker();
  }
  private onMapDragEnd() {
    if (this.dragendTimer) {
      clearTimeout(this.dragendTimer);
    }
    console.log("dragend");
    // this.dragendTimer = setTimeout(() => {
    //   this.autoPanTo();
    // }, 5000);
  }
  private initAndPanToMarker(p?: MapPoint) {
    if (!window["BMap"] || !window["BMap"].Point || !this.map) {
      return;
    }
    const point = new window["BMap"].Point(
      (p && p.lng) || this.latLng.lng,
      (p && p.lat) || this.latLng.lat
    );
    if (this.marker) {
      this.map.removeOverlay(this.marker);
    }
    const icon = new window[
      "BMap"
    ].Icon(
      "https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
      { width: 30, height: 30, transition: `all ease-in-out 200ms` }
    );
    // icon.imageSize = "cover";
    this.marker = new window["BMap"].Marker(point, {
      icon,
      // title:this.
    }); // 创建标注
    this.map.addOverlay(this.marker); // 将标注添加到地图中
    this.marker.setAnimation(window["BMAP_ANIMATION_BOUNCE"]); // 跳动的动画
    // this.map.panTo(point);
    this.map.centerAndZoom(point, 18);
    if (this.bouncAnimate) {
      clearInterval(this.bouncAnimate);
    }
    let isSet = false;
    this.bouncAnimate = setInterval(() => {
      // console.log("marker", this.marker);
      if (this.marker) {
        this.marker.setAnimation(window["BMAP_ANIMATION_BOUNCE"]); // 跳动的动画
        const el = this.marker.ca;
        if (el) {
          if (!isSet) {
            isSet = true;
            el.classList.add(
              "animate__animated",
              "animated",
              "infinite",
              "bounce"
            );
            el.style.setProperty("--animate-duration", "0.5s");
            clearInterval(this.bouncAnimate);
          }
        }
      }
    }, 200);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.latLng && changes.latLng.currentValue) {
      if (this.map) {
        this.initAndPanToMarker({ lat: this.latLng.lat, lng: this.latLng.lng });
      }
    }
  }
  ngAfterViewInit() {
    if (this.container && this.container.nativeElement) {
      setTimeout(() => {
        this.createMap(this.container.nativeElement);
        this.initAndPanToMarker();
        requestAnimationFrame(() => {
          const el = this.container.nativeElement.querySelector(".BMap_Marker");
          if (el && el.firstChild) {
            (el.firstChild as HTMLElement).style.width = `35px`;
            (el.firstChild as HTMLElement).style.height = `30px`;
          }
        });
      }, 1000);
    }
  }
}
