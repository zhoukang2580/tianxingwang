import { BaseVariablesEntity } from "src/app/tmc/models/BaseVariablesEntity";
import { RoomEntity } from "./RoomEntity";
import { HotelEntity } from "./HotelEntity";

export class HotelImageEntity extends BaseVariablesEntity {
  /// <summary>
  /// 酒店
  /// </summary>
  Hotel: HotelEntity;
  /// <summary>
  ///
  /// </summary>
  Room: RoomEntity;
  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;

  /// <summary>
  /// 地址
  /// </summary>
  FileName: string;

  /// <summary>
  /// 文件流
  /// </summary>
  FileByte: any[];

  FullFileName: string;
}
