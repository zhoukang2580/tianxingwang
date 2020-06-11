import { ComboboxModalComponent } from "./../combobox-modal/combobox-modal.component";
import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { Subject, BehaviorSubject } from "rxjs";
import { ModalController } from "@ionic/angular";
export interface IKeyValue {
  Text: string;
  Value?: string;
}
@Component({
  selector: "app-combobox",
  templateUrl: "./combobox.component.html",
  styleUrls: ["./combobox.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboboxComponent implements OnInit, OnChanges {
  private dataSource: Subject<IKeyValue[]>;

  @Input() data: IKeyValue[];
  @Input() hasInputBorder = true;
  @Input() keyValue: IKeyValue;
  @Input() label: string;
  @Output() keyValueChange: EventEmitter<IKeyValue>;
  @Output() textChange: EventEmitter<string>;
  value: string;
  isShowSearchIcon = false;
  constructor(private modalCtrl: ModalController) {
    this.keyValueChange = new EventEmitter();
    this.textChange = new EventEmitter();
    this.dataSource = new BehaviorSubject([]);
  }
  onChange() {
    this.textChange.emit(this.value || "");
  }
  ngOnInit() { }
  onClick(item: IKeyValue) {
    this.keyValueChange.emit(item);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.data && changes.data.currentValue) {
      this.dataSource.next(this.data);
    }
  }
  onOpenSearchModal(evt: CustomEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.openModal();
  }
  private async openModal() {
    const textChange = new EventEmitter<string>();
    const sub = textChange.subscribe(value => {
      this.textChange.emit(value);
    });
    const m = await this.modalCtrl.create({
      component: ComboboxModalComponent,
      componentProps: {
        dataSource: this.dataSource.asObservable(),
        textChange,
        keyValue: this.value
      }
    });
    m.present();
    const result = await m.onDidDismiss();
    sub.unsubscribe();
    if (result && result.data) {
      this.onClick(result.data);
    }
  }
}
