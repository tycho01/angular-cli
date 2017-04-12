declare let require;
import { Observable } from 'rxjs';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { make } from '../../factories';
import * as MyApp from '../../models'; // { <%= classifiedModuleName %>, <%= classifiedModuleName %>Item }
import { DISPATCHER } from '../../app.module';
import { AppService } from '../../services/';

@Component({
  selector: '<%= dasherizedModuleName %>',
  template: require('./<%= dasherizedModuleName %>.detail.pug'),
  styles: [],
})
export class <%= classifiedModuleName %>Comp {
  disp: { [k: string]: (pl?: any) => void };
  tr: any = this.app.tr;
  <%= camelizedModuleName %>$: Observable<MyApp.<%= classifiedModuleName %>>;

  constructor(
    public app: AppService,
    public route: ActivatedRoute,
    public store: Store<any>,
    @Inject(DISPATCHER) dispatcher: { <%= camelizedModuleName %>: { [k: string]: (pl: any) => void } },
  ) {
    this.disp = dispatcher.<%= camelizedModuleName %>;
  }

  ngOnInit() {
    // Object.assign(this, dispatcher.<%= camelizedModuleName %>s);
    this.<%= camelizedModuleName %>$ = this.store.select('<%= camelizedModuleName %>s'); // id
    this.route.params.subscribe((params) => {
      this.disp.<%= camelizedModuleName %>Detail({ invoice_id: +params['inv_id'], id: +params['id'] });
      // .then(x => {
      //   this.item = makeInvoiceItem(x);
      // });
    });
  }

}

