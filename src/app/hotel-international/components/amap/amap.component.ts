import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  Input,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { GaodeMapKey, MapService } from "src/app/services/map/map.service";
@Component({
  selector: "app-amap",
  templateUrl: "./amap.component.html",
  styleUrls: ["./amap.component.scss"],
})
export class AmapComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() latLng: { lat: string; lng: string };
  @Input() zoom = 13;
  private map;
  private marker;
  private get AMap() {
    return window["AMap"];
  }
  @ViewChild("container", { static: true }) container: ElementRef<HTMLElement>;
  constructor(
    private el: ElementRef<HTMLElement>,
    private mapService: MapService
  ) {}
  ngOnDestroy() {}
  ngOnInit() {}
  // private initAmap() {
  //   if (window["isLoadingAMapJs"]) {
  //     return;
  //   }
  //   return new Promise<any>((resv) => {
  //     if (!window["AMap"]) {
  //       setTimeout(() => {
  //         window["isLoadingAMapJs"] = false;
  //         resv();
  //       }, 5000);
  //       window["onAmapLoad"] = () => {
  //         window["isLoadingAMapJs"] = false;
  //         resv(window["AMap"]);
  //       };
  //       try {
  //         const url = `https://webapi.amap.com/maps?v=1.4.15&key=${GaodeMapKey}&callback=onAmapLoad`;
  //         const jsapi = document.createElement("script");
  //         jsapi.charset = "utf-8";
  //         jsapi.src = url;
  //         jsapi.type = "text/javascript";
  //         window["isLoadingAMapJs"] = true;
  //         document.head.appendChild(jsapi);
  //       } catch (e) {
  //         window["isLoadingAMapJs"] = false;
  //         resv();
  //         console.error(e);
  //       }
  //     } else {
  //       resv(window["AMap"]);
  //     }
  //   });
  // }
  async ngOnChanges(c: SimpleChanges) {
    if (c.latLng && c.latLng.currentValue) {
      // this.latLng.lat = `40.005337659`;
      // this.latLng.lng = "116.417911918";
      if (!c.latLng.firstChange) {
        this.moveToCenter();
      }
    } else {
      // this.latLng.lat = `40.005337659`;
      // this.latLng.lng = "116.417911918";
    }
  }
  ngAfterViewInit() {
    setTimeout(async () => {
      if (
        this.el.nativeElement.clientHeight &&
        this.el.nativeElement.clientWidth
      ) {
        this.container.nativeElement.style.width =
          this.el.nativeElement.clientWidth + "px";
        this.container.nativeElement.style.height =
          this.el.nativeElement.clientHeight + "px";
      }
      await this.initMap();
      this.moveToCenter();
    }, 200);
  }
  private async moveToCenter() {
    if (!this.map) {
      this.initMap();
    }
    if (this.map) {
      try {
        const lnglat = this.latLng;
        // 传入经纬度，设置地图中心点
        const position = new this.AMap.LngLat(lnglat.lng, lnglat.lat); // 标准写法
        // 简写 var position = [116, 39];
        this.map.setZoomAndCenter(this.zoom, position);
        setTimeout(() => {
          this.addMarker();
        }, 100);
      } catch (e) {
        console.error(e);
      }
    }
  }
  private addMarker() {
    try {
      if (this.map) {
        if (this.marker) {
          this.map.remove(this.marker);
        }
        const position = new this.AMap.LngLat(this.latLng.lng, this.latLng.lat);
        this.marker = new this.AMap.Marker({
          position,
          animation: "AMAP_ANIMATION_BOUNCE",
          width: "1.7em",
          height: "2em",
        });
        this.map.add(this.marker);
      }
    } catch (e) {
      console.error(e);
    }
  }
  private initMap() {
    this.map = this.mapService.initAMap(
      this.latLng,
      this.container.nativeElement,
      this.zoom
    );
  }
}
