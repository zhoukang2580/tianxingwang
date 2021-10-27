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
    city?: string; // "上海市";
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

  geocoderGetPoint(address: string, city: string) {
    if (MapService.BMap) {
      const geoCoder = new MapService.BMap.Geocoder();
      return new Promise<MapPoint>((rsv) => {
        setTimeout(() => {
          rsv(null);
        }, 1 * 60 * 1000);
        geoCoder.getPoint(
          address,
          (d: MapPoint) => {
            rsv(d);
          },
          city
        );
      });
    }
  }
  geocoderGetLocation(point: MapPoint, options?: LocationOptions) {
    if (MapService.BMap) {
      const geoCoder = new MapService.BMap.Geocoder();
      return new Promise<GeocoderResult>((rsv) => {
        setTimeout(() => {
          rsv(null);
        }, 1 * 60 * 1000);
        geoCoder.getLocation(
          point,
          (d: GeocoderResult) => {
            rsv(d);
          },
          options
        );
      });
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
    return this.getCurrentPositionByBMapPromise.finally(() => {
      this.getCurrentPositionByBMapPromise = null;
    });
  }
  getBMapLocalSearchSources() {
    return this.bMapLocalSearchSources.asObservable();
  }
  removeOverlay(map:any,overlay:any){
    if(map&&overlay){
      map.removeOverlay(overlay)
    }
  }
  async bMapLocalSearch(address: string, cityName: string,forceLocal?:boolean) {
    return new Promise<LocalSearchResult[]>((rsv) => {
      let p: MapPoint;
      let isRsv = false;
      if (MapService.BMap) {
        const ss = new MapService.BMap.LocalSearch(cityName, {
          pageCapacity: 20,
          onSearchComplete: async (r: {
            Br: LocalSearchResult[];
            bounds: any; // undefined;
            center: any; // undefined;
            city: string; // "上海市";
            keyword: string; // "13号线 长清路";
            moreResultsUrl: string; // "https://api.map.baidu.com/place/search?res=jsapi&query=13号线 长清路&region=上海市&output=html";
            province: string; // "上海市";
            radius: any; // undefined;
            suggestions: any[];
            viewport: any; // undefined;
          }) => {
            console.log(r);
            if (!isRsv) {
              rsv(r && r.Br);
            }
            isRsv = true;
          },
        });
        // forceLocal 是否限定在城市内部
        ss.search(address, { forceLocal });
      } else {
        isRsv = true;
        rsv(null);
      }
      setTimeout(() => {
        if (!isRsv) {
          rsv(null);
        }
      }, 2 * 60 * 1000);
    });
  }
  private async getCityAddressComponentsFromMap(
    p: MapPoint
  ): Promise<AddressComponent> {
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
      if (!MapService.BMap.LocalCity) {
        s(null);
        return;
      }
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
export interface AddressComponent {
  province: string; // 上海市
  city: string; // 上海市
  district: string; // 徐汇区
  street: string; // 肇嘉浜路
  streetNumber: string; // 366号11c
  town?: string; // 天平路街道
}
export interface LocationOptions {
  poiRadius: number; //	Number	附近POI所处于的最大半径，默认为100米
  numPois: number; //	返回的POI点个数，默认为10个。取值范围
}
export interface GeocoderResult {
  point: MapPoint; //	坐标点
  address: string; //	String	地址描述
  addressComponents: AddressComponent; //	结构化的地址描述
  surroundingPois: Array<LocalResultPoi>; //附近的POI点
  business: string; //	String	商圈字段，代表此点所属的商圈
}
export interface LocalResultPoi {
  title: string; //	String	结果的名称标题
  point: MapPoint; //	Point	该结果所在的地理位置
  url: string; //	String	在百度地图中展示该结果点的详情信息链接
  address: string; //	String	地址（根据数据部分提供）。注：当结果点类型为公交站或地铁站时，地址信息为经过该站点的所有车次
  city: string; //	String	所在城市
  phoneNumber: string; //	String	电话，根据数据部分提供
  postcode: string; //	String	邮政编码，根据数据部分提供
  type: string; //	PoiType	类型，根据数据部分提供
  isAccurate: boolean; //	Boolean	是否精确匹配。只适用LocalSearch的search方法检索的结果
  province: string; //	String	所在省份
  tags: string[]; //	Array<String>	POI的标签，如商务大厦、餐馆等。目前只有LocalSearch的回调函数onSearchComplete(result)中的result和Geocoder.getLocation的回调函数的参数GeocoderResult.surroundingPois涉及的LocalResultPoi有tags字段。其他API涉及的LocalResultPoi没有该字段
  detailUrl: string; //String	在百度地图详情页面展示该结果点的链接。localsearch的结果中才有
}
export enum PoiType {
  BMAP_POI_TYPE_NORMAL = "BMAP_POI_TYPE_NORMAL", //	一般位置点
  BMAP_POI_TYPE_BUSSTOP = "BMAP_POI_TYPE_BUSSTOP", //	公交车站位置点
  BMAP_POI_TYPE_SUBSTOP = "BMAP_POI_TYPE_SUBSTOP", //	地铁车站位置点
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
type BMap = any;
interface LocalSearchResult {
  address: string; // "地铁13号线"
  city: string; // "上海市"
  detailUrl: string; // "http://api.map.baidu.com/place/detail?uid=8e96868f139f405cc17da27d&output=html&source=jsapi"
  isAccurate: boolean; // false
  phoneNumber: string; // undefined
  point: {
    lng: string; // 121.49516012980966,
    lat: string; // 31.17977651039708,
    Ye: string; //'inner'
  };
  postcode: string; // undefined
  province: string; // "上海市"
  src_type: string; // ""
  tags: string[]; // (3) ['交通设施', '地铁/轻轨', '地铁/轻轨站']
  title: string; // "长清路"
  type: number; // 3
  uid: string; // "8e96868f139f405cc17da27d"
  url: string; // "https://gsp0.baidu.com/80MWsjip0QIZ8tyhnq/?s=inf%26uid%3D8e96868f139f405cc17da27d%26c%3D289&i=0&sr=1"
}
