import { FilterConditionModel } from 'src/app/flight/models/flight/advanced-search-cond/FilterConditionModel';
import { Subscription } from 'rxjs';
import { FlightService } from 'src/app/flight/flight.service';
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  EventEmitter,
  Output,
  OnDestroy,
  Input
} from "@angular/core";
import { IonRange, DomController } from "@ionic/angular";
@Component({
  selector: 'app-take-off-timespan',
  templateUrl: './take-off-timespan.component.html',
  styleUrls: ['./take-off-timespan.component.scss'],
})
export class TakeOffTimeSpanComponent implements OnInit, AfterViewInit {
  time: "forenoon" | "afternoon" | "none" | "night";
  @Input() filterCondition: FilterConditionModel;
  @Output() filterConditionChange: EventEmitter<FilterConditionModel>;
  @ViewChild("range") range: IonRange;
  private subscription = Subscription.EMPTY;
  constructor(private domCtrl: DomController) {
    this.filterConditionChange = new EventEmitter();
  }
  private search() {
    if (this.filterCondition && this.filterCondition.takeOffTimeSpan) {
      this.filterCondition.userOps = {
        ...this.filterCondition.userOps,
        timespanOp: this.filterCondition.takeOffTimeSpan.lower > 0 || this.filterCondition.takeOffTimeSpan.upper < 24
      }
      this.filterConditionChange.emit(this.filterCondition);
    }
  }
  ngOnInit() {
  }
  reset() {
    this.init();
  }
  private init() {
    setTimeout(() => {
      this.onTimeSelect("none");
      this.changeView();
      this.search();
    }, 100);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  onTimeSelect(time: "forenoon" | "afternoon" | "none" | "night") {
    this.time = time;
    switch (this.time) {
      case "forenoon": {
        this.range.value = { lower: 0, upper: 12 };
        this.changeView();
        break;
      }
      case "afternoon": {
        this.range.value = { lower: 12, upper: 18 };
        this.changeView();
        break;
      }
      case "night": {
        this.range.value = { lower: 18, upper: 24 };
        this.changeView();
        break;
      }
      default: {
        this.range.value = { lower: 0, upper: 24 };
        this.changeView();
        break;
      }
    }
    this.search();
  }
  ngAfterViewInit() {
    this.init();
    this.range.ionChange.subscribe((v: CustomEvent) => {
      // console.dir(v.detail.value);
      if (this.filterCondition) {
        this.filterCondition.takeOffTimeSpan = {
          ... this.filterCondition.takeOffTimeSpan,
          lower: v.detail.value.lower,
          upper: v.detail.value.upper
        }
      }
      // this.changeView();
      this.search();
    });
  }
  changeView() {
    this.domCtrl.write(() => {
      const r = document.querySelector("ion-range");
      // console.log("r", r);
      if (r) {
        const s = r.shadowRoot.querySelector(".range-slider");
        // console.log("s", s);
        if (s) {
          const handles = s.querySelectorAll(".range-knob-handle");
          // console.log("handles", handles);
          if (handles) {
            for (let i = 0; i < handles.length; i++) {
              const handle = handles[i];
              handle.classList.add("range-knob-pressed");
              handle["style"].zIndex = 888;
            }
            const pins = r.shadowRoot.querySelectorAll(".range-pin");
            if (pins) {
              for (let i = 0; i < pins.length; i++) {
                const pin = pins[i];
                pin["style"]["transform"] = "none";
                pin["style"]["transition"] = "none";
              }
            }
          }
        }
      }
    });
  }
}
