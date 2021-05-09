---
layout: post
tags: ['angular', 'post']
title: Dynamic guard redirects with route data in Angular
permalink: /dynamic-guard-redirects-angular/
date: 2016-11-23
---

If you are using the Angular router within your application, you probably encountered route guards.
For those who don't know, guards allow you to restrict specific routes based on certain criteria.

In reality, guards are nothing but services that implement a `CanActivate` interface. Combine that with
custom route data and we can dynamically redirect the user to different routes while reusing the same guards.

```ts
import { CanActivate } from '@angular/router'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean | Observable<boolean> | Promise<boolean> {
    //...
  }
}
```

`canActivate` method needs to return a boolean (which can be wrapped in an Observable or a Promise),
which signifies whether a specific route can be navigated to by the user.
We can now attach this `AuthGuard` to any of our routes.

```ts
//...

const appRoutes: Routes = [
  {
    path: 'restricted',
    component: RestrictedComponent,
    canActivate: [AuthGuard],
  },
]
```

With this setup, whenever a user will try navigating to the `/restricted` route, Angular Router will
invoke the `canActivate()` method on the `AuthGuard` and depending on whether it returns `true` or
`false`, user will either be allowed through to the route or not.

Since `AuthGuard` is just an Angular service, we can inject dependencies into it.
We want to only allow authenticated users through to the `/restricted` route, so we can inject an authentication
service into `AuthGuard`.

```ts
//...

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(): boolean {
    return this.authService.isUserLoggedIn
  }
}
```

## Redirecting

In case the user is not authenticated and not allowed to view the `/restricted` route,
we would like to navigate him somewhere else. We can manually invoke the `navigate()` method
on the `Router`.

```ts
//...

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    let isUserLoggedIn = this.authService.isUserLoggedIn

    if (!isUserLoggedIn) {
      this.router.navigate(['/unrestricted'])
    }

    return isUserLoggedIn
  }
}
```

Now, if an unauthenticated user tries to access the `/restricted` route, he will be redirected to
`/unrestricted`.

## Dynamic redirection routes

Realistically, as our application grows, we are likely to start reusing `AuthGuard` more and more.
However, currently, it will always redirect unauthenticated users to `/unrestricted`. We can make the
redirect route dynamic with custom route data.

When defining routes for the application, each route has an optional `data` property.

```ts
//...

const appRoutes: Routes = [
  {
    path: 'restricted',
    component: RestrictedComponent,
    canActivate: [AuthGuard],
    data: {
      authGuardRedirect: '/custom-redirect',
    },
  },
]
```

Now, in our `AuthGuard` we can get hold of `authGuardRedirect` property and pass that into `router.navigate()` method.

`canActivate()` method takes in two parameters: `ActivatedRouteSnapshot` and `RouterStateSnapshot`. Our custom data can be found on
the `ActivatedRouteSnapshot`.

```ts
  //...

  canActivate(routeSnapshot: ActivatedRouteSnapshot): Observable<boolean> {
    let customRedirect = routeSnapshot.data['authGuardRedirect'];
    let isUserLoggedIn = this.authService.isUserLoggedIn;

    if (!isUserLoggedIn) {
      let redirect = !!customRedirect ? customRedirect : '/unrestricted';
      this.router.navigate([redirect]);
    }

    return isUserLoggedIn;
  }

```

We modified our `canActivate` logic to redirect the user to the custom redirect route, if present.
Otherwise, just redirect to `/unrestricted` as before.

Our `AuthGuard` implementation is much more reusable now that we can optionally specify custom redirects for
individual routes.

Full code as part of a sample application can be <a href="https://github.com/kirjai/blog-code-snippets/tree/master/async-guards-redirects" target="_blank">found here</a>.
