import { BaseVariablesEntity } from 'src/app/tmc/models/BaseVariablesEntity';
import { HotelEntity } from './HotelEntity';
import { AmenityEntity } from './AmenityEntity';

export class HotelThemeEntity extends BaseVariablesEntity{
/// <summary>
        /// 酒店
        /// </summary>
          Hotel :HotelEntity;
        /// <summary>
        /// 设备
        /// </summary>

          Amenity :AmenityEntity;
}