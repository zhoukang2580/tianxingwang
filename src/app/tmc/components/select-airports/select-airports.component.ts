import { animate, style } from "@angular/animations";
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
import { TmcService } from "../../../tmc/tmc.service";
import { trigger, state, transition } from "@angular/animations";
import { StorageService } from "src/app/services/storage-service.service";
@Component({
  selector: "app-select-airports",
  templateUrl: "./select-airports.component.html",
  styleUrls: ["./select-airports.component.scss"],
  animations: [
    trigger("scaleAnimation", [
      state("true", style({ transform: "scale(1.1)" })),
      state("false", style({ transform: "scale(0)" })),
      transition("true<=>false", animate("200ms ease-in-out"))
    ])
  ]
})
export class SelectAirportsModalComponent implements OnInit, AfterViewInit {
  vmKeyword = "";
  hots: TrafficlineEntity[];
  airports: { [key: string]: TrafficlineEntity[] } = {};
  vmAirports: TrafficlineEntity[];
  allAirports: TrafficlineEntity[] = [];
  letters: string[];
  activeLetter = "A";
  isLoading = false;
  selectedItem: TrafficlineEntity;
  isShowFabButton = false;
  scrollEle: HTMLElement;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild("hot") hotEle: IonGrid;
  @ViewChild("lettersEle") lettersEle: IonGrid;
  @ViewChild(IonContent) ionContent: IonContent;
  constructor(
    private tmcService: TmcService,
    private modalCtrl: ModalController,
    private storage: StorageService,
    private domCtrl: DomController
  ) {}
  async ngOnInit() {
    this.allAirports = await this.tmcService.getAllLocalAirports(true);
    this.hots = this.allAirports.filter(s => s.IsHot);
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
    console.time("init");
    this.allAirports.forEach(s => {
      if (this.airports[s.FirstLetter]) {
        this.airports[s.FirstLetter].push(s);
      } else {
        this.airports[s.FirstLetter] = [s];
      }
    });
    this.letters = Object.keys(this.airports);
    this.letters.sort((l1, l2) => l1.charCodeAt(0) - l2.charCodeAt(0));
    this.activeLetter = this.letters[0];
    // console.log(this.airports[this.activeLetter]);
    this.renderList();
    console.timeEnd("init");
  }
  private renderList() {
    console.time("renderList");
    this.vmAirports = [];
    const airports = this.airports[this.activeLetter].slice(0);
    airports.sort((s1, s2) => s1.Sequence - s2.Sequence);
    const loop = () => {
      airports.splice(0, 10).forEach(a => {
        this.vmAirports.push(a);
      });
      if (airports.length) {
        window.requestAnimationFrame(loop);
      }else{
        console.timeEnd("renderList");
      }
    };
    loop();
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
    console.log(this.vmAirports);
    this.renderList();
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
    this.allAirports = await this.tmcService.getAllLocalAirports();
    this.isLoading = false;
    this.init();
    if (this.refresher) {
      this.refresher.complete();
    }
  }
  async back() {
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss(this.selectedItem&&this.selectedItem.Nickname).catch(_ => {});
    }
  }
  async onSelectStation(airport: TrafficlineEntity) {
    this.vmAirports.forEach(s => (s.Selected = false));
    this.hots.forEach(s => (s.Selected = false));
    airport.Selected = true;
    this.selectedItem = airport;
    this.back();
  }
  async doSearch() {
    const kw = this.vmKeyword.trim();
    if (!kw) {
      this.vmAirports = this.airports[this.activeLetter];
    } else {
      this.vmAirports = this.allAirports.filter(s => {
        return (
          kw.toUpperCase() == s.FirstLetter ||
          (s.Name && s.Name.includes(kw)) ||
          (s.Nickname && s.Nickname.includes(kw)) ||
          (s.EnglishName && s.EnglishName.includes(kw)) ||
          (s.CityName && s.CityName.includes(kw))
        );
      });
      this.vmAirports.sort((s1, s2) => s1.Sequence - s2.Sequence);
      this.scrollToTargetLink();
    }
  }
}
