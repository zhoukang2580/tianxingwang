import { HotelQueryEntity } from "./HotelQueryEntity";
import { HotelDayPriceEntity } from "./HotelDayPriceEntity";
import { HotelEntity } from "./HotelEntity";

export class HotelResultEntity {
  HotelQuery: HotelQueryEntity;
  HotelDayPrices: HotelDayPriceEntity[];
  Hotel: HotelEntity;
  /// <summary>
  /// 酒店数量
  /// </summary>
  DataCount: number;
  /// <summary>
  /// 酒店城市代码
  /// </summary>
  CityCode: string;
}
