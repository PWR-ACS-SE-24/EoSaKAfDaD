import { Component } from "@angular/core";
import {
  TabberComponent,
  TabberTabComponent,
} from "../../shared/tabber/tabber.component";
import { E4ConvertComponent } from "./e4-convert/e4-convert.component";
import { E4MergeComponent } from "./e4-merge/e4-merge.component";
import { E4SplitComponent } from "./e4-split/e4-split.component";

@Component({
  selector: "app-e4",
  standalone: true,
  imports: [
    TabberComponent,
    TabberTabComponent,
    E4ConvertComponent,
    E4SplitComponent,
    E4MergeComponent,
  ],
  templateUrl: "./e4.component.html",
  styleUrl: "./e4.component.css",
})
export class E4Component {}
