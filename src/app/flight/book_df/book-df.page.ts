import { flyInOut } from "../../animations/flyInOut";
import {
  Component,
} from "@angular/core";
import { BookPage } from '../book/book.page';

@Component({
  selector: "app-book-df",
  templateUrl: "./book-df.page.html",
  styleUrls: ["./book-df.page.scss"],
  animations: [flyInOut],
})
export class BookDfPage extends BookPage{}
