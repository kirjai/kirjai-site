---
layout: post
tags: ['angular', 'post']
title: Angular component testing with routerLink and routerOutlet
permalink: /ng2-component-testing-routerlink-routeroutlet/index.html
date: 2016-11-07
---

[Official angular testing documentation](https://angular.io/docs/ts/latest/guide/testing.html) is a great place to start when it comes to testing your application,
and while the docs are great and thorough, it might get a little hard trying to quickly find the info that you are
looking for. Especially when things go wrong and you are in the middle of debugging your tests.

One specific subject that I found the docs to be slightly too clever on was testing components that use
the `routerOutlet` and the `routerLink`.

The problem manifests itself as the following error messages:

`'router-outlet' is not a known element`

and

`Can't bind to 'routerLink' since it isn't a known property`

The official documentation explains how you can [stub these two directives in your tests](https://angular.io/docs/ts/latest/guide/testing.html#!#router-outlet-component),
which might be beneficial if you want to test the click events on an element with a
`routerLink`. But more often these error messages prevent the component from rendering and running our
other tests for said component. In which case, all you need to do is add the `RouterTestingModule` to your
imports in the testing module configuration, like so:

```ts
// app.component.spec.ts

import { RouterTestingModule } from '@angular/router/testing'

TestBed.configureTestingModule({
  imports: [RouterTestingModule],
  declarations: [AppComponent],
})
```

This solution still allows you to stub either of these directives in the future, if and when you need it.

> You can find example application with the code above <a href="https://github.com/kirjai/blog-code-snippets/blob/master/testing-routerlink/src/app/app.component.spec.ts" target="_blank">here</a>
