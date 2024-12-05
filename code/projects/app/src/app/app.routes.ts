import { Routes } from "@angular/router";

export const stageRoutes: Routes = [
  {
    path: "e1",
    title: "E1 (LSB v1)",
    loadComponent: () =>
      import("./stages/e1/e1.component").then((m) => m.E1Component),
  },
  {
    path: "e2",
    title: "E2 (DCT)",
    loadComponent: () =>
      import("./stages/e2/e2.component").then((m) => m.E2Component),
  },
  {
    path: "e3",
    title: "E3 (edytor)",
    loadComponent: () =>
      import("./stages/e3/e3.component").then((m) => m.E3Component),
  },
  {
    path: "e4",
    title: "E4 (VC)",
    loadComponent: () =>
      import("./stages/e4/e4.component").then((m) => m.E4Component),
  },
];

export const routes: Routes = [...stageRoutes];
