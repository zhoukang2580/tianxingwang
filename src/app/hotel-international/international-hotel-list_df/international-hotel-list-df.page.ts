import { fadeInOut } from "../../animations/fadeInOut";
import {
  Component,
} from "@angular/core";
import {
  trigger,
  transition,
  animate,
  style,
  state,
} from "@angular/animations";
import { InternationalHotelListPage } from '../international-hotel-list/international-hotel-list.page';

@Component({
  selector: "app-international-hotel-list-df",
  templateUrl: "./international-hotel-list-df.page.html",
  styleUrls: ["./international-hotel-list-df.page.scss"],
  animations: [
    fadeInOut,
    trigger("queryPanelShowHide", [
      state(
        "true",
        style({
          willChange: "auto",
          transform: "translate3d(0,0,0)",
          opacity: 1,
          zIndex: 100,
        })
      ),
      state(
        "false",
        style({
          willChange: "auto",
          transform: "translate3d(0,200%,0)",
          opacity: 0,
          zIndex: -100,
        })
      ),
      transition("false=>true", [
        style({ zIndex: 1, willChange: "transform,opacity" }),
        animate(
          "200ms",
          style({ transform: "translate3d(0,0,0)", opacity: 1 })
        ),
      ]),
      transition(
        "true=>false",
        animate(
          "100ms",
          style({
            willChange: "transform,opacity",
            transform: "translate3d(0,200%,0)",
            opacity: 0,
          })
        )
      ),
    ]),
  ],
})
export class InternationalHotelListDfPage extends InternationalHotelListPage {}
