import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BadgeComponent, BadgeVariant, CardComponent } from '@fish-ui/components';
import { Listing } from '../../models/listing.model';

@Component({
  selector: 'app-listing-card',
  imports: [CardComponent, BadgeComponent, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingCardComponent {
  readonly listing = input.required<Listing>();

  protected readonly statusVariant = computed<BadgeVariant>(() =>
    this.listing().status === 'active' ? 'success' : 'warning');
}
