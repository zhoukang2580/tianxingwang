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
  isShowRouting = false;
  isSearchingRoute = false;
  isShowRoutePan = false;
  private myPos: MapPoint;
  @ViewChild("routeResult", { static: true })
  routeResult: ElementRef<HTMLElement>;
  constructor(private mapService: MapService) {}
  ngOnInit() {
    // this.getCurPosition();
    this.initIsShowRouting();
  }
  private async initIsShowRouting() {
    if (this.latLng) {
      if (!this.myPos) {
        this.myPos = await this.mapService.getMyCurMapPoint();
      }
      if (!this.myPos) {
        return;
      }
      const distance = this.mapService.getDistance(
        this.map,
        this.latLng,
        this.myPos
      );
      this.isShowRouting = distance < 5000;
    }
  }
  async onRoute() {
    try {
      if (!MapService.BMap || this.isSearchingRoute) {
        return;
      }
      this.isSearchingRoute = true;
      const myPos = this.myPos || (await this.mapService.getMyCurMapPoint());
      this.myPos = myPos;
      const distance = this.mapService.getDistance(
        this.map,
        myPos,
        this.latLng
      );
      let r;
      if (distance <= 2000) {
        r = this.getWalkingRoute(this.map, this.latLng);
      }
      if (distance > 2000 && distance <= 5000) {
        r = this.getRidingRoute(this.map, this.latLng);
      }
      if (distance > 5000) {
        r = this.getDrivingRoute(this.map, this.latLng);
      }
      if (r) {
        r.search(
          new MapService.BMap.Point(myPos.lng, myPos.lat),
          new MapService.BMap.Point(this.latLng.lng, this.latLng.lat)
        );
        r.setSearchCompleteCallback((res) => {
          console.log("search res", res);
          this.isSearchingRoute = false;
          this.isShowRoutePan = true;
        });
        r.setInfoHtmlSetCallback((poi) => {
          console.log(poi);
        });
      }
    } catch (e) {
      console.error(e);
      this.isSearchingRoute = false;
    }
  }
  private getWalkingRoute(map, p: MapPoint) {
    const bp = new MapService.BMap.Point(p.lng, p.lat);
    const r = new MapService.BMap.WalkingRoute(bp, {
      renderOptions: {
        map: map, //展现结果的地图实例。当指定此参数后，搜索结果的标注、线路等均会自动添加到此地图上
        autoViewport: true,
        // panel: this.routeResult.nativeElement,
      },
    });
    return r;
  }
  // 用于获取骑行路线规划方案。
  private getRidingRoute(map, p: MapPoint) {
    const bp = new MapService.BMap.Point(p.lng, p.lat);
    const r = new MapService.BMap.RidingRoute(bp, {
      renderOptions: {
        map: map, //展现结果的地图实例。当指定此参数后，搜索结果的标注、线路等均会自动添加到此地图上
        autoViewport: true,
      },
    });
    return r;
  }
  // 此类用于获取驾车路线规划方案。
  private getDrivingRoute(map, p: MapPoint) {
    const bp = new MapService.BMap.Point(p.lng, p.lat);
    const r = new MapService.BMap.DrivingRoute(bp, {
      renderOptions: {
        map: map, //展现结果的地图实例。当指定此参数后，搜索结果的标注、线路等均会自动添加到此地图上
        autoViewport: true,
      },
    });
    return r;
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
          // "https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
          "https://api.map.baidu.com/images/marker_red_sprite.png",
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
            target.classList.add(
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
