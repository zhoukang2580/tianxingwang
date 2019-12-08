import { AppHelper } from './../../appHelper';
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { Injectable } from "@angular/core";
import { WechatHelper } from 'src/app/wechatHelper';
export const baiduMapAk = `BFddaa13ba2d76f4806d1abb98ef907c`;
export interface MapPoint {
  lng: string;
  lat: string;
  province?: string;
  cityName?: string;
}
@Injectable({
  providedIn: "root"
})
export class MapService {
  private static TAG = "map 定位";
  private st = Date.now();
  constructor(private apiService: ApiService) {
    this.st = Date.now();
    AppHelper.isWechatMiniAsync().then(isMini => {
      console.log("map service 是否是小程序环境：", isMini);
      if (!isMini) {
        this.initBMap();
      }
    })
  }
  private initBMap() {
    setTimeout(() => {
      try {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://api.map.baidu.com/getscript?v=3.0&ak=${baiduMapAk}&services=&t=20191126111618"></script>`;
        (function () { window['BMAP_PROTOCOL'] = "https"; window['BMap_loadScriptTime'] = (new Date).getTime(); document.head.appendChild(script); })();
      } catch (e) {
        console.error(e);
      }
    }, 1000);
  }
  private convertPoint(curPoint: MapPoint): Promise<MapPoint> {
    return new Promise((s, reject) => {
      if (!curPoint) {
        reject("要转换的point不存在");
      }
      const convertor = new window["BMap"].Convertor();
      const pointArr = [];
      pointArr.push(curPoint);
      convertor.translate(pointArr, 1, 5, data => {
        if (data && data.status == 0) {
          s(data.points[0]);
        } else {
          reject(data);
        }
      });
    });
  }
  private getCurrentPosition(): Promise<MapPoint> {
    // 关于状态码
    //  BMAP_STATUS_SUCCESS	检索成功。对应数值“0”。
    // BMAP_STATUS_CITY_LIST	城市列表。对应数值“1”。
    // BMAP_STATUS_UNKNOWN_LOCATION	位置结果未知。对应数值“2”。
    // BMAP_STATUS_UNKNOWN_ROUTE	导航结果未知。对应数值“3”。
    // BMAP_STATUS_INVALID_KEY	非法密钥。对应数值“4”。
    // BMAP_STATUS_INVALID_REQUEST	非法请求。对应数值“5”。
    // BMAP_STATUS_PERMISSION_DENIED	没有权限。对应数值“6”。(自 1.1 新增)
    // BMAP_STATUS_SERVICE_UNAVAILABLE	服务不可用。对应数值“7”。(自 1.1 新增)
    // BMAP_STATUS_TIMEOUT	超时。对应数值“8”。(自 1.1 新增)
    //  百度地图API功能
    const status = {
      0: "检索成功。",
      1: `城市列表。`,
      2: `位置结果未知`,
      3: `导航结果未知`,
      4: `非法密钥`,
      5: `非法请求`,
      6: `没有权限`,
      7: `服务不可用`,
      8: `超时`
    };
    if (!window["BMap"]) {
      return Promise.reject("地图加载失败");
    }
    return new Promise<MapPoint>((s, reject) => {
      const map = new window["BMap"].Map("allmap");
      let point: MapPoint;
      const geolocation = new window["BMap"].Geolocation();
      setTimeout(() => {
        reject("定位超时");
      }, 10 * 1000);
      geolocation.getCurrentPosition(
        (r: {
          address: {
            city: string; // "上海市";
            city_code: string; // 0;
            country: string; // "";
            district: string; // "";
            province: string; // "上海市";
            street: string; // "";
            street_number: string; // "";
          };
          point: MapPoint;
        }) => {
          if (geolocation.getStatus() == window["BMAP_STATUS_SUCCESS"]) {
            // const mk = new BMap.Marker(r.point);
            // map.addOverlay(mk);
            // map.panTo(r.point);
            // alert("您的位置：" + r.point.lng + "," + r.point.lat);
            point = r.point;
            if (r && r.point) {
              console.log(MapService.TAG, "当前位置", r);
              s({
                lat: point.lat,
                lng: point.lng,
                cityName: r.address && r.address.city,
                province: r.address && r.address.province
              });
            } else {
              reject(
                status[geolocation.getStatus()] || geolocation.getStatus()
              );
            }
          } else {
            // alert("failed" + geolocation.getStatus());
            console.error(
              `${MapService.TAG} 出错，`,
              status[geolocation.getStatus()] || geolocation.getStatus()
            );
            reject(status[geolocation.getStatus()] || geolocation.getStatus());
          }
        },
        { enableHighAccuracy: true }
      );
    }).catch(_ => null);
  }
  private getCityFromMap(p: MapPoint): Promise<AddressComponents> {
    if (!window["BMap"]) {
      return Promise.reject("地图加载失败");
    }
    const geoc = new window["BMap"].Geocoder();
    return new Promise<AddressComponents>((s, reject) => {
      geoc.getLocation(p, rs => {
        const addComp: AddressComponents = rs && rs.addressComponents;
        s(addComp);
      });
    });
  }
  async getCurMapPoint() {
    if (await AppHelper.isWechatMiniAsync()) {
      const latLng = await this.wxGetLocation();
      if (latLng) {
        return { lat: latLng.latitude, lng: latLng.longitude } as MapPoint;
      }
    }
    return this.getCurrentPosition();
  }
  private async getCurrentCityPositionInWechatMini(): Promise<{
    city: TrafficlineEntity;
    position: any;
  }> {
    let result: {
      city: TrafficlineEntity;
      position: any;
    };
    if (window['wx']) {
      const p = AppHelper.getQueryParamers();
      const latLng = { longitude: p['lng'], latitude: p['lat'] };
      if (latLng.latitude && latLng.longitude) {
        const p: MapPoint = {
          lng: latLng.longitude,
          lat: latLng.latitude
        };
        const city = await this.getCityByMap(p).catch(_ => {
          console.error("getCityByMap", _);
          return null;
        });
        if (city) {
          result = {
            city: {
              CityName: city.CityName,
              CityCode: city.CityCode
            } as any,
            position: latLng
          };
        }
      } else {
        return null;
      }
    }
    return result;
  }
  private async wxGetLocation(): Promise<{ longitude: string; latitude: string; }> {
    await WechatHelper.ready();
    return new Promise<{ longitude: string; latitude: string; }>(resolve => {
      WechatHelper.wx.getLocation({
        type: 'wgs84', //默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标 
        success: function (res) {
          //  res中longitude和latitude就是所获的的用户位置
          const longitude = res.longitude
          const latitude = res.latitude
          //调用坐标解析方法
          console.log("wxGetLocation,success", res);
          resolve({ longitude, latitude });
        }, fail: function (e) {
          console.error(e);
          resolve(null);
        }
      })
    });
  }
  /**
   *腾讯地图转百度地图经纬度
   */
  qqMapTransBMap(lng, lat) {
    let x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    let x = lng;
    let y = lat;
    let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    let lngs = z * Math.cos(theta) + 0.0065;
    let lats = z * Math.sin(theta) + 0.006;
    return {
      lng: lngs,
      lat: lats
    };
  }

