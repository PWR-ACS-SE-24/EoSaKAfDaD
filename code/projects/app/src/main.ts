import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";
import { initWasm } from "steg";

initWasm()
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err));
