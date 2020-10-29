import {
  Component} from "@angular/core";
import * as moment from 'moment';
import { InterRoomShowItemComponent } from '../inter-room-show-item/inter-room-show-item.component';

@Component({
  selector: "app-inter-room-show-item-en",
  templateUrl: "./inter-room-show-item_en.component.html",
  styleUrls: ["./inter-room-show-item_en.component.scss"]
})
export class InterRoomShowItemEnComponent extends InterRoomShowItemComponent {
  getDate(date: string) {
    if (date) {
      return moment(date).format("MM-DD");
    }
  }
}