  /*
   * 百度转腾讯
   */
  bMapTransqqMap(lng, lat) {
    let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
    let x = lng - 0.0065;
    let y = lat - 0.006;
    let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    let lngs = z * Math.cos(theta);
    let lats = z * Math.sin(theta);
    return {
      longitude: lngs,
      latitude: lats
    };
  }
  async getCurrentCityPosition(): Promise<{
    city: TrafficlineEntity;
    position: any;
  }> {
    const isMini = await AppHelper.isWechatMiniAsync() || AppHelper.isWechatMini();
    let result: {
      city: TrafficlineEntity;
      position: any;
    };
    if (isMini) {
      result = await this.getCurrentCityPositionInWechatMini();
      return;
    }
    let latLng: MapPoint = await this.getCurrentPosition().catch(_ => {
      console.error("getCurrentPosition error", _);
      return void 0;
    });
    console.log("getCurrentPosition", latLng);
    if (latLng) {
      result = {
        city: {
          CityName: latLng.cityName,
          CityCode: ""
        } as any,
        position: latLng
      };
    }
    // if (!latLng) {
    //   latLng = await this.getCurrentPostionByNavigator().catch(_ => {
    //     console.error("getCurrentPostionByNavigator", _);
    //     return null;
    //   });
    //   console.log("getCurrentPostionByNavigator", latLng);
    // }
    console.log("getCurrentCityPosition after", latLng);
    if (latLng) {
      const city = await this.getCityByMap(latLng).catch(_ => {
        console.error("getCityByMap", _);
        return null;
      });
      if (city) {
        result = {
          city: {
            CityName: city.CityName,
            CityCode: city.CityCode
          } as any,
          position: latLng
        };
      } else {
        const cityFromMap = await this.getCityFromMap(latLng).catch(_ => {
          console.error("getCityFromMap", _);
          return null;
        });
        if (cityFromMap) {
          result = {
            city: {
              CityCode: "",
              CityName: cityFromMap.city
            } as any,
            position: cityFromMap
          };
        }
      }
    } else {
      const name = await this.getCityNameByIp().catch(_ => {
        console.error("getCityNameByIp", _);
        return null;
      });
      if (name) {
        result = {
          city: {
            CityCode: "",
            CityName: name
          } as any,
          position: ""
        };
      }
    }
    return result;
  }
  private getCityNameByIp() {
    return new Promise<string>(s => {
      if (!window["BMap"]) {
        console.error("getCityNameByIp,BMap 地图尚未加载。。。");
        s(null);
      }
      const myCity = new window["BMap"].LocalCity();
      myCity.get((rs: { name: string }) => {
        if (rs && rs.name) {
          s(rs.name);
        } else {
          s(null);
        }
      });
    });
  }
  private async getCityByMap(p: MapPoint) {
    const req = new RequestEntity();
    req.Method = "TmcApiHotelUrl-City-GetCityByMap";
    req.Data = p;
    return await this.apiService.getPromiseData<{
      CityName: string;
      CityCode: string;
    }>(req);
  }
  private getCurrentPostionByNavigator(): Promise<MapPoint> {
    if (
      navigator &&
      navigator.geolocation &&
      navigator.geolocation.getCurrentPosition
    ) {
      return new Promise<MapPoint>((s, reject) => {
        navigator.geolocation.getCurrentPosition(
          async position => {
            if (position && position.coords) {
              const curPoint = new window["BMap"].Point(
                position.coords.longitude,
                position.coords.latitude
              );
              const p: MapPoint = await this.convertPoint(curPoint).catch(e => {
                console.error("getCurrentPostionByNavigator", e);
                return null;
              });
              if (p) {
                s(p);
              } else {
                reject("Navigator 定位失败");
              }
            } else {
              reject("Navigator 定位失败");
            }
          },
          error => {
            reject(error);
          },
          {
            enableHighAccuracy: false,
            timeout: 3 * 1000,            //获取位置允许的最长时间
            maximumAge: 1000          //多久更新获取一次位置       
          }
        );
      });
    }
    return Promise.reject("手机不支持 Navigator geolocation 定位");
  }
}
export interface AddressComponents {
  province: string;
  city: string;
  district: string;
  street: string;
  streetNumber: string;
}
