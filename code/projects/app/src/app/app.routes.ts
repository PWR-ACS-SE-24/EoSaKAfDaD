import { Routes } from "@angular/router";
import { E1Component } from "./stages/e1/e1.component";
import { E2Component } from "./stages/e2/e2.component";

export const routes: Routes = [
  { path: "e1", component: E1Component },
  { path: "e2", component: E2Component },
];
