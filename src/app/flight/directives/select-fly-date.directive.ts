import { ModalController } from "@ionic/angular";
import { Directive, HostListener } from "@angular/core";
import { SelectFlyDateComponent } from "../components/select-fly-date/select-fly-date.component";

@Directive({
  selector: "[appSelectFlyDate]"
})
export class SelectFlyDateDirective {
  @HostListener("click")
  async onselect() {
    const m = await this.modalCtrl.create({
      component: SelectFlyDateComponent
    });
    m.present();
  }
  constructor(private modalCtrl: ModalController) {}
}
