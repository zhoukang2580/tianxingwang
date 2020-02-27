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
      const d = `${((v * 100) / 10).toFixed(1)}`;
      return `${
        d?.includes(".0") ? d.replace(".0", "") : d
      }${LanguageHelper.getDiscountTip()}`;
    }
    return LanguageHelper.getFullPriceTip();
  }
}
