import { AfterViewInit, EventEmitter, Output, Component, OnInit, Input, ElementRef, QueryList, ViewChildren } from '@angular/core';
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
  selectedSeatTxt: string;
  private selectSeatLocations: HTMLElement[];
  constructor() {
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
              this.selectSeatLocations.push(it as HTMLElement);
            });
          }
        }
      })
    }
  }
  ngOnInit() { }
  onSelect(evt: CustomEvent) {
    const div = evt.target as HTMLElement;
    if (div) {
      this.selectSeatLocations.forEach(s => {
        const isSelected = s.classList.contains("selected");
        s.classList.remove('selected');
        if (!isSelected && s.getAttribute("val") == this.selectedSeatTxt) {
          s.classList.add("selected");
        }
        if (s.classList.contains("selected")) {
          this.selectedSeatTxt = div.getAttribute("val");
        } else {
          this.selectedSeatTxt = ""
        }
      });
    }
    this.seatPicker.emit(this.selectedSeatTxt);
  }

}
