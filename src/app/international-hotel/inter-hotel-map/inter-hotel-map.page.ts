import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HotelService } from "src/app/hotel/hotel.service";
import { HotelEntity } from "src/app/hotel/models/HotelEntity";
import { InternationalHotelService } from "../international-hotel.service";

@Component({
  selector: "app-inter-hotel-map",
  templateUrl: "./inter-hotel-map.page.html",
  styleUrls: ["./inter-hotel-map.page.scss"],
})
export class InterHotelMapPage implements OnInit {
  hotel: HotelEntity;
  latLng: { lat: string; lng: string };
  constructor(
    private route: ActivatedRoute,
    private hotelService: InternationalHotelService
  ) {}
  onReload() {
    if (this.latLng) {
      this.latLng = {
        ...this.latLng,
      };
    }
  }
  ngOnInit() {
    this.route.queryParamMap.subscribe(() => {
      this.hotel = this.hotelService.viewHotel;
      if (this.hotel) {
        this.latLng = {
          lat: this.hotel.Lat,
          lng: this.hotel.Lng,
        };
      }
    });
  }
}
