import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { Injectable } from "@angular/core";
const BMap = window["BMap"];
export interface MapPoint {
  lng: string;
  lat: string;
}
@Injectable({
  providedIn: "root"
})
export class MapService {
  private static TAG = "map 定位";
  constructor(private apiService: ApiService) {}
  private convertPoint(curPoint: MapPoint): Promise<MapPoint> {
    return new Promise((s, reject) => {
      const convertor = new BMap.Convertor();
      const pointArr = [];
      pointArr.push(curPoint);
      convertor.translate(pointArr, 1, 5, data => {
        if (data.status == 0) {
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
    if (!BMap) {
      return Promise.reject("地图加载失败");
    }
    return new Promise<MapPoint>((s, reject) => {
      const map = new BMap.Map("allmap");
      let point: { lat: string; lng: string };
      const geolocation = new BMap.Geolocation();
      geolocation.getCurrentPosition(
        r => {
          if (geolocation.getStatus() == window["BMAP_STATUS_SUCCESS"]) {
            // const mk = new BMap.Marker(r.point);
            // map.addOverlay(mk);
            // map.panTo(r.point);
            // alert("您的位置：" + r.point.lng + "," + r.point.lat);
            point = r.point;
            console.log(MapService.TAG, "当前位置", r);
            s({ lat: point.lat, lng: point.lng });
          } else {
            // alert("failed" + geolocation.getStatus());
            console.error(
              MapService.TAG,
              status[geolocation.getStatus()] || geolocation.getStatus()
            );
            reject(status[geolocation.getStatus()] || geolocation.getStatus());
          }
        },
        { enableHighAccuracy: true }
      );
    });
  }
  private getCityFromMap(p: MapPoint): Promise<AddressComponents> {
    if (!BMap) {
      return Promise.reject("地图加载失败");
    }
    const geoc = new BMap.Geocoder();
    return new Promise<AddressComponents>((s, reject) => {
      geoc.getLocation(p, rs => {
        const addComp: AddressComponents = rs.addressComponents;
        s(addComp);
      });
    });
  }
  getCurrentCityPosition(): Promise<{
    city: TrafficlineEntity;
    position: any;
  }> {
    return new Promise(async s => {
      let result: {
        city: TrafficlineEntity;
        position: any;
      };
      let latLng: MapPoint = await this.getCurrentPosition().catch(_ => {
        console.error("getCurrentPosition", _);
        return void 0;
      });
      console.log("getCurrentCityPosition", latLng);
      if (!latLng) {
        latLng = await this.getCurrentPostionByNavigator().catch(_ => {
          console.error("getCurrentPostionByNavigator", _);
          return null;
        });
        console.log("getCurrentPostionByNavigator", latLng);
      }
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
        s(result);
      } else {
        const n = await this.getCityNameByIp().catch(_ => {
          console.error("getCityNameByIp", _);
          return null;
        });
        if (n) {
          result = {
            city: {
              CityCode: "",
              CityName: n
            } as any,
            position: ""
          };
        }
        s(result);
      }
    });
  }
  private getCityNameByIp() {
    return new Promise<string>(s => {
      const myCity = new BMap.LocalCity();
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
    req.Method = "TmcApiHotelUrl-Home-GetCityByMap";
    req.Data = p;
    return await this.apiService.getPromiseData<{
      CityName: string;
      CityCode: string;
    }>(req);
  }
  private getCurrentPostionByNavigator(): Promise<MapPoint> {
    if (navigator && navigator.geolocation) {
      return new Promise<MapPoint>((s, reject) => {
        navigator.geolocation.getCurrentPosition(async position => {
          if (position) {
            const curPoint = new BMap.Point(
              position.coords.longitude,
              position.coords.latitude
            );
            const p: MapPoint = await this.convertPoint(curPoint).catch(e => {
              console.log(e);
              return null;
            });
            if (p) {
              s(p);
            } else {
              reject("定位失败");
            }
          } else {
            reject("定位失败");
          }
        });
      });
    }
    return Promise.reject("手机不支持gps定位");
  }
}
export interface AddressComponents {
  province: string;
  city: string;
  district: string;
  street: string;
  streetNumber: string;
}
