import { AmenityEntity } from "./AmenityEntity";
import { RoomEntity } from "./RoomEntity";
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class RoomAmenityEntity extends BaseVariablesEntity {
  Room: RoomEntity;
  /// <summary>
  /// 设备
  /// </summary>

  Amenity: AmenityEntity;

  DataEntity: RoomAmenityEntity;
}
