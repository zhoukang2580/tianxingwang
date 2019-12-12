import { AmenityEntity } from "./AmenityEntity";
import { HotelEntity } from "./HotelEntity";
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class HotelServiceEntity extends BaseVariablesEntity {
  /// <summary>
  /// 酒店
  /// </summary>
  public Hotel: HotelEntity;
  /// <summary>
  /// 设备
  /// </summary>

  public Amenity: AmenityEntity;
}
