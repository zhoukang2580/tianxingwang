import { FlightCabinEntity } from "./../../models/flight/FlightCabinEntity";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Renderer2,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef
} from "@angular/core";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import { SelectDateService } from "../../select-date/select-date.service";
import { FlightSegmentEntity } from "../../models/flight/FlightSegmentEntity";
import { LanguageHelper } from "src/app/languageHelper";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { ModalController, DomController } from "@ionic/angular";
import { TicketchangingComponent } from "../ticketchanging/ticketchanging.component";
import { ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "app-fly-list-item",
  templateUrl: "./fly-list-item.component.html",
  styleUrls: ["./fly-list-item.component.scss"],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("myInsertRemoveTrigger", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateX(100%)" }),
        animate("200ms", style({ opacity: 1, transform: "translateX(0)" }))
      ]),
      transition(":leave", [
        style({ opacity: 1, transform: "translateX(-10%)" }),
        animate(
          "200ms",
          style({ opacity: 0, height: "0", transform: "translateX(100%)" })
        )
      ])
    ]),
    trigger("openclose", [
      state(
        "true",
        style({ transform: "scaleY(1)", height: "*", opacity: "1" })
      ),
      state(
        "false",
        style({ transform: "scaleY(0)", height: "0", opacity: "0" })
      ),
      transition("false <=> true", animate("200ms"))
    ])
  ]
})
export class FlyListItemComponent implements OnInit, AfterViewInit, OnChanges {
  opened: boolean;
  showHide: boolean;
  @ViewChild("cabins") cabinsEle: ElementRef<HTMLElement>;
  @Input() flightSegment: FlightSegmentEntity;
  @Input() itmIndex: number;
  @Output() bookTicket: EventEmitter<{
    cabin: FlightCabinEntity;
    flightSegment: FlightSegmentEntity;
  }>;
  animationEventDone = true;
  showIndex = !environment.production;
  constructor(
    private dayService: SelectDateService,
    private modalCtrl: ModalController,
    private render: Renderer2,
    private domCtrl: DomController
  ) {
    this.bookTicket = new EventEmitter();
  }

  onAnimationEventStart(event: AnimationEvent) {
    this.animationEventDone = false;
  }
  onAnimationEventDone(event: AnimationEvent) {
    this.animationEventDone = true;
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.flightSegment) {
    }
  }
  ngAfterViewInit() {}
  onBookTicket(cabin: any) {
    this.bookTicket.emit({
      cabin,
      flightSegment: this.flightSegment
    });
  }
  addoneday() {
    const addDay =
      moment(this.flightSegment.ArrivalTime).date() -
      moment(this.flightSegment.TakeoffTime).date();
    // console.log(addDay);
    return addDay > 0 ? "+" + addDay + LanguageHelper.getDayTip() : "";
  }
  getDateWeek() {
    const d = this.dayService.generateDayModel(
      moment(this.flightSegment.TakeoffTime)
    );
    return `${d.date.substring(
      "2018-".length,
      d.date.length
    )} ${this.dayService.getWeekName(d)}`;
  }
  ngOnInit() {}
  async openrules(cabin: any) {
    this.modalCtrl.dismiss().catch(_ => {});
    const m = await this.modalCtrl.create({
      component: TicketchangingComponent,
      componentProps: { cabin },
      showBackdrop: true,
      cssClass: "ticket-changing"
    });
    m.backdropDismiss = false;
    await m.present();
  }
  toggle() {
    if (!this.opened) {
      this.opened = true;
    }
    // if (!this.animationEventDone) {
    //   return false;
    // }
    this.showHide = !this.showHide;
    if (this.cabinsEle && this.cabinsEle.nativeElement) {
      this.domCtrl.write(() => {
        this.render.setStyle(
          this.cabinsEle.nativeElement,
          "height",
          `${this.showHide ? "initial" : "0"}`
        );
      });
    }
  }
}
