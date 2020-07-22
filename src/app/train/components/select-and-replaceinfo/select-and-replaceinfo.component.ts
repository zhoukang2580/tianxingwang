import { TrainService } from "src/app/train/train.service";
import { ITrainInfo } from "./../../train.service";
import { TrainEntity } from "./../../models/TrainEntity";
import { Component, OnInit } from "@angular/core";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { ModalController } from "@ionic/angular";
import { TrainSeatEntity } from "../../models/TrainSeatEntity";
import { AppHelper } from "src/app/appHelper";
interface IViewItem {
  info: PassengerBookInfo<ITrainInfo>;
  isSelected: boolean;
}

@Component({
  selector: "app-select-and-replaceinfo",
  templateUrl: "./select-and-replaceinfo.component.html",
  styleUrls: ["./select-and-replaceinfo.component.scss"],
})
export class SelectAndReplaceTrainInfoComponent implements OnInit {
  bookInfos: IViewItem[] = [];
  selectedItems: PassengerBookInfo<ITrainInfo>[] = [];
  train: TrainEntity;
  seat: TrainSeatEntity;
  private trainService: TrainService;
  constructor(private modal: ModalController) {}
  back() {
    this.selectedItems = this.selectedItems.concat(
      this.bookInfos.filter((it) => it.isSelected).map((it) => it.info)
    );
    console.log("SelectAndReplacebookinfoComponent", this.selectedItems);
    this.modal.dismiss(this.selectedItems);
  }
  ngOnInit() {}
  onSelect(item: IViewItem) {
    if (item) {
      if (
        !this.trainService.checkIfSeatIsAllowBook(
          item.info,
          this.seat,
          this.train
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
    this.back();
  }
}
