import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  Renderer2
} from "@angular/core";

@Component({
  selector: "app-base-input",
  templateUrl: "./base-input.component.html",
  styleUrls: ["./base-input.component.scss"]
})
export class BaseInputComponent implements OnInit {
  originalType = "";
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() position;
  @Input() label: string;
  @Input() type = "text";
  @Input() model: any;
  @Output() modelChange: EventEmitter<any>;
  eyeOn = false;
  constructor() {
    this.modelChange = new EventEmitter();
  }
  onInputChange() {
    this.modelChange.emit(this.model);
  }
  ngOnInit() {
    this.required = this.type == "password";
    this.originalType = this.type;
  }
 onToggleEye() {
    this.eyeOn = !this.eyeOn;
    if (this.eyeOn) {
      this.type = "text";
    } else {
      this.type = this.originalType;
    }
  }
}
