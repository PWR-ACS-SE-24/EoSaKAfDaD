import { Component } from "@angular/core";
import {
  TabberComponent,
  TabberTabComponent,
} from "../../shared/tabber/tabber.component";
import { E5EncodeComponent } from "./e5-encode/e5-encode.component";
import { E5DecodeComponent } from "./e5-decode/e5-decode.component";

@Component({
  selector: "app-e5",
  standalone: true,
  imports: [
    TabberComponent,
    TabberTabComponent,
    E5EncodeComponent,
    E5DecodeComponent,
  ],
  templateUrl: "./e5.component.html",
  styleUrl: "./e5.component.css",
})
export class E5Component {}
