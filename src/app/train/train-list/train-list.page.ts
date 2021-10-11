import {
  Component,
} from "@angular/core";
import { trigger, transition, style, animate } from "@angular/animations";
import { TrainListBasePage } from "./train-list-base.page";
@Component({
  selector: "app-train-list",
  templateUrl: "./train-list.page.html",
  styleUrls: ["./train-list.page.scss"],
  animations: [
    trigger("flyInOut", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateX(-10%)" }),
        animate("200ms", style({ opacity: 1, transform: "translateX(0)" })),
      ]),
      transition(":leave", [
        style({ transform: "translateX(-10%)" }),
        animate("200ms", style({ opacity: 0, transform: "translateX(100%)" })),
      ]),
    ]),
  ],
})
export class TrainListPage extends TrainListBasePage {}
