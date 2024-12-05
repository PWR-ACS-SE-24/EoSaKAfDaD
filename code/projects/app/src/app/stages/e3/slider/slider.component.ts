import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Subject } from "rxjs";

@Component({
  selector: "app-slider",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./slider.component.html",
  styleUrl: "./slider.component.css",
})
export class SliderComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) subject!: Subject<number>;
  @Input({ required: true }) min!: number;
  @Input({ required: true }) max!: number;
  @Input() step: number = 1;

  protected int(text: string): number {
    return parseInt(text, 10);
  }
}
