import { RefresherComponent } from "./../../../components/refresher/refresher.component";
import { AppHelper } from "../../../appHelper";
import { ApiService } from "src/app/services/api/api.service";
import { RequestEntity } from "../../../services/api/Request.entity";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { IonInfiniteScroll, ModalController } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { CountryEntity } from "../../models/CountryEntity";
import { TmcService } from "../../tmc.service";

@Component({
  selector: "app-select-country",
  templateUrl: "./select-countrymodal.component.html",
  styleUrls: ["./select-countrymodal.component.scss"]
})
export class SelectCountryModalComponent implements OnInit {
  private isRefreshe = false;
  title: string;
  requestCode: string;
  countries: CountryEntity[] = [];
  viewModelItems: CountryEntity[];
  currentPage = 1;
  pageSize = 15;
  loading = false;
  keyword = "";
  selectedItem: CountryEntity;
  @ViewChild(RefresherComponent)
  refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  constructor(
    route: ActivatedRoute,
    private tmcService: TmcService,
    private storage: Storage,
    private modalCtrl: ModalController
  ) {
    route.queryParamMap.subscribe(p => {
      this.title = p.get("title");
      this.requestCode = p.get("requestCode");
    });
  }

  async ngOnInit() {
    this.loading = true;
    this.countries = await this.tmcService.getCountries();
    // console.log(this.countries);
    this.loading = false;
    this.doRefresh(true);
  }
  async loadMore() {
    if (!this.countries || !this.countries.length) {
      this.loading = true;
      await this.tmcService.getCountries();
      this.loading = false;
    }
    if (this.countries) {
      let items = [];
      if (this.keyword.trim()) {
        items = this.countries.filter(
          c =>
            `${c.Name}`
              .toLowerCase()
              .includes(`${this.keyword.trim()}`.toLowerCase()) ||
            `${c.Code}`
              .toLowerCase()
              .includes(`${this.keyword.trim()}`.toLowerCase())
        );
      } else {
        items = this.countries;
      }
      if (this.scroller) {
        this.scroller.disabled = items.length == 0;
      }
      if (items.length) {
        items
          .slice(
            (this.currentPage - 1) * this.pageSize,
            this.currentPage * this.pageSize
          )
          .forEach(item => {
            this.viewModelItems.push(item);
          });
        this.currentPage++;
      }
    }
    if (this.refresher && this.isRefreshe) {
      this.refresher.complete();
      this.isRefreshe = false;
    }
    if (this.scroller) {
      setTimeout(() => {
        this.scroller.complete();
      }, 500);
    }
    this.loading = false;
  }
  doRefresh(clearSearch: boolean) {
    this.isRefreshe = true;
    this.keyword = clearSearch ? "" : this.keyword;
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    this.currentPage = 1;
    this.viewModelItems = [];
    this.loadMore();
  }

  onItemClick(item: CountryEntity) {
    this.selectedItem = item;
    this.back();
  }
  async back() {
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss({
        requestCode: this.requestCode,
        selectedItem: this.selectedItem
      });
    }
  }
  onIonChange() {
    this.doRefresh(false);
  }
}
