import {
  Component,
  Input,
} from "@angular/core";
import { CabinComponent } from "../cabin/cabin.component";

@Component({
  selector: "app-cabin_en",
  templateUrl: "./cabin_en.component.html",
  styleUrls: ["./cabin_en.component.scss"],
})
export class CabinEnComponent extends CabinComponent {
  @Input() langOpt = {
    any: "不限"
  };
}
