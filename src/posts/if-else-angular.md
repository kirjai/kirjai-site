---
layout: post
tags: ['angular', 'post']
title: Using If - Else syntax in Angular
permalink: /if-else-angular/
date: 2017-02-27
---

As we approach March 2017, Angular version 4 is almost here. Staying true to the [official release schedule](https://github.com/angular/angular/blob/master/docs/RELEASE_SCHEDULE.md)
the first RC for Angular 4.0 has recently been released. There are many exciting new features, described
[in the release candidate changelog](https://github.com/angular/angular/blob/master/CHANGELOG.md#400-rc1-2017-02-24),
like the improved view engine and server side rendering. Among them, is long awaited support for `if - else` syntax
in the template.

What used to be either two separate `*ngIf` directives or a `*ngSwitch`, can now become an elegant `*ngIf="condition; else templateReference"`

```html
// app.component.html
<h1 *ngIf="title; else elseBlock">
  {{ title }}
  <h1>
    <ng-template #elseBlock>No title</ng-template>
  </h1>
</h1>
```

As you can see in the snippet above, after the `else` keyword, we're passing in a [template reference variable](https://angular.io/docs/ts/latest/guide/template-syntax.html#!#ref-vars),
that tells Angular which DOM element we want to render when the condition is false, in this case, when the `title` is falsy.
Because `elseBlock` is just a variable, it can be whatever string you want. This should help simplify your template logic a little.

On top of this, there are more syntax improvements coming in Angular 4.0, like better integration with the `async` pipe, so keep your eyes open for more.
