import { AfterViewInit, EventEmitter, Output, Component, OnInit, Input, ElementRef, QueryList, ViewChildren, OnChanges, SimpleChanges } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { TrainEntity, TrainSeatType } from '../../models/TrainEntity';
import { TrainSeatEntity } from '../../models/TrainSeatEntity';

@Component({
  selector: 'app-seat-picker',
  templateUrl: './seat-picker.component.html',
  styleUrls: ['./seat-picker.component.scss'],
})
export class SeatPickerComponent implements OnInit, AfterViewInit {
  @Output() seatPicker: EventEmitter<any>;
  @Input() selectdSeat: TrainSeatEntity;
  @ViewChildren("jin") jinEles: QueryList<ElementRef<HTMLElement>>;
  TrainSeatType = TrainSeatType;
  @Input() selectSeatLocation: string;
  selectedSeatTxt: string;
  private selectSeatLocations: { jin: HTMLElement, target: HTMLElement }[] = [];
  constructor(private el: ElementRef<HTMLElement>) {
    this.seatPicker = new EventEmitter();
  }
  ngAfterViewInit() {
    if (this.jinEles) {
      this.selectSeatLocations = [];
      this.jinEles.forEach(el => {
        if (el.nativeElement) {
          const selectSeatLocations = el.nativeElement.querySelectorAll(".selectSeatLocation");
          if (selectSeatLocations) {
            selectSeatLocations.forEach(it => {
              this.selectSeatLocations.push({ jin: el.nativeElement as HTMLElement, target: it as HTMLElement });
            });
          }
        }
      });
      setTimeout(() => {
        if (this.selectSeatLocation) {
          const jinEl = this.jinEles.find(it => it.nativeElement && it.nativeElement.getAttribute("trainseattype") == `${this.selectdSeat.SeatType}`);
          if (jinEl) {
            if (jinEl) {
              const ss = jinEl.nativeElement.querySelectorAll(".selectSeatLocation");
              let ele: HTMLElement;
              if (ss) {
                for (let i = 0; i < ss.length; i++) {
                  const e = ss.item(i);
                  if (e.getAttribute("val") == this.selectSeatLocation) {
                    ele = e as HTMLElement;
                    break;
                  }
                }
                if (ele) {
                  ele.classList.add("selected");
                }
              }
            }
          }
        }
      }, 200);
    }
  }
  ngOnInit() { }
  onSelect(evt: CustomEvent) {
    const div = evt.target as HTMLElement;
    console.log(div);
    if (div) {
      let isSelected = div.classList.contains("selected");
      isSelected = !isSelected;
      this.selectSeatLocations.forEach(s => {
        s.target.classList.remove('selected');
      });
      if (isSelected) {
        div.classList.add('selected');
        this.selectedSeatTxt = div.getAttribute("val");
      } else {
        this.selectedSeatTxt = ""
      }
    }
    this.seatPicker.emit(this.selectedSeatTxt);
  }

}
