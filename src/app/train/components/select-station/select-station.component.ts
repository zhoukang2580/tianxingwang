import {
  IonRefresher,
  ModalController,
  IonContent,
  DomController,
  IonGrid
} from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Renderer2
} from "@angular/core";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { TrainService } from "../../train.service";
import { Storage } from "@ionic/storage";
const KEY_HISTORIES_STATTIONS = "key_histories_stattions";
@Component({
  selector: "app-select-station",
  templateUrl: "./select-station.component.html",
  styleUrls: ["./select-station.component.scss"]
})
export class SelectTrainStationComponent implements OnInit, AfterViewInit {
  vmKeyword = "";
  histories: TrafficlineEntity[];
  hotStations: TrafficlineEntity[];
  stations: { [key: string]: TrafficlineEntity[] } = {};
  vmStations: TrafficlineEntity[];
  allStations: TrafficlineEntity[] = [];
  letters: string[];
  activeLetter = "A";
  isLoading = false;
  selectedStation: TrafficlineEntity;
  isShowFabButton = false;
  scrollEle: HTMLElement;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild("hot") hotEle: IonGrid;
  @ViewChild("lettersEle") lettersEle: IonGrid;
  @ViewChild(IonContent) ionContent: IonContent;
  constructor(
    private trainService: TrainService,
    private modalCtrl: ModalController,
    private storage: Storage,
    private domCtrl: DomController,
    private render2: Renderer2
  ) {}
  async ngOnInit() {
    this.allStations = await this.trainService.getStationsAsync();
    this.hotStations = this.allStations.filter(s => s.IsHot);
    this.histories = await this.storage.get(KEY_HISTORIES_STATTIONS);
    this.init();
  }
  async ngAfterViewInit() {
    if (!this.scrollEle) {
      this.scrollEle = await this.ionContent.getScrollElement();
    }
  }
  scrollTop() {
    if (this.ionContent) {
      this.ionContent.scrollToTop(200);
    }
  }
  init() {
    this.allStations.forEach(s => {
      if (this.stations[s.FirstLetter]) {
        this.stations[s.FirstLetter].push(s);
      } else {
        this.stations[s.FirstLetter] = [s];
      }
    });
    this.letters = Object.keys(this.stations);
    this.letters.sort((l1, l2) => l1.charCodeAt(0) - l2.charCodeAt(0));
    this.vmStations = this.stations[this.activeLetter];
    this.vmStations.sort((s1, s2) => s1.Sequence - s2.Sequence);
  }
  onScroll(evt: any) {
    if (!this.scrollEle) {
      return;
    }
    // console.log(this.scrollEle.scrollTop);
    this.domCtrl.read(_ => {
      const stop = this.scrollEle.scrollTop;
      if (this.lettersEle && this.lettersEle["el"]) {
        const rect = this.lettersEle["el"].getBoundingClientRect();
        if (rect) {
          this.domCtrl.write(_ => {
            this.isShowFabButton = rect.bottom < stop;
          });
        }
      }
    });
  }
  onSelectLetter(letter: string) {
    this.activeLetter = letter;
    this.vmStations = this.stations[this.activeLetter];
    this.vmStations.sort((s1, s2) => s1.Sequence - s2.Sequence);
    this.scrollToTargetLink();
  }
  private scrollToTargetLink() {
    if (this.hotEle && this.hotEle["el"]) {
      this.domCtrl.read(_ => {
        const rect = this.hotEle["el"].getBoundingClientRect();
        if (rect && this.ionContent) {
          this.domCtrl.write(_ => {
            this.ionContent.scrollByPoint(
              0,
              Math.floor(rect.bottom - rect.height / 5),
              100
            );
          });
        }
      });
    }
  }
  async doRefresh() {
    this.isLoading = true;
    this.allStations = await this.trainService.getStationsAsync(true);
    this.isLoading = false;
    this.init();
    if (this.refresher) {
      this.refresher.complete();
    }
  }
  async back() {
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss(this.selectedStation).catch(_ => {});
    }
  }
  async onSelectStation(station: TrafficlineEntity) {
    this.vmStations.forEach(s => (s.Selected = false));
    this.hotStations.forEach(s => (s.Selected = false));
    this.histories.forEach(s => (s.Selected = false));
    station.Selected = true;
    this.selectedStation = station;
    this.histories = this.histories || [];
    if (!this.histories.find(s => s.Code == station.Code)) {
      this.histories.unshift(station);
    }
    this.storage.set(KEY_HISTORIES_STATTIONS, this.histories.slice(0, 9));
    this.back();
  }
  async doSearch() {
    const kw = this.vmKeyword.trim();
    if (!kw) {
      this.vmStations = this.stations[this.activeLetter];
    } else {
      this.vmStations = this.allStations.filter(s => {
        return (
          kw.toUpperCase() == s.FirstLetter ||
          (s.Name && s.Name.includes(kw)) ||
          (s.Nickname && s.Nickname.includes(kw)) ||
          (s.EnglishName && s.EnglishName.includes(kw)) ||
          (s.CityName && s.CityName.includes(kw))
        );
      });
      this.vmStations.sort((s1, s2) => s1.Sequence - s2.Sequence);
      this.scrollToTargetLink();
    }
  }
}
