import { CommonModule } from "@angular/common";
import { Component, input, model } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-slider",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./slider.component.html",
  styleUrl: "./slider.component.css",
})
export class SliderComponent {
  public readonly value = model<number>();
  public readonly label = input.required<string>();
  public readonly min = input.required<number>();
  public readonly max = input.required<number>();
  public readonly step = input(1);
}
