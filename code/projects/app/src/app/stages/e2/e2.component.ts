import { Component } from "@angular/core";
import { TabberComponent, TabberTabComponent } from "../../shared/tabber/tabber.component";
import { E2EncodeComponent } from "./e2-encode/e2-encode.component";
import { E2DecodeComponent } from "./e2-decode/e2-decode.component";

@Component({
  selector: "app-e2",
  standalone: true,
  imports: [
    TabberComponent,
    TabberTabComponent,
    E2EncodeComponent,
    E2DecodeComponent
],
  templateUrl: "./e2.component.html",
  styleUrl: "./e2.component.css",
})
export class E2Component {}
