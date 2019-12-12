import { HotelEntity } from "./HotelEntity";
import { AmenityEntity } from "./AmenityEntity";
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class HotelFacilityEntity extends BaseVariablesEntity {
  /// <summary>
  /// 酒店
  /// </summary>
  public Hotel: HotelEntity;
  /// <summary>
  /// 设备
  /// </summary>

  public Amenity: AmenityEntity;
}
