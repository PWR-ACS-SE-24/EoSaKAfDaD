import { Component } from "@angular/core";
import {
  TabberComponent,
  TabberTabComponent,
} from "../../shared/tabber/tabber.component";
import { E5ConvertComponent } from "./e5-convert/e5-convert.component";
import { E5SplitComponent } from "./e5-split/e5-split.component";
import { E5MergeComponent } from "./e5-merge/e5-merge.component";

@Component({
  selector: "app-e5",
  standalone: true,
  imports: [
    TabberComponent,
    TabberTabComponent,
    E5ConvertComponent,
    E5SplitComponent,
    E5MergeComponent,
  ],
  templateUrl: "./e5.component.html",
  styleUrl: "./e5.component.css",
})
export class E5Component {}
