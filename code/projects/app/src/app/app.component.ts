import { Component } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { stageRoutes } from "./app.routes";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  protected readonly stageRoutes = stageRoutes;
}
