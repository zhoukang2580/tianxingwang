import { Component, OnInit, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-book-expense-types-comp",
  templateUrl: "./book-expense-types-comp.component.html",
  styleUrls: ["./book-expense-types-comp.component.scss"]
})
export class BookExpenseTypesCompComponent implements OnInit {
  @Input() expenseType: string;
  @Input() expenseTypes: string[];
  @Output() expenseTypeChange: EventEmitter<any>;
  constructor() {
    this.expenseTypeChange = new EventEmitter();
  }

  ngOnInit() {}
  onValueChange() {
    this.expenseTypeChange.emit(this.expenseType);
  }
  compareFn(t1: string, t2: string) {
    return t1 && t2 ? t1 === t2 : false;
  }
}
