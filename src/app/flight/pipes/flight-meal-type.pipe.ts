import { Pipe, PipeTransform } from "@angular/core";
import { LanguageHelper } from "src/app/languageHelper";
export enum FlightMealType {
  /// <summary>
  /// 不特定餐食
  /// </summary>
  M = 1,
  /// <summary>
  /// 早餐
  /// </summary>
  B = 2,
  /// <summary>
  /// 午餐
  /// </summary>
  L = 3,
  /// <summary>
  /// 免费酒精饮料
  /// </summary>
  C = 4,
  /// <summary>
  /// 大陆式早餐
  /// </summary>
  K = 5,
  /// <summary>
  /// 晚餐
  /// </summary>
  D = 6,
  /// <summary>
  /// 点心或早午餐
  /// </summary>
  S = 7,
  /// <summary>
  /// 冷食
  /// </summary>
  O = 8,
  /// <summary>
  /// 热食
  /// </summary>
  H = 9,
  /// <summary>
  /// 茶点或小吃
  /// </summary>
  R = 10
}
@Pipe({
  name: "flightMealType"
})
export class FlightMealTypePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    switch (value) {
      case FlightMealType.M:
        return LanguageHelper.FlightMealType.getMTip();
      case FlightMealType.B:
        return LanguageHelper.FlightMealType.getBTip();
      case FlightMealType.L:
        return LanguageHelper.FlightMealType.getLTip();
      case FlightMealType.C:
        return LanguageHelper.FlightMealType.getCTip();
      case FlightMealType.K:
        return LanguageHelper.FlightMealType.getKTip();
      case FlightMealType.D:
        return LanguageHelper.FlightMealType.getDTip();
      case FlightMealType.S:
        return LanguageHelper.FlightMealType.getSTip();
      case FlightMealType.O:
        return LanguageHelper.FlightMealType.getOTip();
      case FlightMealType.H:
        return LanguageHelper.FlightMealType.getHTip();
      case FlightMealType.R:
        return LanguageHelper.FlightMealType.getRTip();
      default:
        return value;
    }
  }
}
