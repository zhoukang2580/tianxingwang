import { ModalController } from "@ionic/angular";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
} from "@angular/core";
import { SearchCostcenterComponent } from "../search-costcenter/search-costcenter.component";

@Component({
  selector: "app-book-costcenter-comp",
  templateUrl: "./book-costcenter-comp.component.html",
  styleUrls: ["./book-costcenter-comp.component.scss"],
})
export class BookCostcenterCompComponent implements OnInit {
  nativeElement: HTMLElement;
  @Input() isOtherCostCenter: boolean;
  @Input() otherCostCenterCode: string;
  @Input() otherCostCenterName: string;
  @Input() langOpt = {
    CostCenter: "成本中心",
    Other:"其他"
  };
  @Input() costCenter: {
    code: string;
    name: string;
  };
  @Output() ionChange: EventEmitter<any>;
  constructor(private modalCtrl: ModalController, el: ElementRef) {
    this.nativeElement = el.nativeElement;
    this.ionChange = new EventEmitter();
  }
  async searchCostCenter() {
    if (this.isOtherCostCenter) {
      return;
    }
    const modal = await this.modalCtrl.create({
      component: SearchCostcenterComponent,
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      const res = result.data as { Text: string; Value: string };
      this.costCenter = {
        code: res.Value,
        name: res.Text && res.Text.substring(res.Text.lastIndexOf("-") + 1),
      };
      this.onValueChange();
    }
  }
  onCheckboxValueChange(evt: CustomEvent) {
    this.isOtherCostCenter = evt.detail.checked;
    this.onValueChange();
  }
  onValueChange() {
    this.ionChange.emit({
      isOtherCostCenter: this.isOtherCostCenter,
      otherCostCenterCode: this.otherCostCenterCode,
      otherCostCenterName: this.otherCostCenterName,
      costCenter: this.costCenter,
    });
  }
  ngOnInit() {}
}
