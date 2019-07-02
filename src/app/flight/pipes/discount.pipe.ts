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
      return `${v * 100}`.substr(0, 2) + " 折";
    }
    return "全价";
  }
}
