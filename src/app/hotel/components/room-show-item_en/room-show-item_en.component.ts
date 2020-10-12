import {
  Component} from "@angular/core";
import { RoomShowItemComponent } from '../room-show-item/room-show-item.component';

import * as moment from "moment";

@Component({
  selector: "app-room-show-item_en",
  templateUrl: "./room-show-item_en.component.html",
  styleUrls: ["./room-show-item_en.component.scss"]
})
export class RoomShowItemEnComponent extends RoomShowItemComponent {
  getDate(date: string) {
    if (date) {
      return moment(date).format("MM-DD");
    }
  }
}
