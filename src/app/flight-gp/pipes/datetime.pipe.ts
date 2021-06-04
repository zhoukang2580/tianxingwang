import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "datetime"
})
export class DatetimePipe implements PipeTransform {
  transform(value: string, args?: any): string {
    console.log("args", args);
    if (value && value.includes("T") && args) {
      const datetime = value.split("T");
      return ``;
    }
    return value;
  }
}
