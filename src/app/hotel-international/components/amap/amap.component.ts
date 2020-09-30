import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  Input,
  AfterViewInit,
} from "@angular/core";
import { MapService } from "src/app/services/map/map.service";

@Component({
  selector: "app-amap",
  templateUrl: "./amap.component.html",
  styleUrls: ["./amap.component.scss"],
})
export class AmapComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() latLng: { lat: string; lng: string };
  @Input() zoom = 13;
  get AMap() {
    return window["AMap"] && window["AMap"].Map ? window["AMap"] : null;
  }
  private map;
  private marker;
  @ViewChild("container", { static: true }) container: ElementRef<HTMLElement>;
  constructor(
    private mapService: MapService,
    private el: ElementRef<HTMLElement>
  ) {}

  ngOnInit() {}
  ngOnChanges(c: SimpleChanges) {
    if (c.latLng && c.latLng.currentValue && !c.latLng.firstChange) {
      // this.initMap();
      this.moveToCenter();
    }
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
      this.moveToCenter();
    }, 200);
  }
  private async moveToCenter() {
    try {
      const lnglat = this.latLng;
      // 传入经纬度，设置地图中心点
      const position = new this.AMap.LngLat(lnglat.lng, lnglat.lat); // 标准写法
      // 简写 var position = [116, 39];
      if (this.map) {
        this.map.setCenter(position);
      }
      setTimeout(() => {
        this.addMarker(lnglat);
      }, 200);
    } catch (e) {
      console.error(e);
    }
  }
  private addMarker(lnglat: any) {
    if (this.marker) {
      this.mapService.moveAMapMarker(lnglat, this.marker);
      this.marker.show();
    } else {
      this.marker = this.mapService.addMarkerToAMap(lnglat, this.map);
      if (this.marker) {
        this.marker.show();
      }
    }
    setTimeout(() => {
      const img: HTMLImageElement = this.container.nativeElement.querySelector(
        ".amap-marker .amap-icon img"
      );
      if (img) {
        img.style.width = "1.5em";
        img.style.height = "1.5em";
      }
    }, 100);
  }
  private async initMap() {
    try {
      // const gps = await this.mapService.convertToAmap(this.latLng);
      const gps = this.latLng;
      this.map = this.mapService.initAMap(
        gps,
        this.container.nativeElement,
        this.zoom
      );
      setTimeout(() => {
        this.addMarker(gps);
      }, 100);
      // const m = this.mapService.getAMap(gps);
      // if (m.amapContainer) {
      //   const div: HTMLElement = m.amapContainer.cloneNode(true) as any;
      //   div.classList.remove("hidden");
      //   this.container.nativeElement.insertBefore(div, null);
      // }
    } catch (e) {
      console.log(e);
    }
  }
}
