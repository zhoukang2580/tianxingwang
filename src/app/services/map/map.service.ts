import { Platform } from "@ionic/angular";
import { Observable, from, of } from "rxjs";
import { map, switchMap, catchError } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MapPointModel } from '../../flight/models/MapPointModel';
import { AMapResultModel } from '../../flight/models/AMapResultModel';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: "root"
})
export class MapService {
  private baseUrl = "";
  private BMap: any = window["BMap"];
  private AMap: any = window["AMap"]; // 高德地图
  private _ak = "v7ZHTrOQZqCV2iDbQnkHoOeVEkrn8ktE";
  constructor(private http: HttpClient, private plt: Platform,private appRouterService: ConfigService) {
    appRouterService.get().then(r=>{
      if(!r.BaiduMapAk)
      {
        this._ak=r.BaiduMapAk;
      }
    });
    //   console.log(this.BMap);
  }
  getCurAMapPos() {
    return new Observable<MapPointModel>(obs => {
      if (!this.AMap || this.AMap.Map) {
        obs.error("定位出错啦");
        return;
      }
      const mapObj = new this.AMap.Map("amap");
      mapObj.plugin("AMap.Geolocation", () => {
        const geolocation = new this.AMap.Geolocation({
          enableHighAccuracy: true, // 是否使用高精度定位，默认:true
          timeout: 10000, // 超过10秒后停止定位，默认：无穷大
          maximumAge: 0, // 定位结果缓存0毫秒，默认：0
          convert: true, // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
          showButton: true, // 显示定位按钮，默认：true
          buttonPosition: "LB", // 定位按钮停靠位置，默认：'LB'，左下角
          buttonOffset: new this.AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
          showMarker: true, // 定位成功后在定位到的位置显示点标记，默认：true
          showCircle: true, // 定位成功后用圆圈表示定位精度范围，默认：true
          panToLocation: true, // 定位成功后将定位到的位置作为地图中心点，默认：true
          zoomToAccuracy: true // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
        mapObj.addControl(geolocation);
        geolocation.getCurrentPosition();
        this.AMap.event.addListener(
          geolocation,
          "complete",
          (result: AMapResultModel) => {
            const p = new MapPointModel();
            p.lat = result.position.lat;
            p.lng = result.position.lng;
            p.address = result.formattedAddress;
            p.curCity = result.addressComponent.city || result.addressComponent.province;
            console.log(result);
            obs.next(p);
            obs.complete();
          }
        ); // 返回定位信息
        this.AMap.event.addListener(geolocation, "error", e => {
          console.log(e.message);
          obs.error("定位出错");
        }); // 返回定位出错信息
      });
    })
      .pipe(
        catchError(e => {
          const p = new MapPointModel();
          p.address = e;
          p.curCity = "定位出错";
          return of(p);
        })
      )
      ;
  }
  getCurBMapPos() {
    return new Observable<MapPointModel>(obs => {
      if (!this.BMap || !this.BMap.Geolocation) {
        obs.error("无法定位");
        return;
      }
      const geolocation = new this.BMap.Geolocation();
      geolocation.getCurrentPosition(
        r => {
          if (geolocation.getStatus() === window["BMAP_STATUS_SUCCESS"]) {
            const point = new MapPointModel();
            point.lat = r.point.lat;
            point.lng = r.point.lng;
            console.log(r); // 121.48789949,31.24916171

            obs.next(point);
          } else {
            obs.error(`定位失败，错误码：${geolocation.getStatus()}`);
          }
        },
        { enableHighAccuracy: true }
      );
    }).pipe(
      switchMap(p =>
        this.convertoBMapPoint({
          coords: [{ lat: p.lat, lng: p.lng }]
        }).pipe(
          switchMap(point => {
            return new Observable<MapPointModel>(obs => {
              obs.next(point[0]);
              obs.complete();
            });
          })
        )
      )
    );
  }
  getAMapGeocoder(point: MapPointModel) { }
  getBMapGeocoder(point: MapPointModel) {
    return new Observable<MapPointModel>(obs => {
      // 创建地理编码实例
      const myGeo = new this.BMap.Geocoder();
      // 根据坐标得到地址描述
      myGeo.getLocation(new this.BMap.Point(point.lng, point.lat), result => {
        console.log(result); //
        // tslint:disable-next-line:max-line-length
        // addComp = rs.addressComponents;addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber
        if (result) {
          //   alert(result.address);
          point.address = result.address;
          obs.next(point);
          obs.complete();
        } else {
          obs.error("地址解析失败");
        }
      });
    });
  }
  /**
   * coords: 	需转换的源坐标，多组坐标以“；”分隔 （经度，纬度）
   * from:
   *    1：GPS设备获取的角度坐标，WGS84坐标;
        2：GPS获取的米制坐标、sogou地图所用坐标;
        3：google地图、soso地图、aliyun地图、mapabc地图和amap地图所用坐标，国测局（GCJ02）坐标;
        4：3中列表地图坐标对应的米制坐标;
        5：百度地图采用的经纬度坐标;
        6：百度地图采用的米制坐标;
        7：mapbar地图坐标;
        8：51地图坐标
    to:目标坐标类型：
        3：国测局（GCJ02）坐标;
        4：3中对应的米制坐标;
        5：bd09ll(百度经纬度坐标);
        6：bd09mc(百度米制经纬度坐标)

   * @param params ;
   */
  convertoBMapPoint(params: {
    coords: [{ lat: string; lng: string }];
    from?: number;
    to?: number;
  }) {
    params.from = params.from || 1;
    params.to = params.to || 5;
    const coords = params.coords.map(p => `${p.lng},${p.lat}`).join(";");
    console.log(coords);
    // http://api.map.baidu.com/geoconv/v1/?coords=114.21892734521,29.575429778924&from=1&to=5&ak=你的密钥 //GET请求
    return this.http
      .get(
        `${this.baseUrl}/geoconv/v1/?coords=${coords}&from=${params.from}&to=${
        params.to
        }&ak=${this._ak}`
      )
      .pipe(
        map(
          (r: {
            status: 0 | 1 | 4 | 21 | 22 | 24 | 25 | 26;
            result: {
              x: string; // 经度
              y: string; // 维度
            }[];
          }) => {
            const errors = {
              1: "内部错误",
              4: "转换失败", // X→GPS时必现，根据法律规定，不支持将任何类型的坐标转换为GPS坐标
              21: "from非法",
              22: "to非法",
              24: "coords格式非法",
              25: "coords个数非法，超过限制",
              26: "参数错误"
            };
            console.log(r);
            if (r.status === 0) {
              const ps = r.result.map(item => {
                const p = new MapPointModel();
                p.lng = item.x;
                p.lat = item.y;
                return p;
              });
              return ps;
            } else {
              throw new Error(errors[r.status]);
            }
          }
        )
      );
  }
}
