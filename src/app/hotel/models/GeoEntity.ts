import { BaseVariablesEntity } from "src/app/tmc/models/BaseVariablesEntity";
import { HotelGeoEntity } from "./HotelGeoEntity";
import { GraphicsPath } from "./GraphicsPath";
import { Region } from "./Region";
import { GeoLangEntity } from "./GeoLangEntity";

export class GeoEntity extends BaseVariablesEntity {
  /// <summary>
  /// 城市代码
  /// </summary>
  CityCode: string;
  /// <summary>
  /// 语言
  /// </summary>
  Lang: string;
  /// <summary>
  /// Custom
  /// CommericalCenter
  /// Metro
  /// Metro
  /// </summary>
  Tag: string;
  /// <summary>
  /// 名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 纬度
  /// </summary>
  Lat: string;

  /// <summary>
  /// 经度
  /// </summary>
  Lng: string;
  /// <summary>
  /// 类型
  /// </summary>
  public Type: GeoType;

  Map: string;

  /// <summary>
  /// 覆盖范围
  /// </summary>
  Radius: string;
  /// <summary>
  ///  编号
  /// </summary>
  Number: string;
  /// <summary>
  /// 排序
  /// </summary>
  Sequence: number;
  /// <summary>
  /// 是否
  /// </summary>
  IsSearch: boolean;

  Pinyin: string;
  /// <summary>
  ///
  /// </summary>
  public Initial: string;
  /// <summary>
  ///
  /// </summary>
  Langs: GeoLangEntity[];

  HotelGeos: HotelGeoEntity[];

  /// <summary>
  /// 图形路径
  /// </summary>
  public GraphicsPath: GraphicsPath;
  /// <summary>
  /// 区域
  /// </summary>
  public Region: Region;
}
export enum GeoType {
  /// <summary>
  /// 半径
  /// </summary>
  Radius = 1,
  /// <summary>
  ///
  /// </summary>
  Map = 2
}
