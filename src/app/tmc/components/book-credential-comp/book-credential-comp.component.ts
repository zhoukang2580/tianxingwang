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
  constructor() {
    this.savecredential = new EventEmitter();
  }
  compareFn(t1: CredentialsEntity, t2: CredentialsEntity) {
    return (
      (t1 && t2 && t1 == t2) || (t1.Type == t2.Type && t1.Number == t2.Number)
    );
  }
  onSave() {
    this.savecredential.emit(this.credential);
  }
  ngOnInit() {}
}
