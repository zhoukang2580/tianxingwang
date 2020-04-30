
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
import { CostCenterEntity } from 'src/app/hr/staff.service';
@Component({
  selector: "app-select-costcenter",
  templateUrl: "./select-costcenter.html",
  styleUrls: ["./select-costcenter.scss"],
  animations: [
    trigger("openclose", [
      state("true", style({ transform: "scale(1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("true<=>false", animate("300ms ease-in-out"))
    ])
  ]
})
export class SelectCostcenter implements OnInit, OnDestroy, AfterViewInit {
  private subscription = Subscription.EMPTY;
  private costCenters: CostCenterEntity[] = [];
  vmCostCenters: CostCenterEntity[] = [];
  vmKeyowrds = "";
  isSearching = false;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  isIos = false;
  constructor(
    plt: Platform,
    private travelService: TravelService,
    private modalCtrl: ModalController
  ) {
    this.isIos = plt.is("ios");
  }
  onSearchByKeywords() {
    if (this.costCenters && this.costCenters.length) {
      this.vmCostCenters = this.vmKeyowrds ? this.costCenters.filter(it => it.Name.includes(this.vmKeyowrds)) : this. costCenters;
    }
  }
  async ngOnInit() {
    this.doRefresh();
  }
  ngOnDestroy() {
    console.log("onDestroy");
    this.subscription.unsubscribe();
  }
  async doRefresh() {
    try {
      this.vmKeyowrds=''
      this.costCenters = [];
      this.subscription.unsubscribe();
      this.costCenters = await this.travelService.getCostCenters();
      this.scrollToTop();
    } catch{
      this.costCenters = [];
    }
    this.onSearchByKeywords();
  }
  scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(100);
    }
  }
  ngAfterViewInit() { }
  onCitySelected(city: CostCenterEntity) {
    this.modalCtrl.getTop().then(t => t.dismiss(city));
  }

}
