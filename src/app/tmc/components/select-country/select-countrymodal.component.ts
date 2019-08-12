import { AppHelper } from "../../../appHelper";
import { ApiService } from "src/app/services/api/api.service";
import { RequestEntity } from "../../../services/api/Request.entity";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NavController,
  IonRefresher,
  IonInfiniteScroll,
  ModalController
} from "@ionic/angular";
import { Storage } from "@ionic/storage";
export interface Country {
  Id: string;
  Name: string;
  Code?: string;
  Sequence?: string;
}
@Component({
  selector: "app-select-country",
  templateUrl: "./select-countrymodal.component.html",
  styleUrls: ["./select-countrymodal.component.scss"]
})
export class SelectCountryModalComponent implements OnInit {
  title: string;
  requestCode: string;
  countries: Country[] = [];
  viewModelItems: Country[];
  currentPage = 1;
  pageSize = 15;
  loading = false;
  keyword = "";
  selectedItem: Country;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  constructor(
    route: ActivatedRoute,
    private apiService: ApiService,
    private storage: Storage,
    private modalCtrl: ModalController
  ) {
    route.queryParamMap.subscribe(p => {
      this.title = p.get("title");
      this.requestCode = p.get("requestCode");
    });
  }

  async ngOnInit() {
    this.countries = await this.getCountries();
    // console.log(this.countries);
    this.doRefresh(true);
  }
  async loadMore() {
    this.countries = this.countries.length
      ? this.countries
      : await this.getCountries();
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
    if (this.refresher) {
      this.refresher.complete();
    }
    if (this.scroller) {
      setTimeout(() => {
        this.scroller.complete();
      }, 500);
    }
  }
  doRefresh(clearSearch: boolean) {
    this.keyword = clearSearch ? "" : this.keyword;
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    this.currentPage = 1;
    this.viewModelItems = [];
    this.loadMore();
  }
  async getCountries(forceUpdate = false) {
    this.loading = true;
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Agent-Country";
    let local = await this.storage.get(req.Method);
    if (
      (local && !forceUpdate) ||
      (local &&
        Math.floor(Date.now() / 1000) - local.lastUpdateTime >= 12 * 3600)
    ) {
      this.loading = false;
      return local.countries;
    }
    req.Data = {
      lastUpdateTime: (local && local.lastUpdateTime) || 0
    };
    req.IsShowLoading = true;
    const countries = await this.apiService
      .getPromiseData<{ Countries: Country[] }>(req)
      .then(r => r.Countries)
      .catch(_ => [] as Country[]);
    countries.sort((c1, c2) => +c1.Sequence - +c2.Sequence);
    // console.log("countries", countries);
    if (local) {
      local.countries = [...countries, ...local.countries];
    } else {
      local = {
        lastUpdateTime: Math.floor(Date.now() / 1000),
        countries
      };
    }
    await this.storage.set(req.Method, local);
    this.loading = false;
    return local.countries;
  }
  onItemClick(item: Country) {
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
