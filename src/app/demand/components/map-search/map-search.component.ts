import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { MapService } from "src/app/services/map/map.service";

@Component({
  selector: "app-map-search",
  templateUrl: "./map-search.component.html",
  styleUrls: ["./map-search.component.scss"],
})
export class MapSearchComponent implements OnInit, OnDestroy {
  curPos: { lat: string; lng: string };
  kw: string;
  posList: string[];
  isLoading = false;
  private subscription = Subscription.EMPTY;
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  constructor(private mapService: MapService) {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  back() {
    AppHelper.modalController.getTop().then((t) => {
      if (t) {
        t.dismiss();
      }
    });
  }
  onSelect(it) {
    AppHelper.modalController.getTop().then((t) => {
      if (t) {
        t.dismiss({ name: it });
      }
    });
  }
  ngOnInit() {
    this.subscription = this.mapService
      .getBMapLocalSearchSources()
      .subscribe((r) => {
        this.isLoading = false;
        this.posList = r.map((it) => it.address);
      });
  }
  onSearch() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 5000);
    this.mapService.onBMapLocalSearch(this.kw);
  }
}
