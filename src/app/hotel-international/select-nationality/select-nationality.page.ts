import { RefresherComponent } from './../../components/refresher/refresher.component';
import { BackButtonComponent } from './../../components/back-button/back-button.component';
import { OnDestroy } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { InternationalHotelService } from './../international-hotel.service';
import { IonInfiniteScroll, IonContent, IonRefresher } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CountryEntity } from 'src/app/tmc/models/CountryEntity';
import { tap, debounceTime, take } from 'rxjs/operators';
import { flyInOut } from 'src/app/animations/flyInOut';

@Component({
  selector: 'app-select-nationality',
  templateUrl: './select-nationality.page.html',
  styleUrls: ['./select-nationality.page.scss'],
  animations: [flyInOut]
})
export class SelectNationalityPage implements OnInit, OnDestroy {
  private countries: CountryEntity[];
  private pageSize = 30;
  private subscription = Subscription.EMPTY;

  @ViewChild(BackButtonComponent) private backbtn: BackButtonComponent;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  keywords: string;
  searchCountries: CountryEntity[];
  selectedCountry: CountryEntity;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  isLoadingCountries = false;
  constructor(private hotelService: InternationalHotelService) { }
  async  doRefresh() {
    this.keywords = '';
    this.countries = [];
    this.searchCountries = [];
    await this.getCountries();
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    this.loadMore();
    if (this.refresher) {
      this.refresher.complete();
    }
  }
  ngOnInit() {
    requestAnimationFrame(()=>{
      this.doRefresh();
    })
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  onSearchCountry() {
    this.subscription.unsubscribe();
    this.subscription = of(this.keywords)
      .pipe(
        tap(v => console.log(v)),
        debounceTime(300),
        take(1)
      )
      .subscribe((name: string) => {
        this.searchCountries = [];
        this.loadMore();
        this.onGoToTop();
      });
  }
  private onGoToTop() {
    this.content.scrollToTop(100);
  }
  onSelectCountry(country: CountryEntity) {
    this.selectedCountry = country;
    this.onGoToTop();
    this.hotelService.setSearchConditionSource({
      ...this.hotelService.getSearchCondition(),
      country
    });
    setTimeout(() => {
      this.back()
    }, 200);
  }
  private back() {
    this.backbtn.popToPrePage();
  }
  loadMore() {
    const arr = this.filterCountries(this.countries, this.keywords);
    console.log(arr);
    if (this.scroller) {
      this.scroller.complete();
      this.scroller.disabled = arr.length < this.pageSize;
    }
    this.isLoadingCountries = false;
    if (arr && arr.length) {
      this.searchCountries = this.searchCountries.concat(arr);
    }
  }
  private async getCountries() {
    this.isLoadingCountries = true;
    this.countries = await this.hotelService
      .getCountries()
      .catch(e => { console.error(e); return [] });
    this.isLoadingCountries = false;
    return this.countries;
  }
  private filterCountries(countries: any[], name: string) {
    const keys = ["Code", "Name", "PinYin", "EnglishName"];
    name = (name || "").trim().toLowerCase();
    let tempCountries = countries;
    if (name) {
      tempCountries = countries.filter(c => {
        return keys.some(key => {
          const value: string = (c[key] || "").trim().toLowerCase();
          return value == name || value.includes(name) || name.includes(value);
        });
      });
    }
    return tempCountries.slice(
      this.searchCountries.length,
      this.searchCountries.length + this.pageSize
    );
  }

}
