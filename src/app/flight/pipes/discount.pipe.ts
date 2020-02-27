import { LanguageHelper } from "./../../languageHelper";
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "discount"
})
export class DiscountPipe implements PipeTransform {
  transform(value: string, args?: any): any {
    const v = +value;
    if (isNaN(v)) {
      return value;
    }
    if (0 < v && v < 1) {
      return `${((v * 100) / 10).toFixed(2)}${LanguageHelper.getDiscountTip()}`;
    }
    return LanguageHelper.getFullPriceTip();
  }
}
