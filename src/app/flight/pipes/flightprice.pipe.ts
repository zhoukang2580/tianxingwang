import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "flightprice"
})
export class FlightpricePipe implements PipeTransform {
  transform(value: string|number, args?: any): any {
    if (!value || !+value) {
      return value;
    }
    if (+args) {
      return (+value).toFixed(+args);
    }
    return (+value).toFixed(0);
  }
}
