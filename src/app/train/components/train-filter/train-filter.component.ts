import {
  FilterTrainCondition,
  TrainFilterItemModel
} from "./../../models/FilterCondition";
import { TimeSpanComponent } from "./time-span/time-span.component";
import { TrainEntity } from "./../../models/TrainEntity";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter
} from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-train-filter",
  templateUrl: "./train-filter.component.html",
  styleUrls: ["./train-filter.component.scss"]
})
export class TrainFilterComponent implements OnInit {
  @Input() trains: TrainEntity[];
  @Output() filterConditionChange: EventEmitter<FilterTrainCondition>;
  trainTypes: TrainFilterItemModel[];
  depatureStations: TrainFilterItemModel[];
  arrivalStations: TrainFilterItemModel[];
  @ViewChild(TimeSpanComponent) timeSpanComp: TimeSpanComponent;
  filterCondition: FilterTrainCondition;
  constructor(private modalCtrl: ModalController) {
    this.filterConditionChange = new EventEmitter();
    this.filterCondition = FilterTrainCondition.init();
  }
  reset() {
    this.init();
    if (this.timeSpanComp) {
      this.timeSpanComp.reset();
    }
  }
  async done() {
    this.filterCondition.arrivalStations = this.arrivalStations.filter(
      it => it.isChecked
    );
    this.filterCondition.departureStations = this.depatureStations.filter(
      it => it.isChecked
    );
    this.filterCondition.trainTypes = this.trainTypes.filter(
      it => it.isChecked
    );
    this.filterConditionChange.emit(this.filterCondition);
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss(this.filterCondition).catch(_ => 0);
    }
  }
  ngOnInit() {
    this.init();
  }
  private init() {
    this.initTrainTypes();
    this.initTimeSpan();
    this.initStations();
  }
  private initTimeSpan() {}
  private initStations() {
    this.depatureStations = [];
    this.arrivalStations = [];
    if (this.trains) {
      this.trains.forEach(train => {
        if (!this.depatureStations.find(it => it.id == train.FromStationCode)) {
          this.depatureStations.push({
            id: train.FromStationCode,
            label: train.FromStationName,
            isChecked: false
          });
        }
        if (
          !this.arrivalStations.find(item => item.id == train.ToStationCode)
        ) {
          this.arrivalStations.push({
            id: train.ToStationCode,
            label: train.ToStationName,
            isChecked: false
          });
        }
      });
    }
  }
  private initTrainTypes() {
    if (this.trains) {
      this.trainTypes = [];
      this.trains.forEach(it => {
        if (!this.trainTypes.find(item => item.id == it.TrainType + "")) {
          const code = it.TrainCode && it.TrainCode.replace(/\d+/g, "");
          this.trainTypes.push({
            label: code ? `${code}-${it.TrainTypeName}` : it.TrainTypeName,
            id: `${it.TrainType}`,
            isChecked: false
          });
        }
      });
    }
  }
  toggleCheck(item: TrainFilterItemModel) {
    item.isChecked = !item.isChecked;
  }
  onTimeSpan(evt: { lower: number; upper: number }) {
    if (this.filterCondition) {
      this.filterCondition.departureTimeSpan = {
        lower: evt.lower || 0,
        upper: evt.upper || 24
      };
    }
  }
}
