import {
  Component,
} from "@angular/core";
// tslint:disable-next-line: max-line-length
import { trigger, transition, style, animate } from "@angular/animations";
import { TrainListBasePage } from "../train-list/train-list-base.page";
@Component({
  selector: "app-train-list-df",
  templateUrl: "./train-list_df.page.html",
  styleUrls: ["./train-list_df.page.scss"],
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
export class TrainListDfPage extends TrainListBasePage {}
