import { Component, OnInit, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-book-expense-types-comp",
  templateUrl: "./book-expense-types-comp.component.html",
  styleUrls: ["./book-expense-types-comp.component.scss"]
})
export class BookExpenseTypesCompComponent implements OnInit {
  expenseType: any;
  @Input() expenseTypes: any[];
  @Output() expenseTypesChange: EventEmitter<any>;
  constructor() {
    this.expenseTypesChange = new EventEmitter();
  }

  ngOnInit() {}
  onValueChange() {
    if (this.expenseTypes) {
      this.expenseTypes = this.expenseTypes.map(it => {
        it.isChecked = it == this.expenseType;
        return it;
      });
      this.expenseTypesChange.emit(this.expenseTypes);
    }
  }
}
