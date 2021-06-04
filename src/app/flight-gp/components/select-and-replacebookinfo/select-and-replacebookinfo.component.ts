import { AppHelper } from "../../../appHelper";
import { ModalController } from "@ionic/angular";
import { IFlightSegmentInfo } from "../../models/PassengerFlightInfo";
import { PassengerBookInfo } from "../../../tmc/tmc.service";
import { Component, OnInit } from "@angular/core";
import { FlightSegmentEntity } from "../../models/flight/FlightSegmentEntity";
import { FlightCabinEntity } from "../../models/flight/FlightCabinEntity";
import { FlightCabinFareType } from '../../models/flight/FlightCabinFareType';
import { FlightGpService } from "../../flight-gp.service";
interface IViewItem {
  info: PassengerBookInfo<IFlightSegmentInfo>;
  isSelected: boolean;
}
@Component({
  selector: "app-select-and-replacebookinfo",
  templateUrl: "./select-and-replacebookinfo.component.html",
  styleUrls: ["./select-and-replacebookinfo.component.scss"]
})
export class SelectAndReplacebookinfoComponent implements OnInit {
  bookInfos: IViewItem[] = [];
  selectedItems: PassengerBookInfo<IFlightSegmentInfo>[] = [];
  flightCabin: FlightCabinEntity;
  flightSegment: FlightSegmentEntity;
  FlightCabinFareType=FlightCabinFareType;
  private flightGpService: FlightGpService;
  constructor(private modal: ModalController) {}
  back(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    this.selectedItems = this.selectedItems.concat(
      this.bookInfos.filter(it => it.isSelected).map(it => it.info)
    );
    console.log("SelectAndReplacebookinfoComponent", this.selectedItems);
    this.modal.dismiss(this.selectedItems);
  }
  ngOnInit() {}
  onSelect(item: IViewItem) {
    if (item) {
      if (
        !this.flightGpService.checkIfCabinIsAllowBook(
          item.info,
          this.flightCabin,
          this.flightSegment
        )
      ) {
        AppHelper.alert("超标不可预订");
        return;
      }
      item.isSelected = !item.isSelected;
    }
  }
  onConfirm() {
    this.back();
  }
  onCancel() {
    this.selectedItems = [];
    this.modal.dismiss(this.selectedItems);
  }
}
