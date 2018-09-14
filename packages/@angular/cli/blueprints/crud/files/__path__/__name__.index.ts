declare let require;
import { Observable } from 'rxjs';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { make } from '../../factories';
import * as MyApp from '../../models'; // { <%= classifiedModuleName %>, <%= classifiedModuleName %>Item }
import { DISPATCHER } from '../../di';
import { AppService } from '../../services/';

@Component({
  selector: '<%= dasherizedModuleName %>s',
  template: require('./<%= dasherizedModuleName %>.index.pug'),
  styles: [],
})
export class <%= classifiedModuleName %>sComp {
  disp: { [k: string]: (pl?: any) => void };
  tr: any = this.app.tr;
  <%= camelizedModuleName %>s$: Observable<MyApp.<%= classifiedModuleName %>[]> = this.store.select('<%= camelizedModuleName %>s');

  constructor(
    public app: AppService,
    public route: ActivatedRoute,
    public store: Store<any>,
    @Inject(DISPATCHER) dispatcher: { /*<%= camelizedModuleName %>*/crud: { [k: string]: (pl: any) => void } },
  ) {
    this.disp = dispatcher.crud/*<%= camelizedModuleName %>*/;
  }

  ngOnInit() {
    // Object.assign(this, dispatcher.<%= camelizedModuleName %>s);
    this.route.params.subscribe((params) => {
      this.disp.<%= camelizedModuleName %>Index(); // +params['inv_id']
    });
  }

  create() {
    this.disp.create(make.<%= camelizedModuleName %>());
  }

}
