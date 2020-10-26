import { LangService } from '../../../services/lang.service';
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
  OnDestroy,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { CredentialsEntity } from "../../models/CredentialsEntity";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";

@Component({
  selector: "app-book-credential-comp",
  templateUrl: "./book-credential-comp.component.html",
  styleUrls: ["./book-credential-comp.component.scss"]
})
export class BookCredentialCompComponent
  implements OnInit, AfterViewInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  private langService: LangService;
  // @Input() isExchange: boolean;
  @Input() credential: CredentialsEntity;
  @Input() credentials: CredentialsEntity[];
  // @Input() isFlightTrainHotel: "flight" | "train" | "hotel";
  @Output() savecredential: EventEmitter<any>;
  @Output() modify: EventEmitter<any>;
  @Output() managementCredentials: EventEmitter<any>;
  @Input() canMaintainCredentials;
  @Input() canEditName;
  @Input() canEditSurname;
  @Input() canEditNumber = false;
  @Input() isNotWihte;
  @Input() canEdit =true;
  @Input() isself =true;
  isModified = false;
  CredentialsType = CredentialsType;
  @ViewChild(IonSelect) ionSelect: IonSelect;
  constructor(public router: Router) {
    this.savecredential = new EventEmitter();
    this.modify = new EventEmitter();
    this.managementCredentials = new EventEmitter();
  }
  compareFn(t1: CredentialsEntity, t2: CredentialsEntity) {
    return (
      (t1 && t2 && t1 == t2) || (t1.Type == t2.Type && t1.Number == t2.Number)
    );
  }
  onModify() {
    if (!this.canEdit) {
      return;
    }
    this.isModified = !this.isModified;
    if (this.isModified) {
      this.modify.emit();
    }
  }
  onMaintainCredentials() {
    this.managementCredentials.emit();
    this.addCredential();
  }
  addCredential() {
    if (!this.canEdit) {
      return;
    }
    this.langService.isEn ?
    this.router.navigate(["member-credential-management_en"], {
      queryParams: { addNew: true },
    })
    :
    this.router.navigate(["member-credential-management"], {
      queryParams: { addNew: true },
    });
  }
  onSave() {
    this.savecredential.emit(this.credential);
    // console.log(this.credential.Type, "qdjleijdeldelidjiw");
    // if(this.credential.Type==CredentialsType.HvPass||this.credential.Type==CredentialsType.Taiwan){
    //   debugger
    //   this.canEdit=true;
    //   this.isShowDisable=true
    // }
  }
  async ngOnInit() {
    // console.log(this.isNotWihte,"this.isNotWihte");  
    if(this.isNotWihte){
      this.canEdit=false;
    }
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
    if (!this.canEdit) {
      AppHelper.alert("请先点击修改");
      return;
    }
    if (this.ionSelect) {
      this.ionSelect.open();
    }
  }
}
