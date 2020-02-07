import { InternationalHotelService } from "../international-hotel.service";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import { Subscription } from "rxjs";
import { ConfigEntity } from "../../services/config/config.entity";
import { ConfigService } from "../../services/config/config.service";
import { Platform, NavController } from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-international-hotel-show-images",
  templateUrl: "./international-hotel-show-images.page.html",
  styleUrls: ["./international-hotel-show-images.page.scss"]
})
export class InternationalHotelShowImagesPage
  implements OnInit, OnDestroy, AfterViewInit {
  private subscription = Subscription.EMPTY;
  hotel: any;
  images: { url: string; active: boolean; idx: number }[];
  config: ConfigEntity;
  // agent: AgentEntity;
  constructor(
    private configservice: ConfigService,
    // private plt: Platform,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private hotelService: InternationalHotelService
  ) {}
  back() {
    this.navCtrl.pop();
  }
  ngAfterViewInit() {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  async ngOnInit() {
    this.subscription = this.route.queryParamMap.subscribe(q => {
      if (q.get("hotelName")) {
        this.hotel = {
          name: q.get("hotelName")
        };
      }
    });
    this.config = await this.configservice.getConfigAsync();
    // this.agent = await this.tmcService.getAgent();
    setTimeout(() => {
      this.images = this.hotelService.showImages || [];
      this.images = this.images.map(it => {
        return { ...it, imageUrl: it.url || it };
      });
    }, 340);
  }
  slidToPage(idx: number) {
    if (this.images) {
      this.images = this.images.map(it => {
        it.active = it.idx == idx;
        return { ...it, imageUrl: it.url };
      });
    }
  }
}
