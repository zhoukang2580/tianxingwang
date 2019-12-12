import { BaseEntity } from 'src/app/models/BaseEntity';

export class TrafficlineEntity extends BaseEntity {
  IsDeprecated:boolean;
  /// <summary>
  /// 标签，Train Airport AirportCity
  /// </summary>
  Tag: string;
  /// <summary>
  ///  代码
  /// </summary>
  Code: string;
  /// <summary>
  /// 中文名
  /// </summary>
  Name: string;
  /// <summary>
  /// 中文名
  /// </summary>
  Nickname: string;
  /// <summary>
  /// 拼音
  /// </summary>
  Pinyin: string;
  /// <summary>
  /// 首字母
  /// </summary>
  Initial: string;
  /// <summary>
  /// 机场城市码
  /// </summary>
  AirportCityCode: string;
  /// <summary>
  ///  城市代码
  /// </summary>
  CityCode: string;
  /// <summary>
  ///  城市名称
  /// </summary>
  CityName: string;

  /// <summary>
  ///  描述
  /// </summary>
  Description: string;
  /// <summary>
  ///  是否热点
  /// </summary>
  IsHot: boolean;

  /// <summary>
  ///  是否显示
  /// </summary>
  IsShow: boolean;
  /// <summary>
  ///  国别
  /// </summary>
  CountryCode: string;
  /// <summary>
  ///  排序
  /// </summary>
  Sequence: number;
  /// <summary>
  /// 英文名称
  /// </summary>
  EnglishName: string;
  Selected?: boolean;
  Id: string;
  FirstLetter:string;
}
