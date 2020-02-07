import { InterHotelQueryComponent } from "./../components/inter-hotel-query/inter-hotel-query.component";
import { Router, ActivatedRoute } from "@angular/router";
import { ImageRecoverService } from "./../../services/imageRecover/imageRecover.service";
import { RefresherComponent } from "./../../components/refresher/refresher.component";
import { finalize, switchMap, map, mergeMap, tap } from "rxjs/operators";
import { Subscription, fromEvent, from, interval } from "rxjs";
import {
  InternationalHotelService,
  IInterHotelSearchCondition,
  ISearchTextValue
} from "./../international-hotel.service";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ElementRef
} from "@angular/core";
import { IonInfiniteScroll, IonContent, IonRefresher } from "@ionic/angular";
import {
  trigger,
  transition,
  animate,
  style,
  state
} from "@angular/animations";
import { HotelEntity } from 'src/app/hotel/models/HotelEntity';

@Component({
  selector: "app-international-hotel-list",
  templateUrl: "./international-hotel-list.page.html",
  styleUrls: ["./international-hotel-list.page.scss"]
})
export class InternationalHotelListPage
  implements OnInit, OnDestroy, AfterViewInit {
  private subscription = Subscription.EMPTY;
  private subscriptions: Subscription[] = [];
  @ViewChild("backdrop", { static: false }) backdropEl: ElementRef<HTMLElement>;
  @ViewChild(InterHotelQueryComponent, { static: false })
  queryComp: InterHotelQueryComponent;
  @ViewChild(IonContent, { static: false }) private content: IonContent;
  @ViewChild(IonInfiniteScroll, { static: false })
  private scroller: IonInfiniteScroll;
  @ViewChild(IonRefresher, { static: false }) private refresher: IonRefresher;
  @ViewChild(RefresherComponent, { static: false })
  private refresher2: RefresherComponent;
  private isDoRefresh = false;
  private oldSearchText: ISearchTextValue;
  private oldDestinationCode: string;
  isLoading = false;
  isShowPanel = false;
  hotels: HotelEntity[];
  pageIndex = 0;
  defaultImage = "";
  searchCondition: IInterHotelSearchCondition;
  constructor(
    private hotelService: InternationalHotelService,
    private imageRecoverService: ImageRecoverService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngAfterViewInit() {
    if (this.backdropEl) {
      this.subscriptions.push(
        from(["scroll", "touchmove", "touchstart", "touchend"])
          .pipe(mergeMap(o => fromEvent(this.backdropEl.nativeElement, o)))
          .subscribe(evt => {
            if (this.isShowPanel) {
              if (evt.cancelable) {
                evt.preventDefault();
              }
            }
          })
      );
    }
  }
  onShowPanel(evt: { active: boolean }) {
    console.log("onshowpanel", evt);
    this.isShowPanel = evt && evt.active;
  }
  onScrollToTop() {
    this.scrollToTop();
  }
  onQueryFilter() {
    this.isShowPanel = false;
    this.doRefresh(true);
  }
  onViewHotel(hotel: HotelEntity) {
    this.hotelService.viewHotel = hotel;
    this.router.navigate(["international-hotel-detail"]);
  }
  async onChangeDate() {
    await this.hotelService.openCalendar();
    this.doRefresh();
  }
  ngOnInit() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(q => {
        if (this.checkSearchTextChanged() || this.checkDestinationChanged()) {
          this.doRefresh(true);
        }
      })
    );
    this.observeSearchCondition();
    this.imageRecoverService.get().then(res => {
      if (res) {
        this.defaultImage = res.DefaultUrl;
      }
    });
    setTimeout(() => {
      this.doRefresh();
    }, 230);
  }
  onSearchText() {
    this.router.navigate(["search-by-text"]);
  }
  private checkDestinationChanged() {
    if (this.searchCondition) {
      return (
        !this.searchCondition.destinationCity ||
        this.searchCondition.destinationCity.Code != this.oldDestinationCode
      );
    }
    return false;
  }
  private checkSearchTextChanged() {
    if (this.searchCondition) {
      return (
        !this.searchCondition.searchText ||
        !this.oldSearchText ||
        this.searchCondition.searchText.Value != this.oldSearchText.Value ||
        this.searchCondition.searchText.Text != this.oldSearchText.Text
      );
    }
    return false;
  }
  onChangeCity() {
    this.router.navigate(["select-inter-city"]);
  }
  private observeSearchCondition() {
    this.subscriptions.push(
      this.hotelService.getSearchConditionSource().subscribe(cond => {
        this.searchCondition = cond;
      })
    );
  }
  doRefresh(keepFilterCondition = false) {
    this.hotels = [];
    this.pageIndex = 0;
    this.subscription.unsubscribe();
    this.isDoRefresh = true;
    if (!keepFilterCondition) {
      this.hotelService.setSearchConditionSource({
        ...this.hotelService.getSearchCondition(),
        searchText: null
      });
      this.hotelService.setHotelQuerySource({
        ...this.hotelService.getHotelQueryModel(),
        Stars: null,
        Categories: null,
        starAndPrices: null
      });
      if (this.queryComp) {
        this.queryComp.onResetFilters();
      }
    }
    this.loadMore();
    this.scrollToTop();
  }
  onClearText(evt: CustomEvent) {
    if (evt) {
      evt.stopImmediatePropagation();
    }
    this.hotelService.setSearchConditionSource({
      ...this.hotelService.getSearchCondition(),
      searchText: null
    });
    this.doRefresh(true);
  }
  private scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(100);
    }
  }
  loadMore() {
    this.isLoading = this.pageIndex == 0;
    this.subscription = this.hotelService
      .getHotelList(this.pageIndex)
      .pipe(
        finalize(() => {
          this.oldSearchText = this.searchCondition.searchText;
          if (this.isDoRefresh) {
            this.completeRefresher();
          }
          this.isDoRefresh = false;
          setTimeout(() => {
            this.isLoading = false;
          }, 100);
        })
      )
      .subscribe(
        r => {
          const arr = (r && r.Data && r.Data.HotelDayPrices) || [];
          this.completeScroller();
          this.enableScroller(arr.length >= 20);
          if (arr.length) {
            this.pageIndex++;
            this.hotels = this.hotels.concat(arr.map(it => it.Hotel));
          }
        },
        e => {
          this.enableScroller(false);
        }
      );
  }
  private enableScroller(enabled: boolean) {
    if (this.scroller) {
      this.scroller.disabled = !enabled;
    }
  }
  private completeRefresher() {
    if (this.refresher) {
      this.refresher.complete();
    }
    if (this.refresher2) {
      this.refresher2.complete();
    }
  }
  private completeScroller() {
    if (this.scroller) {
      this.scroller.complete();
    }
  }
}
