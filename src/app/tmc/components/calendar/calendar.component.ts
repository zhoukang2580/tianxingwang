import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { AvailableDate } from "../../models/AvailableDate";
import { CalendarService } from "../../calendar.service";
import { DayModel } from "../../models/DayModel";
import { PickerController, IonDatetime } from "@ionic/angular";
import { LanguageHelper } from "src/app/languageHelper";
@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent implements OnInit, AfterViewInit {
  weeks: string[];
  minyear = new Date().getFullYear();
  @Input() calendars: AvailableDate[];
  @Output() yearChange: EventEmitter<any>;
  @Output() monthChange: EventEmitter<any>;
  @Output() back: EventEmitter<any>;
  @Output() daySelected: EventEmitter<any>;
  @ViewChild(IonDatetime) ionDatetime: IonDatetime;

  constructor(
    private calendarService: CalendarService,
    private pickerCtrl: PickerController
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
  ngAfterViewInit() {
    if (this.ionDatetime) {
      this.ionDatetime.cancelText = LanguageHelper.getCancelTip();
      this.ionDatetime.doneText = LanguageHelper.getConfirmTip();
      this.ionDatetime.pickerOptions = {
        cssClass: "datetimepicker"
      };
    }
  }
  private getColumns() {
    const columns = [];
    for (let i = 0; i < 2; i++) {
      if (i === 0) {
        columns.push({
          name: "year",
          options: new Array(10).fill(0).map((_, index) => {
            const y = new Date(new Date().getFullYear() + index).getFullYear();
            return {
              text: y,
              value: y
            };
          })
        });
      } else {
        columns.push({
          name: `month`,
          options: new Array(12).fill(0).map((_, index) => {
            const m = index + 1;
            return {
              text: m,
              value: m
            };
          })
        });
      }
    }
    return columns;
  }
  async showPicker() {
    const picker = await this.pickerCtrl.create({
      columns: this.getColumns(),
      buttons: [
        {
          text: LanguageHelper.getCancelTip(),
          role: "cancel"
        },
        {
          text: LanguageHelper.getConfirmTip(),
          handler: value => {
            if (value && value.year && value.month) {
              this.yearChange.emit(value.year.value);
              this.monthChange.emit(value.month.value);
            }
          }
        }
      ]
    });
    // picker.present();
    if (this.ionDatetime) {
      this.ionDatetime.open();
      this.ionDatetime.ionChange.subscribe(
        (value: { detail: { value: string } }) => {
          if (
            value &&
            value.detail &&
            value.detail.value &&
            value.detail.value.includes("T")
          ) {
            const [date, time] = value.detail.value.split("T");
            // 2019-08-01
            this.yearChange.emit(date.substr(0, 4));
            this.monthChange.emit(+date.substr(5, 2));
            console.log(date, time);
          }
        }
      );
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
