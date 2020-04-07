import { HotelAmenityEntity } from "./HotelAmenityEntity";
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class AmenityEntity extends BaseVariablesEntity {
  /// <summary>
  /// 语言
  /// </summary>
  Lang: string;

  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  /// <summary>
  /// 名称
  /// </summary>
  Name: string;
  Pinyin: string;
  /// <summary>
  ///
  /// </summary>
  Initial: string;
  /// <summary>
  /// 是否多选
  /// </summary>
  IsMulti: boolean;
  /// <summary>
  /// 排序
  /// </summary>
  Sequence: number;

  IsSearch: boolean;
  /// <summary>
  ///
  /// </summary>
  Langs: AmenityEntity[];
  /// <summary>
  ///
  /// </summary>
  HotelAmenities: HotelAmenityEntity[];
  IsSelected: boolean;

}
