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
  /// ????????????
  /// </summary>
  Type: string;
  /// <summary>
  /// ??????
  /// </summary>
  Langs: string[];
  /// <summary>
  /// ????????????
  /// </summary>
  BeginDate: string;
  /// <summary>
  /// ????????????
  /// </summary>
  EndDate: string;
  /// <summary>
  /// ????????????
  /// </summary>
  CityCode: string;
  CityName: string;
  /// <summary>
  /// ?????????
  /// </summary>
  SearchKey: string;
  /// <summary>
  /// ????????????
  /// </summary>
  BeginPrice: string;
  /// <summary>
  /// ????????????
  /// </summary>
  EndPrice: string;
  /// <summary>
  /// ??????
  /// </summary>
  Lat: string;
  /// <summary>
  /// ??????
  /// </summary>
  Lng: string;

  /// <summary>
  /// ????????????
  /// </summary>
  Distance: string;
  /// <summary>
  /// ????????????
  /// </summary>
  Geos: string[];
  /// <summary>
  /// ??????
  /// </summary>
  Stars: string[];
  /// <summary>
  /// ??????
  /// </summary>
  Categories: string[];
  /// <summary>
  /// ??????
  /// </summary>
  Brands: string[];
  /// <summary>
  /// ????????????
  /// </summary>
  Amenities: string[];
  /// <summary>
  /// ??????
  /// </summary>
  Facilities: string[];
  /// <summary>
  /// ??????
  /// </summary>
  Services: string[];
  /// <summary>
  /// ??????
  /// </summary>
  Themes: string[];
  /// <summary>
  /// ????????????
  /// </summary>
  PaymentType: HotelPaymentType;
  /// <summary>
  /// ??????
  /// </summary>
  Orderby: string;
  /// <summary>
  /// ??????
  /// </summary>
  Forms: { [key: string]: string };
  PageIndex: number;
  /// <summary>
  /// ????????????
  /// </summary>
  PageSize: number;
  /// <summary>
  ///
  /// </summary>
  Tag: string;

  Tmc: TmcEntity;
  /// <summary>
  /// ????????????
  /// </summary>
  HotelId: string;
  /// <summary>
  /// ????????????????????????
  /// </summary>
  IsLoadDetail: boolean;
}
