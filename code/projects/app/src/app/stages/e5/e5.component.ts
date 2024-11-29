import { Component } from "@angular/core";
import {
  TabberComponent,
  TabberTabComponent,
} from "../../shared/tabber/tabber.component";

@Component({
  selector: "app-e5",
  standalone: true,
  imports: [TabberComponent, TabberTabComponent],
  templateUrl: "./e5.component.html",
  styleUrl: "./e5.component.css",
})
export class E5Component {}
