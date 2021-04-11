import { HotelThemeEntity } from "./HotelThemeEntity";
import { HotelServiceEntity } from "./HotelServiceEntity";
import { HotelFacilityEntity } from "./HotelFacilityEntity";
import { HotelCommentEntity } from "./HotelCommentEntity";
import { HotelGeoEntity } from "./HotelGeoEntity";
import { HotelAmenityEntity } from "./HotelAmenityEntity";
import { HotelImageEntity } from "./HotelImageEntity";
import { HotelDayPriceEntity } from "./HotelDayPriceEntity";
import { HotelNumberEntity } from "./HotelNumberEntity";
import { RoomEntity } from "./RoomEntity";
import { HotelStatusType } from "./HotelStatusType";
import { HotelSummaryEntity } from "./HotelSummaryEntity";
import { HotelDetailEntity } from "./HotelDetailEntity";
import { HotelCoordinateType } from "./HotelCoordinateType";
import { BrandEntity } from "./BrandEntity";
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class HotelEntity extends BaseVariablesEntity {
  /// <summary>
  /// 酒店名
  /// </summary>
  Name: string;
  EnName: string;
  EnAddress: string;
  /// <summary>
  /// 城市代码
  /// </summary>
  CityCode: string;
  /// <summary>
  /// 地址
  /// </summary>
  Address: string;
  /// <summary>
  /// 总体等级
  /// </summary>
  Grade: number;
  stars: number[];
  /// <summary>
  /// 品牌
  /// </summary>
  Brand: BrandEntity;
  /// <summary>
  /// 支付方式
  /// </summary>
  Payment: string;
  /// <summary>
  /// 房间总数
  /// </summary>
  RoomCount: string;
  /// <summary>
  /// 评论数量
  /// </summary>
  CommentCount: string;
  /// <summary>
  /// 推荐
  /// </summary>
  Category: string;
  /// <summary>
  /// 星级
  /// </summary>
  Star: string;
  /// <summary>
  /// 邮编
  /// </summary>
  PostalCode: string;
  /// <summary>
  /// 电话
  /// </summary>
  Phone: string;
  /// <summary>
  /// 传真
  /// </summary>
  Fax: string;
  /// <summary>
  ///地址
  /// </summary>
  FileName: string;

  FullFileName: string;
  /// <summary>
  /// 坐标系
  /// </summary>
  Coordinate: HotelCoordinateType;
  /// <summary>
  /// 纬度
  /// </summary>
  Lat: string;

  /// <summary>
  /// 经度
  /// </summary>
  Lng: string;

  /// <summary>
  /// 状态
  /// </summary>
  Status: HotelStatusType;

  /// <summary>
  /// 酒店各种描述
  /// </summary>
  HotelSummaries: HotelSummaryEntity[];
  /// <summary>
  /// 酒店各种描述
  /// </summary>
  HotelDetails: HotelDetailEntity[];
  /// <summary>
  /// 房型
  /// </summary>
  Rooms: RoomEntity[];
  /// <summary>
  /// 酒店编号
  /// </summary>
  HotelNumbers: HotelNumberEntity[];
  /// <summary>
  /// 酒店每天价格
  /// </summary>
  HotelDayPrices: HotelDayPriceEntity[];
  /// <summary>
  /// 其他设施信息
  /// </summary>
  HotelAmenities: HotelAmenityEntity[];
  /// <summary>
  /// 酒店图片
  /// </summary>
  HotelImages: HotelImageEntity[];
  /// <summary>
  /// 位置信息
  /// </summary>
  HotelGeos: HotelGeoEntity[];

  HotelComments: HotelCommentEntity[];
  /// <summary>
  /// 设施信息
  /// </summary>
  HotelFacilities: HotelFacilityEntity[];
  /// <summary>
  /// 服务信息
  /// </summary>
  HotelServices: HotelServiceEntity[];
  /// <summary>
  /// 主题信息
  /// </summary>
  HotelThemes: HotelThemeEntity[];

  StatusName: string;
  CoordinateName: string;
}
