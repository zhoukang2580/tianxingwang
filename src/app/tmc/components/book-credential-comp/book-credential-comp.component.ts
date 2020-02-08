import { Subscription } from "rxjs";
import { StaffService } from "./../../../hr/staff.service";
import { IonSelect } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { Router } from "@angular/router";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import { CredentialsEntity } from "../../models/CredentialsEntity";

@Component({
  selector: "app-book-credential-comp",
  templateUrl: "./book-credential-comp.component.html",
  styleUrls: ["./book-credential-comp.component.scss"]
})
export class BookCredentialCompComponent
  implements OnInit, AfterViewInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  @Input() isExchange: boolean;
  @Input() credential: CredentialsEntity;
  @Input() credentials: CredentialsEntity[];
  // @Input() isFlightTrainHotel: "flight" | "train" | "hotel";
  @Output() savecredential: EventEmitter<any>;
  @Output() modify: EventEmitter<any>;
  isModified = false;
  isSelf = true;
  @ViewChild(IonSelect) ionSelect: IonSelect;
  constructor(private router: Router, private staffService: StaffService) {
    this.savecredential = new EventEmitter();
    this.modify = new EventEmitter();
  }
  compareFn(t1: CredentialsEntity, t2: CredentialsEntity) {
    return (
      (t1 && t2 && t1 == t2) || (t1.Type == t2.Type && t1.Number == t2.Number)
    );
  }
  onModify() {
    if (this.isExchange) {
      return;
    }
    this.isModified = !this.isModified;
    if (this.isModified) {
      this.modify.emit();
    }
  }
  onMaintainCredentials() {
    this.router.navigate([
      AppHelper.getRoutePath("member-credential-management")
    ]);
  }
  onSave() {
    this.savecredential.emit(this.credential);
  }
  async ngOnInit() {
    // this.isFlightTrainHotel = "train";
    this.isSelf = await this.staffService.isSelfBookType();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngAfterViewInit() {
    if (this.ionSelect) {
      this.subscription = this.ionSelect.ionChange.subscribe(_ => {
        this.onSave();
      });
    }
  }
  openSelect() {
    if (this.isExchange) {
      return;
    }
    if (!this.isModified) {
      AppHelper.alert("请先点击修改");
      return;
    }
    if (this.ionSelect) {
      this.ionSelect.open();
    }
  }
}
