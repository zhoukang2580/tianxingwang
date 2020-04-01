import { AppHelper } from "./../../appHelper";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { Injectable } from "@angular/core";
import { WechatHelper } from "src/app/wechatHelper";
export const baiduMapAk = `BFddaa13ba2d76f4806d1abb98ef907c`;
export const GaodeMapKey = `42acb0dcc0c0541c738f8842ffb360ce`;
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
  private querys: any;
  private amap: any;
  private amapContainer: HTMLElement;
  constructor(private apiService: ApiService) {
    this.querys = AppHelper.getQueryParamers();
    console.log("MapService,tree", this.querys);
    this.st = Date.now();
    AppHelper.isWechatMiniAsync().then(isMini => {
      console.log("map service 是否是小程序环境：", isMini);
      if (!isMini) {
        this.initBMap();
      }
    });
    if (!AppHelper.isWechatMini()) {
      this.initGaoDeMap();
    }
  }
  private initBMap() {
    setTimeout(() => {
      try {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `https://api.map.baidu.com/getscript?v=3.0&ak=${baiduMapAk}&services=&t=20191126111618`;
        (() => {
          window["BMAP_PROTOCOL"] = "https";
          window["BMap_loadScriptTime"] = new Date().getTime();
          document.head.appendChild(script);
        })();
      } catch (e) {
        console.error(e);
      }
    }, 1000);
  }
  convertToAmap(p: { lat: string; lng: string }) {
    return new Promise<{ lat: string; lng: string }>((resolve, reject) => {
      const gps = [p.lng, p.lat];
      if (window["AMap"]) {
        window["AMap"].convertFrom(gps, "gps", (status, result) => {
          console.log("convertToAmap ", status, result);
          if (result.info === "ok") {
            const lnglats: {
              Q: string; // 28.372125;
              R: string; // -81.502408;
              lat: string; // 28.372125;
              lng: string; // -81.502408;
            }[] = result.locations; // Array.<LngLat>
            console.log(
              `convertToAmap olat=${p.lat},olng=${p.lng}`,
              lnglats[0]
            );
            resolve({ lat: lnglats[0].lat, lng: lnglats[0].lng });
          } else {
            reject(result);
          }
        });
      } else {
        reject("");
      }
    });
  }
  private initGaoDeMap() {
    setTimeout(() => {
      try {
        // const script = document.createElement("script");
        // script.type = "text/javascript";
        // const st = Date.now();
        // script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${GaodeMapKey}`;
        // script.onload = () => {
        //   console.log("加载脚本完成", Date.now() - st);
        // };
        // document.body.appendChild(script);
        window["onLoad"] = () => {
          this.getAMap({ lat: "36.675807", lng: "117.000923" });
        };
        const url = `https://webapi.amap.com/maps?v=1.4.15&key=${GaodeMapKey}&callback=onLoad`;
        const jsapi = document.createElement("script");
        jsapi.charset = "utf-8";
        jsapi.src = url;
        document.head.appendChild(jsapi);
      } catch (e) {
        console.error(e);
      }
    }, 100);
  }
  getBMap(container: HTMLElement) {
    let bmap;
    if (window["BMap"] && window["BMap"].Map) {
      bmap = new window["BMap"].Map(container);
    }
    return bmap;
  }

  getAMap(lnglat: { lng: string; lat: string }) {
    if (this.amap) {
      if (lnglat) {
        if (window["AMap"] && window["AMap"].LngLat) {
          const AMap = window["AMap"];
          // 传入经纬度，设置地图中心点
          const position = new AMap.LngLat(lnglat.lng, lnglat.lat); // 标准写法
          // 简写 var position = [116, 39];
          this.amap.setCenter(position);
          // 获取地图中心点
          // const currentCenter = this.amap.getCenter();
        }
      }
      return { map: this.amap, amapContainer: this.amapContainer };
    }
    this.amapContainer = document.getElementById("amap");
    if (!this.amapContainer) {
      this.amapContainer = document.createElement("div");
      this.amapContainer.id = "amap";
      this.amapContainer.classList.add("hidden");
      this.amapContainer.style.width = "100%";
      this.amapContainer.style.height = "100%";
      document.body.append(this.amapContainer);
    }
    if (window["AMap"] && window["AMap"].Map) {
      this.amap = new window["AMap"].Map(this.amapContainer, {
        zoom: 13, // 级别
        resizeEnable: true,
        vectorMapForeign: "English",
        center: [lnglat.lng, lnglat.lat] // 中心点坐标
        // viewMode: "3D" // 使用3D视图
      });
    }
    return { map: this.amap, amapContainer: this.amapContainer };
  }
  initAMap(lnglat: { lng: string; lat: string }, el?: HTMLElement) {
    let map;
    if (window["AMap"] && window["AMap"].Map) {
      map = new window["AMap"].Map(el || this.amapContainer, {
        zoom: 13, // 级别
        resizeEnable: true,
        vectorMapForeign: "English",
        center: [lnglat.lng, lnglat.lat] // 中心点坐标
        // viewMode: "3D" // 使用3D视图
      });
    }
    return map;
  }
  addMarkerToAMap(latlng: { lat: string; lng: string }) {
    let marker;
    if (window["AMap"] && window["AMap"].Marker && this.amap) {
      const AMap = window["AMap"];
      marker = new AMap.Marker({
        icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
        offset: new AMap.Pixel(-13, -30),
        position: [latlng.lng, latlng.lat] // 位置
      });
      this.amap.add(marker); // 添加到地图
    }
    return marker;
  }
  removeMarkerFromAmap(marker) {
    if (this.amap) {
      this.amap.remove(marker);
    }
  }
  convertPoint(curPoint: MapPoint): Promise<MapPoint> {
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
      let point: MapPoint;
      const geolocation = new window["BMap"].Geolocation();
      setTimeout(() => {
        reject("定位超时");
      }, 5 * 1000);
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
        { enableHighAccuracy: false }
      );
    });
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
    console.log(
      "getCurrentCityPositionInWechatMini queryParamMap",
      this.querys
    );
    if (!this.querys) {
      return null;
    }
    const latLng = {
      longitude: this.querys["lng"],
      latitude: this.querys["lat"]
    };
    console.log("getCurrentCityPositionInWechatMini ", latLng);
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
    return result;
  }
  private async wxGetLocation(): Promise<{
    longitude: string;
    latitude: string;
  }> {
    await WechatHelper.ready();
    return new Promise<{ longitude: string; latitude: string }>(resolve => {
      WechatHelper.wx.getLocation({
        type: "wgs84", //默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
        success: function(res) {
          //  res中longitude和latitude就是所获的的用户位置
          const longitude = res.longitude;
          const latitude = res.latitude;
          //调用坐标解析方法
          console.log("wxGetLocation,success", res);
          resolve({ longitude, latitude });
        },
        fail: function(e) {
          console.error(e);
          resolve(null);
        }
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
  async getLatLng() {
    const st = Date.now();
    let result: {
      city: TrafficlineEntity;
      position: { lat: string; lng: string; cityName: string };
    } = {} as any;
    const isMini =
      (await AppHelper.isWechatMiniAsync()) || AppHelper.isWechatMini();
    if (isMini) {
      result = await this.getCurrentCityPositionInWechatMini();
      return result;
    }
    const latLng: MapPoint =
      (await this.getCurrentPosition().catch(_ => {
        console.error("getLatLng error", _);
        return void 0;
      })) || (await this.getPosByIp());
    console.log("getLatLng 结束：", Date.now() - st);
    console.log("getLatLng", latLng);
    if (latLng) {
      result.position = {
        lat: latLng.lat,
        lng: latLng.lng,
        cityName: latLng.cityName
      };
    }
    return result.position && result.position.lat && result.position.lng
      ? result
      : null;
  }
  async getCurrentCityPosition(): Promise<{
    city: TrafficlineEntity;
    position: any;
  }> {
    let result: {
      city: TrafficlineEntity;
      position: any;
    };

    const isMini =
      (await AppHelper.isWechatMiniAsync()) || AppHelper.isWechatMini();
    if (isMini) {
      result = await this.getCurrentCityPositionInWechatMini();
      return result;
    }
    let latLng: MapPoint = await this.getLatLng().catch(_ => {
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
    }
    return result;
  }
  private getPosByIp(): Promise<MapPoint> {
    return new Promise<MapPoint>(s => {
      if (!window["BMap"]) {
        console.error("getCityNameByIp,BMap 地图尚未加载。。。");
        s(null);
      }
      const myCity = new window["BMap"].LocalCity();
      let timeout = false;
      setTimeout(() => {
        timeout = true;
        s(null);
      }, 5 * 1000);
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
          if (timeout) {
            return;
          }
          if (rs && rs.name && rs.center) {
            s({ lat: rs.center.lat, lng: rs.center.lng, cityName: rs.name });
          } else {
            s(null);
          }
        }
      );
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
            timeout: 3 * 1000, //获取位置允许的最长时间
            maximumAge: 1000 //多久更新获取一次位置
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
