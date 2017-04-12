declare let require;
import { Observable } from 'rxjs';
import { Component, Input, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { make } from '../../factories';
import * as MyApp from '../../models'; // { <%= classifiedModuleName %>, <%= classifiedModuleName %>Item }
import { DISPATCHER } from '../../app.module';
import { AppService } from '../../services/';
// reconsider as pug mixin?
@Component({
  selector: '<%= dasherizedModuleName %>-shared',
  template: require('./<%= dasherizedModuleName %>.shared.pug'),
  styles: [],
  inputs: ['<%= camelizedModuleName %>'],
})
export class <%= classifiedModuleName %>SharedComp {
  disp: { [k: string]: (pl?: any) => void };
  tr: any = this.app.tr;
  @Input() <%= camelizedModuleName %>: MyApp.<%= classifiedModuleName %>;
  // customers;

  constructor(
    public app: AppService,
    public route: ActivatedRoute,
    public store: Store<any>,
    @Inject(DISPATCHER) dispatcher: { <%= camelizedModuleName %>: { [k: string]: (pl: any) => void } },
  ) {
    this.disp = dispatcher.<%= camelizedModuleName %>;
  }

  ngOnInit() {
    // Object.assign(this, this.store.dispatcher); // update, remove
    // this.customers = this.store.select('customers');
  }

  create_item() {
    // this.disp.create_item(make.invoiceItem(this.<%= camelizedModuleName %>.id));
  }

  openConfirm(): void {
    this.app.confirm({
      title: 'Confirm delete',
      message: 'delete this <%= camelizedModuleName %>?',
    }).subscribe(() => {
      this.disp.remove();
    });
  }

}
