import { HotelEntity } from "./HotelEntity";
import { RoomPlanEntity } from './RoomPlanEntity';
import { RoomAmenityEntity } from './RoomAmenityEntity';
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class RoomEntity extends BaseVariablesEntity {
  /// <summary>
  /// 酒店
  /// </summary>
  Hotel: HotelEntity;
  /// <summary>
  /// 名称
  /// </summary>
  Name: string;

  /// <summary>
  /// 名称
  /// </summary>
  Tag: string;

  /// <summary>
  ///  排序
  /// </summary>
  Sequence: number;

  /// <summary>
  /// 房型描述
  /// </summary>
  RoomDetails: RoomDetailEntity[];
  /// <summary>
  /// 房型编码
  /// </summary>
  RoomNumbers: RoomNumberEntity[];
  /// <summary>
  /// 房型计划
  /// </summary>
  RoomPlans: RoomPlanEntity[];
  /// <summary>
  /// 设施信息
  /// </summary>
  RoomAmenities: RoomAmenityEntity[];
}
export class RoomNumberEntity extends BaseVariablesEntity {
  /// <summary>
  /// 酒店
  /// </summary>
  Room: RoomEntity;
  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  /// <summary>
  /// 商品
  /// </summary>
  Name: string;
  /// <summary>
  ///
  /// </summary>
  Number: string;

  DataEntity: RoomNumberEntity;
}
export class RoomDetailEntity extends BaseVariablesEntity {
  /// <summary>
  /// 酒店
  /// </summary>
  Room: RoomEntity;

  /// <summary>
  /// 语言版本
  /// </summary>
  Lang: string;

  /// <summary>
  /// 标签
  /// Room
  ///     Description
  ///     Comments
  /// </summary>
  Tag: string;
  /// <summary>
  /// Description 描述
  /// Comments 备注
  /// </summary>
  Name: string;

  /// <summary>
  /// 描述
  /// </summary>
  Description: string;

  DataEntity: RoomDetailEntity;
}
