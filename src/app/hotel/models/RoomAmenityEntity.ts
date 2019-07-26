import { BaseVariablesEntity } from "src/app/tmc/models/BaseVariablesEntity";
import { AmenityEntity } from "./AmenityEntity";
import { RoomEntity } from "./RoomEntity";

export class RoomAmenityEntity extends BaseVariablesEntity {
  Room: RoomEntity;
  /// <summary>
  /// 设备
  /// </summary>

  Amenity: AmenityEntity;

  DataEntity: RoomAmenityEntity;
}
