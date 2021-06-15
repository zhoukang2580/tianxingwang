import { Pipe, PipeTransform } from "@angular/core";
import { LanguageHelper } from "src/app/languageHelper";

export enum CredentialsType {
    /// <summary>
    /// 身份证
    /// </summary>
    /// [Description("身份证")]
    IdCard = 1,
    /// <summary>
    /// 护照
    /// </summary>
    /// [Description("护照")]
    Passport = 2,
    /// <summary>
    /// 港澳通行证
    /// </summary>
    /// [Description("港澳通行证")]
    HmPass = 3,
    /// <summary>
    /// 台湾通行证
    /// </summary>
    /// [Description("台湾通行证")]
    TwPass = 4,
    /// <summary>
    /// 台胞证
    /// </summary>
    /// [Description("台胞证")]
    Taiwan = 5,
    /// <summary>
    /// 回乡证
    /// </summary>
    /// [Description("回乡证")]
    HvPass = 6,
    /// <summary>
    /// 入台证
    /// </summary>
    /// [Description("入台证")]
    TaiwanEp = 7,
    /// <summary>
    /// 其他证件
    /// </summary>
    /// [Description("其他证件")]
    Other = 8,
    /// <summary>
    /// 港澳台居民身份证
    /// </summary>
    /// [Description("港澳台居民身份证")]
    ResidencePermit = 9,
    /// <summary>
    /// 外国人永久居留身份证
    /// </summary>
    /// [Description("外国人永久居留身份证")]
    AlienPermanentResidenceIdCard = 10
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