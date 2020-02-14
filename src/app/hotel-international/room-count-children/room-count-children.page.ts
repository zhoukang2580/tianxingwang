import { Subscription } from "rxjs";
import {
  InternationalHotelService,
  IInterHotelSearchCondition
} from "./../international-hotel.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-room-count-children",
  templateUrl: "./room-count-children.page.html",
  styleUrls: ["./room-count-children.page.scss"]
})
export class RoomCountChildrenPage implements OnInit {
  searchCondition: IInterHotelSearchCondition;
  private subscriptions: Subscription[] = [];
  constructor(private hotelService: InternationalHotelService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.hotelService.getSearchConditionSource().subscribe(c => {
        this.searchCondition = c;
      })
    );
  }
}
