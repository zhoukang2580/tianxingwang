import { HotelEntity } from './HotelEntity';
import { AmenityEntity } from './AmenityEntity';
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class HotelAmenityEntity extends BaseVariablesEntity {
  /// <summary>
  /// 酒店
  /// </summary>
   Hotel: HotelEntity;
  /// <summary>
  /// 设备
  /// </summary>

   Amenity: AmenityEntity;
}
