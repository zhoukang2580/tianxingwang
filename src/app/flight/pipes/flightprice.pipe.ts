import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'flightprice'
})
export class FlightpricePipe implements PipeTransform {

  transform(value: string, args?: any): any {
    if(!value||!(+value)){
      return value;
    }
    return (+value).toFixed(2);
  }

}
