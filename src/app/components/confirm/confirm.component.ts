import { ModalController } from '@ionic/angular';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-comp',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
})
export class ConfirmComponent implements OnInit {
  @Output()
  confirmevent: EventEmitter<boolean>;
  @Input()
  confirmText: string;
  @Input()
  cancelText: string;
  @Input()
  description: string;
  constructor(private modalCtrl: ModalController) {
    this.confirmevent = new EventEmitter();
  }

  ngOnInit() { }
  onConfirm() {
    this.confirmevent.emit(true);
    this.dismissLayer(true);
  }
  onCancel() {
    this.confirmevent.emit(false);
    this.dismissLayer(false);
  }
  async dismissLayer(confirm: boolean) {
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss(confirm);
    }
  }
}
