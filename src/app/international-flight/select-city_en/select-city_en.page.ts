import {
  Component,
} from "@angular/core";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { SelectCityPage } from '../select-city/select-city.page';
@Component({
  selector: "app-select-international-flight-city_en",
  templateUrl: "./select-city_en.page.html",
  styleUrls: ["./select-city_en.page.scss"],
  animations: [
    trigger("openclose", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("true<=>false", animate("300ms ease-in-out")),
    ]),
  ],
})
export class SelectCityEnPage extends SelectCityPage {
  
}
