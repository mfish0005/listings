import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent, BadgeVariant, CardComponent } from '@fish-ui/components';
import { DeleteListingComponent } from '../../../../shared/listing-delete/delete-listing.component';
import { Listing } from '../../models/listing.model';

@Component({
  selector: 'app-listing-card',
  imports: [CardComponent, BadgeComponent, DeleteListingComponent, RouterLink, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingCardComponent {
  readonly listing = input.required<Listing>();

  readonly deleted = output<void>();

  protected readonly statusVariant = computed<BadgeVariant>(() =>
    this.listing().status === 'active' ? 'success' : 'warning');
}
