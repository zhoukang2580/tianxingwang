import { LanguageHelper } from "./../../languageHelper";
import { Pipe, PipeTransform } from "@angular/core";
export enum CredentialsType {
  /// <summary>
  /// 身份证
  /// </summary>
  IdCard = 1,
  /// <summary>
  /// 护照
  /// </summary>
  Passport = 2,
  /// <summary>
  /// 港澳通行证
  /// </summary>
  HmPass = 3,
  /// <summary>
  /// 台湾通行证
  /// </summary>
  TwPass = 4,
  /// <summary>
  /// 台胞证
  /// </summary>
  Taiwan = 5,
  /// <summary>
  /// 回乡证
  /// </summary>
  HvPass = 6,
  /// <summary>
  /// 入台证
  /// </summary>
  TaiwanEp = 7,
  /// <summary>
  /// 其他证件
  /// </summary>
  Other = 8
}
@Pipe({
  name: "credential"
})
export class CredentialPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    switch (+value) {
      default:
        return value;
      case CredentialsType.IdCard:
        return LanguageHelper.getIdCardTip();
      case CredentialsType.Passport:
        return LanguageHelper.getPassportTip();
      case CredentialsType.HmPass:
        return LanguageHelper.getHmPassTip();
      case CredentialsType.TwPass:
        return LanguageHelper.getTwPassTip();
      case CredentialsType.Taiwan:
        return LanguageHelper.getTaiwanTip();
      case CredentialsType.HvPass:
        return LanguageHelper.getHvPassTip();
      case CredentialsType.Other:
        return LanguageHelper.getOtherTip();
      case CredentialsType.TaiwanEp:
        return LanguageHelper.getTaiwanEpTip();
    }
  }
}
