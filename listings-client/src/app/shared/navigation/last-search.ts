import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LastSearch {
  private params: Params = {};

  get queryParams(): Params {
    return this.params;
  }

  remember(params: Params): void {
    this.params = params;
  }
}
