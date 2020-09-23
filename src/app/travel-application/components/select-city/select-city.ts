import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { Storage } from "@ionic/storage";
import {
  IonContent,
  Platform,
  IonRefresher,
  IonHeader,
  ModalController,
  IonInfiniteScroll,
} from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import * as jsPy from "js-pinyin";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { RefresherComponent } from "src/app/components/refresher";
import { TravelService } from "../../travel.service";
import { finalize } from "rxjs/operators";
import { AppHelper } from 'src/app/appHelper';
interface ICity{
  Id: string;
  // tslint:disable-next-line: ban-types
  Name: String;
}
@Component({
  selector: "app-select-city",
  templateUrl: "./select-city.html",
  styleUrls: ["./select-city.scss"],
  animations: [
    trigger("openclose", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("true<=>false", animate("300ms ease-in-out")),
    ]),
  ],
})
export class SelectCity implements OnInit, OnDestroy, AfterViewInit {
  private subscription = Subscription.EMPTY;
  private pageSize = 20;
  private pageIndex = 0;
  private tripType = "";
  private isMulti = true;
  private isCityJudge = null;
  selectedCitys: ICity[];
  textSearchResults: TrafficlineEntity[] = [];
  vmKeyowrds = "";
  isSearching = false;
  isLoading = false;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  isIos = false;
  constructor(
    plt: Platform,
    private router: Router,
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
  async ngOnInit() {}
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
  ngAfterViewInit() {
    this.doRefresh();
  }
  // onCitySelected(city: TrafficlineEntity) {
  //   this.modalCtrl.getTop().then((t) => t.dismiss(city));
  // }

  onCitySelected(city: { Id: string; Name: string }) {
    if(this.isMulti){
      this.modalCtrl.getTop().then((t) => t.dismiss(city));
    } else{
      console.log(city);
      if (!this.selectedCitys) {
        this.selectedCitys = [];
      }
      if (!this.selectedCitys.find((it) => it.Id == city.Id)) {
          this.selectedCitys.push(city);
      }
      if (this.isSearching) {
        return;
      }
    }
   
    // this.goToDetail(city.Id);

  }

  back() {
    this.modalCtrl.getTop().then((t) => t.dismiss(this.selectedCitys));
  }
  async loadMore() {
    const name = (this.vmKeyowrds && this.vmKeyowrds.trim()) || "";
    console.log((this.vmKeyowrds && this.vmKeyowrds.trim()) || "","vmKeyowrds");
    
    this.subscription = this.travelService
      .getCities({
        name,
        tripType: this.tripType,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      })
      .pipe(
        finalize(() => {
          setTimeout(() => {
            if (this.pageIndex <= 1) {
              if (this.refresher) {
                this.refresher.complete();
              }
            }
          }, 300);
        })
      )
      .subscribe((r) => {
        const arr = (r && r.Data) || [];
        this.scroller.disabled = arr.length < this.pageSize;
        if (this.scroller) {
          this.scroller.complete();
        }
        if (arr.length) {
          this.pageIndex++;
          this.textSearchResults = this.textSearchResults.concat(arr);
        }
      });
    }
    private async goToDetail(id: string) {
      const city = await this.travelService.getTravelDetail(id).catch((e) => {
        AppHelper.alert(e);
        return null;
      });
      if (city) {
        this.router.navigate([""], {
          queryParams: {
            tag: JSON.stringify(city),
          },
        });
      }
    }
    onDeleteSelectedTag(city: ICity) {
      if (this.selectedCitys) {
        // tslint:disable-next-line: triple-equals
        this.selectedCitys = this.selectedCitys.filter((it) => it.Id != city.Id)
      }
    }

  
    onDetermine(){
      this.modalCtrl.getTop().then((t) => t.dismiss(this.selectedCitys));
    }
}
