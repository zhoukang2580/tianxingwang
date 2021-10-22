import { AppHelper } from "./../../appHelper";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { Injectable } from "@angular/core";
import { WechatHelper } from "src/app/wechatHelper";
import { BehaviorSubject, Subject } from "rxjs";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { StorageService } from "../storage-service.service";
export const baiduMapAk = `BFddaa13ba2d76f4806d1abb98ef907c`;
const _KEY_GET_LATEST_LOCATE_POS = `_key_get_latest_locate_pos`;
export interface MapPoint {
  lng: string;
  lat: string;
  province?: string;
  cityName?: string;
  address?: {
    city: string; // "上海市";
    city_code?: string; // 0;
    country?: string; // "";
    district?: string; // "";
    province?: string; // "上海市";
    street?: string; // "";
    street_number?: string; // "";
  };
}
@Injectable({
  providedIn: "root",
})
export class MapService {
  private static TAG = "map 定位 ";
  private st = Date.now();
  private querys: any;
  private initBMapPromise: Promise<any>;
  private bMapLocalSearchObj;
  private bMapLocalSearchSources: Subject<any[]>;
  private getMyPositionInfoPromise: Promise<IMyPositionInfo>;
  private getCurrentPositionByBMapPromise: Promise<MapPoint>;
  private markers = [];
  constructor(
    private apiService: ApiService,
    private storage: StorageService,
    private geolocation: Geolocation
  ) {
    this.querys = AppHelper.getQueryParamers();
    this.bMapLocalSearchSources = new BehaviorSubject([]);
    console.log("MapService,tree", this.querys);
    this.st = Date.now();
    AppHelper.isWechatMiniAsync().then((isMini) => {
      console.log("map service 是否是小程序环境：", isMini);
      if (!isMini) {
        this.initBMap();
      }
    });
    if (!AppHelper.isWechatMini()) {
      this.initBMap();
    }
  }
  static get BMap() {
    return window["BMap"];
  }
  setCenter(map, p: MapPoint) {
    if (map) {
      const point = new map.Point(p.lng, p.lat);
      map.setCenter(point);
    }
  }
  panTo(map, point: MapPoint) {
    if (map && point) {
      map.panTo(point);
    }
  }
  addMarker(map, point: MapPoint) {
    let mk;
    if (map && MapService.BMap && MapService.BMap.Marker) {
      if (!this.markers.find((it) => it == mk)) {
        mk = new MapService.BMap.Marker(point);
        map.addOverlay(mk);
        mk.setAnimation(window["BMAP_ANIMATION_BOUNCE"]);
        this.markers.push(mk);
      } else {
        this.panTo(map, point);
      }
    }
    return mk;
  }
  private async initBMap() {
    if (this.initBMapPromise) {
      return this.initBMapPromise;
    }
    this.initBMapPromise = new Promise<any>((rsv) => {
      let st = Date.now();
      window["init"] = function init() {
        console.log(`callback call , 耗时：${Date.now() - st}`);
        rsv(MapService.BMap);
      };
      setTimeout(() => {
        rsv(MapService.BMap);
      }, 60 * 1 * 1000);
      try {
        const isInitBMap = !!document.body.querySelector("#bmapscript");
        if (isInitBMap) {
          // rsv(this.checkIfWindowHasBMapObj());
          return this.initBMapPromise;
        }
        const script = document.createElement("script");
        script.id = "bmapscript";
        script.setAttribute("bmapscript", "bmapscript");
        script.type = "text/javascript";
        script.src = `https://api.map.baidu.com/api?v=3.0&ak=${baiduMapAk}&callback=init`;
        window["BMAP_PROTOCOL"] = "https";
        window["BMap_loadScriptTime"] = new Date().getTime();
        document.body.appendChild(script);
      } catch (e) {
        console.error(e);
        rsv(null);
      }
    });
    return this.initBMapPromise;
  }

  async getBMap(container: HTMLElement) {
    let bmap;
    if (!this.checkIfWindowHasBMapObj()) {
      await this.initBMap();
    }
    const BMap = MapService.BMap;
    if (this.checkIfWindowHasBMapObj()) {
      bmap = new BMap.Map(container);
    }
    return bmap;
  }
  private checkIfWindowHasBMapObj() {
    return !!MapService.BMap;
  }

