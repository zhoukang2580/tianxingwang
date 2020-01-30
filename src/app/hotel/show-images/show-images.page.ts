import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { HotelService } from "./../hotel.service";
import { AppHelper } from "../../appHelper";
import { TmcService } from "src/app/tmc/tmc.service";
import { AgentEntity } from "../../tmc/models/AgentEntity";
import { ModalController, Platform, NavController } from "@ionic/angular";
import { ConfigService } from "../../services/config/config.service";
import { ConfigEntity } from "../../services/config/config.entity";
import { ElementRef, OnDestroy } from "@angular/core";
import { AfterViewInit, ViewChild } from "@angular/core";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-show-images",
  templateUrl: "./show-images.page.html",
  styleUrls: ["./show-images.page.scss"]
})
export class ShowImagesPage implements OnInit, AfterViewInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  hotel: any;
  images: { url: string; active: boolean; idx: number }[];
  config: ConfigEntity;
  // agent: AgentEntity;
  constructor(
    private configservice: ConfigService,
    private plt: Platform,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private modalCtrl: ModalController
  ) {}
  back() {
    this.navCtrl.back();
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
    this.images = this.hotelService.showImages || [];
    this.images = this.images.map(it => {
      return { ...it, imageUrl: it.url };
    });
  }
  slidToPage(idx: number) {
    if (this.images) {
      this.images = this.images.map(it => {
        it.active = it.idx == idx;
        return { ...it, imageUrl: it.url };
      });
    }
  }
  onClose() {
    this.modalCtrl.dismiss();
  }
}
