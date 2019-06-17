import { map, tap,delay } from "rxjs/operators";
import { Component, OnInit, Input } from "@angular/core";
import { Observable, combineLatest, of } from "rxjs";
import { ApiService } from '../../../services/api/api.service';

@Component({
  selector: "app-no-more-data",
  templateUrl: "./no-more-data.component.html",
  styleUrls: ["./no-more-data.component.scss"]
})
export class NoMoreDataComponent implements OnInit {
  @Input()
  hasDataObs: Observable<boolean>;
  show$: Observable<boolean>;
  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.show$ = combineLatest(this.hasDataObs, this.apiService.getLoading()).pipe(
      tap(([hasData, loading]) => {
        // console.log(hasData, loading);
      }),
      map(([hasData, loading]) => !hasData && !loading),
      delay(0)
    );
  }
}
