import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  Input,
  AfterViewInit
} from "@angular/core";
import { MapService } from "src/app/services/map/map.service";

@Component({
  selector: "app-amap",
  templateUrl: "./amap.component.html",
  styleUrls: ["./amap.component.scss"]
})
export class AmapComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() latLng: { lat: string; lng: string };
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
    if (c.latLng && c.latLng.currentValue) {
      // this.initMap();
      this.moveToCenter();
    }
  }
  ngAfterViewInit() {
    this.initMap();
  }
  private async moveToCenter() {
    try {
      const lnglat = await this.mapService.convertToAmap(this.latLng);
      // 传入经纬度，设置地图中心点
      const position = new this.AMap.LngLat(lnglat.lng, lnglat.lat); // 标准写法
      // 简写 var position = [116, 39];
      this.map.setCenter(position);
      this.addMarker(lnglat);
    } catch (e) {
      console.log(e);
    }
  }
  private addMarker(lnglat: any) {
    if (this.marker) {
      this.map.remove(this.marker);
      this.mapService.removeMarkerFromAmap(this.marker);
    }
    this.marker = this.mapService.addMarkerToAMap(lnglat);
  }
  private async initMap() {
    try {
      const gps = await this.mapService.convertToAmap(this.latLng);
      this.map = this.mapService.initAMap(gps, this.container.nativeElement);
      this.addMarker(gps);
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