  convertPoint(curPoint: MapPoint): Promise<MapPoint> {
    return new Promise((s, reject) => {
      if (!curPoint) {
        reject("要转换的point不存在");
      }
      const convertor = new MapService.BMap.Convertor();
      const pointArr = [];
      pointArr.push(curPoint);
      convertor.translate(pointArr, 1, 5, (data) => {
        if (data && data.status == 0) {
          s(data.points[0]);
        } else {
          reject(data);
        }
      });
    });
  }
  private async getCurrentPositionByBMap(): Promise<MapPoint> {
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
      8: `超时`,
    };
    if (!this.checkIfWindowHasBMapObj()) {
      await this.initBMap();
    }
    if (!this.checkIfWindowHasBMapObj()) {
      return Promise.reject("地图加载失败");
    }
    if (this.getCurrentPositionByBMapPromise) {
      return this.getCurrentPositionByBMapPromise;
    }
    this.getCurrentPositionByBMapPromise = new Promise<MapPoint>(
      (s, reject) => {
        let point: MapPoint;
        const geolocation = new MapService.BMap.Geolocation();
        setTimeout(() => {
          reject("定位超时");
        }, 2 * 60 * 1000);
        // 开启SDK辅助定位
        // geolocation.enableSDKLocation();
        console.time("百度地图定位到的当前位置geo");
        geolocation.getCurrentPosition(
          async (r: {
            address: {
              city: string; // "上海市";
              city_code?: string; // 0;
              country?: string; // "";
              district: string; // "";
              province?: string; // "上海市";
              street: string; // "";
              street_number?: string; // "";
            };
            point: MapPoint;
          }) => {
            console.timeEnd("百度地图定位到的当前位置geo");
            if (geolocation.getStatus() == window["BMAP_STATUS_SUCCESS"]) {
              point = r.point;
              if (r && r.point) {
                console.log(`百度地图定位到的当前位置`, r);
                const addresscomp = await this.getAddressComponents({
                  lat: r.point.lat,
                  lng: r.point.lng,
                });
                if (addresscomp) {
                  s({
                    lat: point.lat,
                    lng: point.lng,
                    cityName: r.address && r.address.city,
                    province: r.address && r.address.province,
                    address: {
                      city: addresscomp.city,
                      district: addresscomp.district,
                      street_number: addresscomp.streetNumber,
                      province: addresscomp.province,
                      street: addresscomp.street,
                    },
                  });
                } else {
                  s({
                    lat: point.lat,
                    lng: point.lng,
                    cityName: r.address && r.address.city,
                    province: r.address && r.address.province,
                    address: r.address,
                  });
                }
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
              reject(
                status[geolocation.getStatus()] || geolocation.getStatus()
              );
            }
          },
          {
            // 是否要求浏览器获取最佳效果，同浏览器定位接口参数。默认为false
            enableHighAccuracy: true,
            // timeout 超时事件，单位为毫秒。默认为10秒
            // maximumAge 允许返回指定事件内的缓存结果，单位为毫秒。如果为0，则每次请求都获取最新的定位结果。默认为10分钟
            SDKLocation: true,
          }
        );
      }
    );
    return this.getCurrentPositionByBMapPromise.finally(()=>{
      this.getCurrentPositionByBMapPromise=null;
    });
  }
  getBMapLocalSearchSources() {
    return this.bMapLocalSearchSources.asObservable();
  }
  onBMapLocalSearch(kw: string, p?: MapPoint) {
    if (!this.bMapLocalSearchObj) {
      let pt;
      if (!p) {
        p = {
          lat: "31.18334",
          lng: "121.43348",
        };
      }
      pt = new MapService.BMap.Point(p.lng, p.lat);
      this.bMapLocalSearchObj = new MapService.BMap.LocalSearch(pt, {
        pageCapacity: 20,
        onSearchComplete: (r) => {
          // console.log(r);
          this.bMapLocalSearchSources.next((r && r.Ar) || []);
        },
      });
    } else {
      this.bMapLocalSearchObj.search(kw);
    }
    return this.bMapLocalSearchSources.asObservable();
  }
  private async getCityAddressComponentsFromMap(
    p: MapPoint
  ): Promise<AddressComponents> {
    if (!this.checkIfWindowHasBMapObj()) {
      await this.initBMap();
    }
    if (!this.checkIfWindowHasBMapObj()) {
      return Promise.reject("地图加载失败");
    }
    return this.getAddressComponents(p);
  }
  async getAddressComponents(latlng: MapPoint) {
    try {
      // alert(!!BMap);
      if (!this.checkIfWindowHasBMapObj()) {
        await this.initBMap();
      }
      const pt = new MapService.BMap.Point(latlng.lng, latlng.lat);
      return new Promise<{
        province: string;
        city: string;
        district: string;
        street: string;
        streetNumber: string;
      }>((rsv) => {
        let st = Date.now();
        const geoc = new MapService.BMap.Geocoder({ extensions_town: true });
        let isResolve = false;
        geoc.getLocation(pt, function (rs) {
          console.log(`Geocoder 解析地址耗时 ${Date.now() - st}`);
          const addComp = rs.addressComponents;
          if (isResolve) {
            return;
          }
          isResolve = true;
          rsv(addComp);
        });
        setTimeout(() => {
          if (isResolve) {
            return;
          }
          isResolve = true;
          rsv(null);
        }, 25 * 1000);
      });
    } catch (e) {
      console.error(e);
    }
    return null;
  }
  async getMyCurMapPoint() {
    let p: MapPoint;
    try {
      if (await AppHelper.isWechatMiniAsync()) {
        const latLng = await this.wxGetLocation();
        if (latLng) {
          p = { lat: latLng.latitude, lng: latLng.longitude } as any;
          return p;
        }
      }
      const p1 = await this.getCurrentPositionByBMap().catch(() => null);
      if (p1) {
        p = {
          lat: p1.lat,
          lng: p1.lng,
        };
        return p;
      }
      const p2 = await this.getMyPositionInfo();
      if (p2 && p2.position) {
        p = {
          lat: p2.position.lat,
          lng: p2.position.lng,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return p;
  }
  private async getCurrentCityPositionInWechatMini(): Promise<{
    position: any;
  }> {
    let result: {
      position: any;
    };
    console.log(
      "getCurrentCityPositionInWechatMini queryParamMap",
      this.querys
    );
    if (!this.querys) {
      return null;
    }
    const latLng = {
      longitude: this.querys["lng"],
      latitude: this.querys["lat"],
    };
    console.log("getCurrentCityPositionInWechatMini ", latLng);
    if (latLng.latitude && latLng.longitude) {
      const p: MapPoint = {
        lng: latLng.longitude,
        lat: latLng.latitude,
      };
    } else {
      return null;
    }
    console.log("getCurrentCityPositionInWechatMini result", result);
    return result;
  }
  private async wxGetLocation(): Promise<{
    longitude: string;
    latitude: string;
  }> {
    await WechatHelper.ready();
    return new Promise<{ longitude: string; latitude: string }>((resolve) => {
      WechatHelper.wx.getLocation({
        type: "wgs84", //默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
        success: function (res) {
          //  res中longitude和latitude就是所获的的用户位置
          const longitude = res.longitude;
          const latitude = res.latitude;
          //调用坐标解析方法
          console.log("wxGetLocation,success", res);
          resolve({ longitude, latitude });
        },
        fail: function (e) {
          console.error(e);
          resolve(null);
        },
      });
    });
  }
  /**
   *腾讯地图转百度地图经纬度
   */
  qqMapTransBMap(lng, lat) {
    let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
    let x = lng;
    let y = lat;
    let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    let lngs = z * Math.cos(theta) + 0.0065;
    let lats = z * Math.sin(theta) + 0.006;
    return {
      lng: lngs,
      lat: lats,
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
      latitude: lats,
    };
  }
  async getMyPositionInfo() {
    const st = Date.now();
    let result: IMyPositionInfo = {} as IMyPositionInfo;
    if (this.getMyPositionInfoPromise) {
      return this.getMyPositionInfoPromise;
    }
    this.getMyPositionInfoPromise = new Promise<IMyPositionInfo>(
      async (rsv) => {
        const isMini = AppHelper.isWechatMini();
        if (isMini) {
          result = await this.getCurrentCityPositionInWechatMini();
          return rsv(result);
        }
        console.time("getCurrentPositionByBMap");
        let latLng: MapPoint = await this.getCurrentPositionByBMap().catch(
          () => null
        );
        console.timeEnd("getCurrentPositionByBMap");
        if (!latLng) {
          console.time("通过ip定位");
          latLng = await this.getPosByBMapIp();
          console.log("通过ip定位", latLng);
          console.timeEnd("通过ip定位");
        }
        console.log(`getLatLng 结束：耗时 ${Date.now() - st} latLng`, latLng);
        if (latLng) {
          if (!latLng.address || !latLng.address.city) {
            const addressComp = await this.getCityAddressComponentsFromMap({
              lat: latLng.lat,
              lng: latLng.lng,
            });
            console.log("getMyPositionInfo addressComp ", addressComp);
            if (addressComp) {
              latLng.address = {
                city: addressComp.city,
                district: addressComp.district,
                province: addressComp.province,
                street: addressComp.street,
                street_number: addressComp.streetNumber,
              };
              latLng.province = addressComp.province;
              latLng.cityName = latLng.cityName || addressComp.city;
            }
          }
          result.position = {
            lat: latLng.lat,
            lng: latLng.lng,
            cityName: latLng.cityName,
            address: latLng.address,
            province: latLng.province,
          };
        }
        rsv(
          result.position && result.position.lat && result.position.lng
            ? result
            : null
        );
      }
    ).finally(() => {
      this.getMyPositionInfoPromise = null;
    });
    return this.getMyPositionInfoPromise;
  }
  private async getPosResult(): Promise<{
    position: any;
  }> {
    let result: {
      position: any;
    };
    const isMini =
      (await AppHelper.isWechatMiniAsync()) || AppHelper.isWechatMini();
    if (isMini) {
      result = await this.getCurrentCityPositionInWechatMini();
      return result;
    }
    let latLng: MapPoint = await this.getMyPositionInfo().catch((_) => {
      console.error("getCurrentPosition error", _);
      return void 0;
    });
    console.log("getCurrentPosition", latLng);
    if (latLng) {
      result = {
        position: latLng,
      };
    }
    if (latLng) {
      const cityFromMap = await this.getCityAddressComponentsFromMap(
        latLng
      ).catch((_) => {
        console.error("getCityFromMap", _);
        return null;
      });
      if (cityFromMap) {
        result = {
          position: cityFromMap,
        };
      }
    }
    return result;
  }
  async getCurrentCityPosition(): Promise<{
    position: any;
  }> {
    let result: {
      position: any;
    };
    result = await this.getPosResult();
    return result;
  }
  private getPosByBMapIp(): Promise<MapPoint> {
    return new Promise<MapPoint>(async (s) => {
      if (!this.checkIfWindowHasBMapObj()) {
        await this.initBMap();
      }
      if (!this.checkIfWindowHasBMapObj()) {
        console.error("getCityNameByIp,BMap 地图尚未加载。。。");
        s(null);
        return;
      }
      let st = Date.now();
      const myCity = new MapService.BMap.LocalCity();
      let isResolve = false;
      setTimeout(() => {
        if (isResolve) {
          return;
        }
        isResolve = true;
        s(null);
      }, 50 * 1000);
      myCity.get(
        (rs: {
          center: {
            lat: string; // 31.236304654494646
            lng: string; // 121.48023738884737
          };
          code: number;
          level: number;
          name: string;
        }) => {
          console.log(`localcity 耗时：${Date.now() - st}`);
          if (isResolve) {
            return;
          }
          isResolve = true;
          if (rs && rs.name && rs.center) {
            s({ lat: rs.center.lat, lng: rs.center.lng, cityName: rs.name });
          } else {
            s(null);
          }
        }
      );
    });
  }
}
export interface AddressComponents {
  province: string; // 上海市
  city: string; // 上海市
  district: string; // 徐汇区
  street: string; // 肇嘉浜路
  streetNumber: string; // 366号11c
  town?: string; // 天平路街道
}
interface IMyPositionInfo {
  position: {
    lat: string;
    lng: string;
    cityName: string;
    province: any;
    address?: {
      city?: string; // "上海市";
      city_code?: string; // 0;
      district?: string; // "";
      province?: string; // "上海市";
      street?: string; // "";
      street_number?: string; // "";
    };
  };
}
