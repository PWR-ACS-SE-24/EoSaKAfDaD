import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  TabberComponent,
  TabberTabComponent,
} from "../../shared/tabber/tabber.component";
import { E3DiffComponent } from "./e3-diff/e3-diff.component";
import { E3EditorComponent } from "./e3-editor/e3-editor.component";
@Component({
  selector: "app-e3",
  standalone: true,
  imports: [
    CommonModule,
    TabberComponent,
    TabberTabComponent,
    E3DiffComponent,
    E3EditorComponent,
  ],
  templateUrl: "./e3.component.html",
  styleUrl: "./e3.component.css",
})
export class E3Component {}
