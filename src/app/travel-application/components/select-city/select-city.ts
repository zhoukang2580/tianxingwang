
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { Storage } from "@ionic/storage";
import {
  IonContent,
  Platform,
  IonRefresher,
  IonHeader,
  ModalController,
  IonInfiniteScroll
} from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import * as jsPy from "js-pinyin";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from "@angular/animations";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { RefresherComponent } from 'src/app/components/refresher';
import { TravelService } from '../../travel.service';
import { finalize } from 'rxjs/operators';
@Component({
  selector: "app-select-city",
  templateUrl: "./select-city.html",
  styleUrls: ["./select-city.scss"],
  animations: [
    trigger("openclose", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("true<=>false", animate("300ms ease-in-out"))
    ])
  ]
})
export class SelectCity implements OnInit, OnDestroy, AfterViewInit {
  private subscription = Subscription.EMPTY;
  private pageSize = 30;
  private pageIndex = 0;
  textSearchResults: TrafficlineEntity[] = [];
  vmKeyowrds = "";
  isSearching = false;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  isIos = false;
  constructor(
    plt: Platform,
    private travelService: TravelService,
    private modalCtrl: ModalController
  ) {
    this.isIos = plt.is("ios");
  }
  onSearchByKeywords() {
    this.isSearching = true;
    this.doRefresh();
    this.isSearching = false;
  }
  async ngOnInit() {
    this.doRefresh();
  }
  ngOnDestroy() {
    console.log("onDestroy");
    this.subscription.unsubscribe();
  }
  async doRefresh(forceFetch = false) {
    this.pageIndex = 0;
    this.textSearchResults = [];
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    this.subscription.unsubscribe();
    this.loadMore();
    this.scrollToTop();
  }
  scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(100);
    }
  }
  ngAfterViewInit() { }
   onCitySelected(city: TrafficlineEntity) {
    this.modalCtrl.getTop().then(t=>t.dismiss(city));
  }
  async loadMore() {
    const name = (this.vmKeyowrds && this.vmKeyowrds.trim()) || "";
    this.subscription = this.travelService.getCities(name)
      .pipe(finalize(() => {
        setTimeout(() => {
          if (this.pageIndex <= 1) {
            if (this.refresher) {
              this.refresher.complete();
            }
          }
          this.scroller.complete();
        }, 300);
      }))
      .subscribe((r) => {
        const arr = r && r.Data || [];
        this.scroller.disabled = arr.length < this.pageSize;
        if (arr.length) {
          this.pageIndex++;
          this.textSearchResults = this.textSearchResults.concat(arr);
        }
      })
  }
}
