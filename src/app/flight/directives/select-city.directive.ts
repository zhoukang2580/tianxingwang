import { Directive, HostListener } from "@angular/core";
import { FlightService } from "../flight.service";

@Directive({
  selector: "[appSelectCity]"
})
export class SelectCityDirective {
  constructor(private flightService: FlightService) {}
  @HostListener("click", ["$event"])
  openSelectCity(evt) {
    this.flightService.setOpenCloseSelectCityPageSources(true);
  }
}
