import { Component } from "@angular/core";
import { TabberComponent, TabberTabComponent } from "../../shared/tabber/tabber.component";
import { E3EncodeComponent } from "./e3-encode/e3-encode.component";
import { E3DecodeComponent } from "./e3-decode/e3-decode.component";

@Component({
  selector: "app-e3",
  standalone: true,
  imports: [
    TabberComponent,
    TabberTabComponent,
    E3EncodeComponent,
    E3DecodeComponent
],
  templateUrl: "./e3.component.html",
  styleUrl: "./e3.component.css",
})
export class E3Component {}
