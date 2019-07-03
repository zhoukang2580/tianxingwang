import { FlightCabinEntity } from "./../../models/flight/FlightCabinEntity";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Renderer2
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
import { ModalController } from "@ionic/angular";
import { TicketchangingComponent } from "../ticketchanging/ticketchanging.component";

@Component({
  selector: "app-fly-list-item",
  templateUrl: "./fly-list-item.component.html",
  styleUrls: ["./fly-list-item.component.scss"],
  animations: [
    trigger("myInsertRemoveTrigger", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateX(100%)" }),
        animate("200ms", style({ opacity: 1, transform: "translateX(0)" }))
      ]),
      transition(":leave", [
        style({ opacity: 1, transform: "translateX(-10%)" }),
        animate(
          "100ms",
          style({ opacity: 0, height: "0", transform: "translateX(100%)" })
        )
      ])
    ]),
    trigger("openclose", [
      state("true", style({ height: "*" })),
      state("false", style({ height: "0" })),
      transition("true<=>false", animate("200ms"))
    ])
  ]
})
export class FlyListItemComponent implements OnInit {
  @Input()
  flightSegment: FlightSegmentEntity;
  @Input()
  itmIndex: number;
  @Output()
  bookTicket: EventEmitter<{
    cabin: FlightCabinEntity;
    flightSegment: FlightSegmentEntity;
  }>;
  showIndex = !environment.production;
  constructor(
    private dayService: SelectDateService,
    private modalCtrl: ModalController
  ) {
    this.bookTicket = new EventEmitter();
  }
  hasStopCities() {
    return this.flightSegment.StopCities.length > 0;
  }
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
}
