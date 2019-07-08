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
    if (v < 1) {
      return `${(v * 10)
        .toString()
        .substr(0, 3)}${LanguageHelper.getDiscountTip()}`;
    }
    return LanguageHelper.getFullPriceTip();
  }
}
