import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  AfterViewInit
} from "@angular/core";
import { AvailableDate } from "../../models/AvailableDate";
import { CalendarService } from "../../calendar.service";
import { DayModel } from "../../models/DayModel";
import { PopoverController } from "@ionic/angular";
import { DateSelectWheelPopoverComponent } from "../date-select-wheel-popover/date-select-wheel-popover.component";
@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent implements OnInit, AfterViewInit {
  weeks: string[];
  @Input() title: string;
  @Input() calendars: AvailableDate[];
  @Output() yearChange: EventEmitter<any>;
  @Output() monthChange: EventEmitter<any>;
  @Output() back: EventEmitter<any>;
  @Output() daySelected: EventEmitter<any>;
  constructor(
    private calendarService: CalendarService,
    private popoverCtrl: PopoverController
  ) {
    this.back = new EventEmitter();
    this.daySelected = new EventEmitter();
    this.yearChange = new EventEmitter();
    this.monthChange = new EventEmitter();
  }
  cancel() {
    this.back.emit();
  }
  async ngOnInit() {
    const w = this.calendarService.getDayOfWeekNames();
    this.weeks = Object.keys(w).map(k => w[k]);
    // this.calendars = await this.calendarService.generateCanlender(12);
  }
  ngAfterViewInit() {}
  async showDateSelectWheel() {
    const p = await this.popoverCtrl.create({
      component: DateSelectWheelPopoverComponent,
      cssClass: "date-select-wheel",
      showBackdrop: true,
      translucent: false,
      backdropDismiss: false,
      animated: false,
      componentProps: {
        isShowDay: false
      }
    });
    p.present();
    const result = await p.onDidDismiss();
    if (result && result.data) {
      const data = result.data as { year: number; month: number; day: number };
      this.yearChange.emit(data.year);
      this.monthChange.emit(data.month);
    }
  }
  getMonth(ym: string) {
    if (!ym) {
      return ym;
    }
    if (ym.includes("-")) {
      const [y, m] = ym.split("-");
      if (y && y.length == 4) {
        return +m;
      }
    }
    return ym || "";
  }
  onDaySelected(day: DayModel) {
    this.calendars.forEach(c => {
      c.dayList.forEach(d => {
        d.selected = d.date == day.date;
      });
    });
    this.daySelected.emit(day);
  }
}
