export class AMapResultModel {
  position: LngLat; // 定位结果

  accuracy: number; // 精度范围，单位：米

  location_type: string; // 定位结果的来源，可能的值有:'html5'、'ip'、'sdk'

  message: string; // 形成当前定位结果的一些信息

  isConverted: boolean; // 是否经过坐标纠偏

  info: string; // 状态信息 "SUCCESS"
  status:number;// 1 成功
  addressComponent: AddressComponent; // 地址信息，详情参考Geocoder

  formattedAddress: string; // 地址

  pois: Array<AMapPOI>; // 定位点附近的POI信息，extensions等于'base'的时候为空

  roads: Array<AMapRoad>; // 定位点附近的道路信息，extensions等于'base'的时候为空

  crosses: Array<AMapCross>; // 定位点附近的道路交叉口信息，extensions等于'base'的时候为空
}
export class LngLat {
  lat: string;
  lng: string;
  noAutofix: boolean;
}
export class AddressComponent {
  province: string; // 所在省（省编码在城市编码表中可查询到）
  city: string; // 所在城市

  citycode: string; // 所在城市编码

  district: string; // 所在区
  adcode: string; // 所在区域编码

  township: string; // 所在乡镇

  street: string; // 所在街道

  streetNumber: string; // 门牌号
  neighborhood: string; // 所在社区

  neighborhoodType: string; // 社区类型

  building: string; // 所在楼/大厦

  buildingType: string; // 楼类型

  businessAreas: Array<BusinessArea>; // 仅逆地理编码时返回，所属商圈信息
}
export class AMapPOI {}
export class AMapRoad {}
export class AMapCross {}
export class BusinessArea {
  id: string; // 商圈id
  name: string; // 商圈名称
  location: string; // 商圈中心点经纬度
}
