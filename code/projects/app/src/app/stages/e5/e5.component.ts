import { Component } from "@angular/core";
import {
  TabberComponent,
  TabberTabComponent,
} from "../../shared/tabber/tabber.component";
import { E5DecodeJpgComponent } from "./e5-decode-jpg/e5-decode-jpg.component";
import { E5DecodePngComponent } from "./e5-decode-png/e5-decode-png.component";
import { E5EncodeJpgComponent } from "./e5-encode-jpg/e5-encode-jpg.component";
import { E5EncodePngComponent } from "./e5-encode-png/e5-encode-png.component";

@Component({
  selector: "app-e5",
  standalone: true,
  imports: [
    TabberComponent,
    TabberTabComponent,
    E5EncodePngComponent,
    E5DecodePngComponent,
    E5EncodeJpgComponent,
    E5DecodeJpgComponent,
  ],
  templateUrl: "./e5.component.html",
  styleUrl: "./e5.component.css",
})
export class E5Component {}
