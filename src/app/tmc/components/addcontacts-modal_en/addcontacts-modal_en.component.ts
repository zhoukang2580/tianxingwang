import { Component, OnInit, ViewChild } from "@angular/core";
import { IonRefresher, ModalController } from "@ionic/angular";
import { TmcService } from "src/app/tmc/tmc.service";
import { AddcontactsModalComponent } from '../addcontacts-modal/addcontacts-modal.component';
interface OptionItem {
  Text: string;
  Value: string;
}
@Component({
  selector: "app-addcontacts-modal_en",
  templateUrl: "./addcontacts-modal_en.component.html",
  styleUrls: ["./addcontacts-modal_en.component.scss"],
})
export class AddcontactsModalEnComponent extends AddcontactsModalComponent {

}
