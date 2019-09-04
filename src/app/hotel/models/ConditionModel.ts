import { TmcEntity } from "src/app/tmc/tmc.service";
import { AmenityEntity } from "./AmenityEntity";
import { BrandEntity } from "./BrandEntity";
import { GeoEntity } from "./GeoEntity";

export class ConditionModel {
  public Tmc: TmcEntity;
  /// <summary>
  /// 主题
  /// </summary>
  Amenities: AmenityEntity[];
  /// <summary>
  /// 主题
  /// </summary>
  Brands: BrandEntity[];
  /// <summary>
  /// 地理信息
  /// </summary>
  Geos: GeoEntity[];
}
