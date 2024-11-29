import {
  AfterContentInit,
  Component,
  ContentChildren,
  Input,
  QueryList,
} from "@angular/core";

@Component({
  selector: "app-tabber-tab",
  standalone: true,
  template: "<div [hidden]='!active'><ng-content></ng-content></div>",
})
export class TabberTabComponent {
  @Input({ required: true }) public name!: string;
  @Input() public active = false;
}

@Component({
  selector: "app-tabber",
  standalone: true,
  templateUrl: "./tabber.component.html",
  styleUrl: "./tabber.component.css",
})
export class TabberComponent implements AfterContentInit {
  @ContentChildren(TabberTabComponent)
  protected tabs!: QueryList<TabberTabComponent>;

  public ngAfterContentInit(): void {
    if (this.tabs.length > 0) {
      this.selectTab(this.tabs.first);
    }
  }

  protected selectTab(tab: TabberTabComponent): void {
    this.tabs.forEach((t) => (t.active = false));
    tab.active = true;
  }
}
