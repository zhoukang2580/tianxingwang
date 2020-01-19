import { BaseEntity } from "./../../models/BaseEntity";
import { DestinationAreaType } from "./DestinationAreaType";
export class CountryEntity extends BaseEntity {
  /// <summary>
  /// 中文名
  /// </summary>
  Name: string;
  /// <summary>
  ///  代码
  /// </summary>
  Code: string;
  /// <summary>
  ///  代码
  /// </summary>
  EnglishName: string;
  /// <summary>
  ///  代码
  /// </summary>
  PinYin: string;
  /// <summary>
  ///  排序
  /// </summary>
  Sequence: number;
  /// <summary>
  /// 区域
  /// </summary>
  DestinationAreaType: DestinationAreaType;
}
