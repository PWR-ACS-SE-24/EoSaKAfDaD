import { bootstrapApplication } from "@angular/platform-browser";
import { initWasm } from "steg";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

initWasm()
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err));
