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
  OnDestroy
} from "@angular/core";
import { AppComponent } from "src/app/app.component";
import { Subscription, fromEvent, interval } from "rxjs";
// const BMap = window["BMap"];
const BMapLib = window["BMapLib"];
@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"]
})
export class MapComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private subscription = Subscription.EMPTY;
  @Input() lat: string;
  @Input() lng: string;
  @ViewChild("container") private container: ElementRef<HTMLElement>;
  map: any;
  private marker: any;
  constructor(private mapService: MapService) { }
  ngOnInit() {
    // this.getCurPosition();
    this.autoPanTo();
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
  private async createMap(container: HTMLElement) {
    // console.log(container);
    // if (!this.lat || !this.lng) {
    //   this.lat = "40.057031";
    //   this.lng = "116.307852";
    // }
    if(!window["BMap"]){
      return;
    }
    if (!this.map) {
      this.map = this.mapService.getBMap(container);
    }
    // 定义一个控件类，即function
    const ZoomControl = {
      // 设置默认停靠位置和偏移量
      defaultAnchor: window["BMap"].BMAP_ANCHOR_TOP_LEFT,
      defaultOffset: new window["BMap"].Size(10, 10),
      initialize: map => {
        // 创建一个DOM元素
        const div = document.createElement("div");
        // 添加文字说明
        div.appendChild(document.createTextNode("放大2级"));
        // 设置样式
        div.style.cursor = "pointer";
        div.style.border = "1px solid gray";
        div.style.backgroundColor = "white";
        // 绑定事件，点击一次放大两级
        div.onclick = e => {
          map.zoomTo(map.getZoom() + 2);
        };
        // 添加DOM元素到地图中
        map.getContainer().appendChild(div);
        // 将DOM元素返回
        return div;
      }
    };
    if (this.map && window["BMap"] && window["BMap"].Point) {
      this.map.addControl(ZoomControl);
      this.map.addEventListener("dragstart", this.onMapDragstart.bind(this));
      this.map.addEventListener("dragend", this.onMapDragEnd.bind(this));
      const point = new window["BMap"].Point(this.lng, this.lat);
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
    this.stopPanTo();
  }
  private onMapDragEnd() {
    console.log("dragend");
    this.autoPanTo();
  }
  private initAndPanToMarker(p?: MapPoint) {
    if (!window["BMap"] || !window["BMap"].Point || !this.map) {
      return;
    }
    const point = new window["BMap"].Point(
      (p && p.lng) || this.lng,
      (p && p.lat) || this.lat
    );
    if (this.marker) {
      this.map.removeOverlay(this.marker);
    }
    this.marker = new window["BMap"].Marker(point); // 创建标注
    this.map.addOverlay(this.marker); // 将标注添加到地图中
    this.marker.setAnimation(window["BMAP_ANIMATION_BOUNCE"]); // 跳动的动画
    // this.map.panTo(point);
    this.map.centerAndZoom(point, 18);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (
      changes &&
      changes.lat &&
      changes.lng &&
      changes.lat.currentValue &&
      changes.lng.currentValue
    ) {
      if (this.map) {
        this.initAndPanToMarker({ lat: this.lat, lng: this.lng });
      }
    }
  }
  ngAfterViewInit() {
    if (this.container && this.container.nativeElement) {
      setTimeout(() => {
        this.createMap(this.container.nativeElement).catch(e => {
          console.error(e);
        });
      }, 1000);
    }
  }
  private autoPanTo() {
    this.stopPanTo();
    this.subscription = interval(2 * 1000).subscribe(() => {
      this.initAndPanToMarker();
    });
  }
  private stopPanTo() {
    this.subscription.unsubscribe();
  }
}
