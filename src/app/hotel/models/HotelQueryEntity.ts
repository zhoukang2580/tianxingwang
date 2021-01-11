import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { HotelPaymentType } from "./HotelPaymentType";
import { TmcEntity } from "src/app/tmc/tmc.service";
import { GeoEntity } from "./GeoEntity";

import { BrandEntity } from "./BrandEntity";
import { AmenityEntity } from "./AmenityEntity";
export interface IFilterTab<T> {
  hasFilterItem?: boolean;
  active?: boolean;
  label: string;
  items: T[];
  order?: number;
  tag?: "Brand" | "Service" | "Theme" | "Facility";
  id?: string;
}
export interface IFilterTabItem<T> {
  isMulti?: boolean;
  label: string;
  items: T[];
  order?: number;
  tag?: string;
  id?: string;
  showAll?: boolean;
}
export interface IStarPriceTab<T> {
  isActive?: boolean;
  id?: string;
  label: string;
  items: T[];
  hasItemSelected?: boolean;
  tag: "stars" | "customeprice" | "price" | "types";
}
export interface IStarPriceTabItem {
  label: string;
  value?: string;
  id: string;
  isSelected?: boolean;
  isMulti?: boolean;
  minPrice: number;
  maxPrice: number;
}
export interface IMetros {
  hasItemSelected?: boolean;
  line: string;
  stops: {
    isSelected: boolean;
    stop: GeoEntity;
  }[];
}
export interface IGeoTab<T> {
  id: string;
  label: string;
  active?: boolean;
  hasFilterItem?: boolean;
  isMulti?: boolean;
  items?: T[];
  tag?:
    | "Metro"
    | "RailwayStation"
    | "CarStation"
    | "Airport"
    | "District"
    | "Mall"
    | "CommericalCenter"
    | "Landmark"
    | "Hospital"
    | "University"
    | "Venue"
    | "InFeatureSpot"
    | "OutFeatureSpot"
    | "Group"
    | "Company";
}
export interface IGeoItem<T> {
  id?: string;
  label: string;
  items?: IGeoItem<T>[];
  parentId?: string;
  isSelected?: boolean;
  isMulti?: boolean;
  level: "normal" | "second" | "third";
  tag: string;
}
export interface IRankItem {
  id: number;
  label: string;
  orderBy: "PriceAsc" | "PriceDesc" | "CategoryAsc" | "CategoryDesc";
  isSelected?: boolean;
  value: "Category" | "Price";
  isAsc?: boolean;
}
export interface IStarPriceTab<T> {
  isActive?: boolean;
  id?: string;
  label: string;
  items: T[];
  hasItemSelected?: boolean;
  tag: "stars" | "customeprice" | "price" | "types";
}
export interface IStarPriceTabItem {
  label: string;
  value?: string;
  id: string;
  isSelected?: boolean;
  isMulti?: boolean;
  minPrice: number;
  maxPrice: number;
}
export class HotelQueryEntity {
  starAndPrices: IStarPriceTab<IStarPriceTabItem>[];
  ranks: IRankItem[];
  locationAreas: IGeoTab<IGeoItem<GeoEntity>>[];
  filters: IFilterTab<IFilterTabItem<BrandEntity | AmenityEntity>>[];
  searchGeoId: string;
  City: TrafficlineEntity;
  /// <summary>
  /// 价格类型
  /// </summary>
  Type: string;
  /// <summary>
  /// 语言
  /// </summary>
  Langs: string[];
  /// <summary>
  /// 开始日期
  /// </summary>
  BeginDate: string;
  /// <summary>
  /// 开始日期
  /// </summary>
  EndDate: string;
  /// <summary>
  /// 城市代码
  /// </summary>
  CityCode: string;
  CityName: string;
  /// <summary>
  /// 关键字
  /// </summary>
  SearchKey: string;
  /// <summary>
  /// 价格范围
  /// </summary>
  BeginPrice: string;
  /// <summary>
  /// 价格范围
  /// </summary>
  EndPrice: string;
  /// <summary>
  /// 纬度
  /// </summary>
  Lat: string;
  /// <summary>
  /// 经度
  /// </summary>
  Lng: string;

  /// <summary>
  /// 距离范围
  /// </summary>
  Distance: string;
  /// <summary>
  /// 地理位置
  /// </summary>
  Geos: string[];
  /// <summary>
  /// 星级
  /// </summary>
  Stars: string[];
  /// <summary>
  /// 类别
  /// </summary>
  Categories: string[];
  /// <summary>
  /// 品牌
  /// </summary>
  Brands: string[];
  /// <summary>
  /// 便利设施
  /// </summary>
  Amenities: string[];
  /// <summary>
  /// 设施
  /// </summary>
  Facilities: string[];
  /// <summary>
  /// 服务
  /// </summary>
  Services: string[];
  /// <summary>
  /// 主题
  /// </summary>
  Themes: string[];
  /// <summary>
  /// 支付方式
  /// </summary>
  PaymentType: HotelPaymentType;
  /// <summary>
  /// 排序
  /// </summary>
  Orderby: string;
  /// <summary>
  /// 表单
  /// </summary>
  Forms: { [key: string]: string };
  PageIndex: number;
  /// <summary>
  /// 分页大小
  /// </summary>
  PageSize: number;
  /// <summary>
  ///
  /// </summary>
  Tag: string;

  Tmc: TmcEntity;
  /// <summary>
  /// 酒店编号
  /// </summary>
  HotelId: string;
  /// <summary>
  /// 是否返回房型信息
  /// </summary>
  IsLoadDetail: boolean;
}
