import { Component } from '@angular/core';
import { TabberComponent, TabberTabComponent } from '../../shared/tabber/tabber.component';
import { E1V1Component } from './e1v1/e1v1.component';
import { E1V2Component } from './e1v2/e1v2.component';

@Component({
    selector: 'app-e1',
    imports: [
        TabberComponent,
        TabberTabComponent,
        E1V1Component,
        E1V2Component
    ],
    templateUrl: './e1.component.html',
    styleUrl: './e1.component.css'
})
export class E1Component {

}
