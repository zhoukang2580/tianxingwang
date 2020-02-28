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
// const BMap = window["BMap"];
const BMapLib = window["BMapLib"];
@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"]
})
export class MapComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() lat: string;
  @Input() lng: string;
  @ViewChild("container") private container: ElementRef<HTMLElement>;
  map: any;
  private curLatLng: MapPoint;
  constructor(private mapService: MapService) {}
  private async getCurPosition() {
    this.curLatLng = await this.mapService.getCurMapPoint().catch(_ => {
      console.error("获取当前位置失败", _);
      return {
        lat: "116.404",
        lng: "39.915"
      };
    });
  }
  ngOnInit() {
    // this.getCurPosition();
  }
  ngOnDestroy() {
    if (this.map) {
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
    if (!this.lat || !this.lng) {
      await this.getCurPosition();
      this.lat = (this.curLatLng && this.curLatLng.lat) || "40.057031";
      this.lng = (this.curLatLng && this.curLatLng.lng) || "116.307852";
    }
    if (!this.map) {
      this.map = this.mapService.getMap(container);
    }
    if (this.map) {
      const point = new window["BMap"].Point(this.lng, this.lat);
      this.map.centerAndZoom(point, 14);
      // this.map.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放
      const marker = new window["BMap"].Marker(point); // 创建标注
      marker.setAnimation(window["BMAP_ANIMATION_BOUNCE"]); // 跳动的动画
      this.map.addOverlay(marker); // 将标注添加到地图中
      // this.initAndPanToMarker({ lat: this.lat, lng: this.lng });
    }
  }
  private initAndPanToMarker(p: MapPoint) {
    const point = new window["BMap"].Point(
      p.lng || this.lng,
      p.lat || this.lat
    );
    const marker = new window["BMap"].Marker(point); // 创建标注
    // const content =
    //   '<div style="margin:0;line-height:20px;padding:2px;">' +
    //   '<img src="../img/baidu.jpg" alt="" style="float:right;zoom:1;overflow:hidden;width:100px;height:100px;margin-left:3px;"/>' +
    //   "地址：北京市海淀区上地十街10号<br/>电话：(010)59928888<br/>简介：百度大厦位于北京市海淀区西二旗地铁站附近，为百度公司综合研发及办公总部。" +
    //   "</div>";
    // const searchInfoWindow = new BMapLib.SearchInfoWindow(this.map, content, {
    //   title: "百度大厦", // 标题
    //   width: 290, // 宽度
    //   height: 105, // 高度
    //   panel: "panel", // 检索结果面板
    //   enableAutoPan: true, // 自动平移
    //   searchTypes: [
    //     window["BMAPLIB_TAB_SEARCH"], // 周边检索
    //     window["BMAPLIB_TAB_TO_HERE"], // 到这里去
    //     window["BMAPLIB_TAB_FROM_HERE"] // 从这里出发
    //   ]
    // });
    // marker.addEventListener("click", e => {
    //   searchInfoWindow.open(marker);
    // });
    this.map.addOverlay(marker); // 将标注添加到地图中
    marker.setAnimation(window["BMAP_ANIMATION_BOUNCE"]); // 跳动的动画
    this.map.panTo(point);
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
        setTimeout(() => {
          this.initAndPanToMarker({ lat: this.lat, lng: this.lng });
        }, 200);
      }
    }
  }
  ngAfterViewInit() {
    if (this.container && this.container.nativeElement) {
      setTimeout(() => {
        this.createMap(this.container.nativeElement).catch(e => {
          console.error(e);
        });
      }, 200);
    }
  }
}
