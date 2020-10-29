import {
  Component,
} from "@angular/core";
import { trigger, state, style } from "@angular/animations";
import { flyInOut } from "src/app/animations/flyInOut";
import { BookPage } from '../book/book.page';
@Component({
  selector: "app-book_en",
  templateUrl: "./book_en.page.html",
  styleUrls: ["./book_en.page.scss"],
  animations: [
    flyInOut,
    trigger("showHide", [
      state("true", style({ display: "initial" })),
      state("false", style({ display: "none" })),
    ]),
  ],
})
export class BookEnPage extends BookPage{
  
}
