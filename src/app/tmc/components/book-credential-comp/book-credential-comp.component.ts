import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { CredentialsEntity } from "../../models/CredentialsEntity";

@Component({
  selector: "app-book-credential-comp",
  templateUrl: "./book-credential-comp.component.html",
  styleUrls: ["./book-credential-comp.component.scss"]
})
export class BookCredentialCompComponent implements OnInit {
  @Input() credential: CredentialsEntity;
  @Input() credentials: CredentialsEntity[];
  @Output() savecredential: EventEmitter<any>;
  @Output() modify: EventEmitter<any>;
  isModified = false;
  constructor() {
    this.savecredential = new EventEmitter();
    this.modify = new EventEmitter();
  }
  compareFn(t1: CredentialsEntity, t2: CredentialsEntity) {
    return (
      (t1 && t2 && t1 == t2) || (t1.Type == t2.Type && t1.Number == t2.Number)
    );
  }
  onModify() {
    this.isModified = !this.isModified;
    if (this.isModified) {
      this.modify.emit();
    }
  }
  onSave() {
    this.savecredential.emit(this.credential);
  }
  ngOnInit() {
  }
}
