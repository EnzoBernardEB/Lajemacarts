import {Component, input, InputSignal} from '@angular/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardTitle
} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'lajemacarts-summary-card',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardImage,
    MatCardActions,
    MatButton,
    MatIcon,
    NgOptimizedImage
  ],
  template: `
    <mat-card class="overflow-hidden" style="background-color: #1F2937;">
      <mat-card-header class="p-6">
        <mat-card-title>{{ title() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content class="px-6">
        <p class="text-3xl font-bold mt-2">{{ value() }}</p>
        <p class="text-[#9CA3AF] text-sm mt-1">{{ description() }}</p>
      </mat-card-content>

      <img mat-card-image [ngSrc]="imageUrl()" [alt]="title()" class="aspect-video object-cover" width="32" height="32">

      <mat-card-actions class="p-4" style="background-color: #374151;">
        <button mat-flat-button color="primary" class="w-full">
          <mat-icon>add</mat-icon>
          Add New
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrl: './summary-card.component.scss'
})
export class SummaryCardComponent {
  readonly title: InputSignal<string> = input.required();
  readonly value: InputSignal<string> = input.required();
  readonly description: InputSignal<string> = input.required();
  readonly imageUrl: InputSignal<string> = input.required();
}
