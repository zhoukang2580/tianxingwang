import { HotelEntity } from "./HotelEntity";
import { GeoEntity } from "./GeoEntity";
import { BaseVariablesEntity } from "src/app/tmc/models/BaseVariablesEntity";

export class HotelGeoEntity extends BaseVariablesEntity {
  /// <summary>
  /// 酒店
  /// </summary>
  public Hotel: HotelEntity;
  /// <summary>
  /// 设备
  /// </summary>

  public Geo: GeoEntity;

  /// <summary>
  /// 距离
  /// </summary>
  Distance: string;
}
