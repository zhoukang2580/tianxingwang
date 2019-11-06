import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { HotelPaymentType } from "./HotelPaymentType";
import { TmcEntity } from "src/app/tmc/tmc.service";
import { IStarPriceTabItem, IStarPriceTab } from '../components/hotel-query/hotel-starprice/hotel-starprice.component';
import { IRankItem } from '../components/hotel-query/recommend-rank/recommend-rank.component';
import { IGeoTab, IGeoItem, IMetros } from '../components/hotel-query/hotel-geo/hotel-geo.component';
import { GeoEntity } from './GeoEntity';
import { IFilterTab, IFilterTabItem } from '../components/hotel-query/hotel-filter/hotel-filter.component';
import { BrandEntity } from './BrandEntity';
import { AmenityEntity } from './AmenityEntity';

export class HotelQueryEntity {
  starAndPrices: IStarPriceTab<IStarPriceTabItem>[];
  ranks: IRankItem[];
  locationAreas:IGeoTab<IGeoItem<GeoEntity>>[];
  filters:IFilterTab<IFilterTabItem<BrandEntity | AmenityEntity>>[];
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

