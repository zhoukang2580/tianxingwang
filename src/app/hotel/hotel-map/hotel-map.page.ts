import { HotelService } from "src/app/hotel/hotel.service";
import { Subscription } from "rxjs";
import { OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HotelEntity } from "src/app/hotel/models/HotelEntity";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-hotel-map",
  templateUrl: "./hotel-map.page.html",
  styleUrls: ["./hotel-map.page.scss"],
})
export class HotelMapPage implements OnInit, OnDestroy {
  latLng: { lat: string; lng: string };
  hotel: HotelEntity;
  private subscriptions: Subscription[] = [];
  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService
  ) {}
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngOnInit() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe((q) => {
        this.hotel =
          this.hotelService.curViewHotel &&
          this.hotelService.curViewHotel.Hotel;
        this.onReload();
      })
    );
  }
  onReload() {
    if (this.hotel) {
      this.latLng = {
        lat: this.hotel.Lat,
        lng: this.hotel.Lng,
      };
    }
  }
}
