import {
  Component} from "@angular/core";
import { flyInOut } from "src/app/animations/flyInOut";
import { trigger, transition, style, animate } from "@angular/animations";
import { DestinationAreaType } from "src/app/tmc/models/DestinationAreaType";
import { SelectInterCityPage } from '../select-inter-city/select-inter-city.page';
@Component({
  selector: "app-select-inter-city_en",
  templateUrl: "./select-inter-city_en.page.html",
  styleUrls: ["./select-inter-city_en.page.scss"],
  animations: [
    flyInOut,
    trigger("showfab", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateX(100%) scale(0.1)" }),
        animate(
          "200ms ease-in-out",
          style({ opacity: 1, transform: "translateX(0) scale(1)" })
        )
      ]),
      transition(":leave", [
        animate(
          "200ms 100ms ease-in-out",
          style({ opacity: 0, transform: "translateX(100%) scale(0.1)" })
        )
      ])
    ])
  ]
})
export class SelectInterCityEnPage extends SelectInterCityPage {

}
