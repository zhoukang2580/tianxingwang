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
// const BMap = MapService.BMap;
const BMapLib = window["BMapLib"];
@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  private subscription = Subscription.EMPTY;
  private bouncAnimate: any;
  @Input() latLng: {
    lat: string;
    lng: string;
  };
  @ViewChild("container") private container: ElementRef<HTMLElement>;
  private map: any;
  private zoomLevel = 19;
  private posMarker: any;
  constructor(private mapService: MapService) {}
  ngOnInit() {
    // this.getCurPosition();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  private removePosMarker() {
    if (this.posMarker) {
      this.map.removeOverlay(this.posMarker);
    }
  }
  private addPosMarker(p: MapPoint) {
    if (p) {
      this.removePosMarker();
      this.posMarker = new MapService.BMap.Marker(
        new MapService.BMap.Point(p.lng, p.lat)
      );
      if (this.map) {
        const icon = new window["BMap"].Icon(
          "https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
          {
            width: 28,
            height: 28,
          },
          {
            anchor: {
              width: 28,
              height: 28,
            },
          }
        );
        // new MapService.BMap.Icon(
        //   "assets/images/tipaction.gif",
        //   {
        //     width: 35,
        //     height: 35,
        //   },
        //   {
        //     anchor: {
        //       width: -35,
        //       height: 20,
        //     },
        //   }
        // )
        this.posMarker.setIcon(icon);
        this.map.addOverlay(this.posMarker);
        this.posMarker.setAnimation(window["BMAP_ANIMATION_BOUNCE"]);
      }
    }
  }
  private async createMap(container: HTMLElement) {
    if (!MapService.BMap) {
      return;
    }
    if (!this.map) {
      this.map = await this.mapService.getBMap(container);
    }
    const scaleCtrl = new MapService.BMap.ScaleControl({
      anchor: window["BMAP_ANCHOR_TOP_LEFT"],
      offset: { width: 10, height: 30 },
    });
    if (this.map && MapService.BMap && MapService.BMap.Point) {
      this.map.addControl(scaleCtrl);
      if (this.posMarker) {
        this.removePosMarker();
      }
      if (this.latLng) {
        const point = new MapService.BMap.Point(
          this.latLng.lng,
          this.latLng.lat
        );
        this.map.centerAndZoom(point, this.zoomLevel);
      }
    }
  }
  onBackToLatLng() {
    this.initAndPanToMarker(this.latLng);
  }

  private initAndPanToMarker(p: MapPoint) {
    if (!MapService.BMap || !MapService.BMap.Point || !this.map || !p) {
      return;
    }
    const point = new MapService.BMap.Point(p.lng, p.lat);
    this.removePosMarker();
    this.addPosMarker(point);
    this.map.centerAndZoom(point, this.zoomLevel);
    if (this.bouncAnimate) {
      clearInterval(this.bouncAnimate);
    }
    let isSet = false;
    let limit = 200;
    this.bouncAnimate = setInterval(() => {
      if (--limit < 1) {
        clearInterval(this.bouncAnimate);
      }
      if (this.posMarker) {
        this.posMarker.setAnimation(window["BMAP_ANIMATION_BOUNCE"]); // 跳动的动画
        const el: HTMLElement = this.posMarker.fd;
        if (el && el.parentElement) {
          const target = el.parentElement;
          if (!isSet) {
            isSet = true;
            target.parentElement.classList.add(
              "animate__animated",
              "animated",
              "infinite",
              "bounce"
            );
            target.style.setProperty("--animate-duration", "0.5s");
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
      setTimeout(async () => {
        await this.createMap(this.container.nativeElement);
        this.initAndPanToMarker(this.latLng);
      }, 0);
    }
  }
}
