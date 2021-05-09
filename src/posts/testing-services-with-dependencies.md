---
layout: post
tags: ['angular', 'post']
title: Testing Angular services with dependencies
permalink: /testing-angular-services-with-dependencies/index.html
date: 2016-11-09
---

Angular services can be tested in a couple of different ways, two most
prominent being isolated tests and using the [Angular `TestBed`](https://angular.io/docs/ts/latest/api/core/testing/index/TestBed-class.html).
However, things get interesting when the service under test has dependencies (injected using Angular's dependency injection).

## Isolated tests

In short, tests are considered isolated when a fresh instance of your service class is created before each test, like so:

```ts
let serviceUnderTest = new MyService()
```

Resulting in the following most basic test:

```ts
import { MyService } from './my.service'

describe('Service: My: isolated', () => {
  let service: MyService

  beforeEach(() => {
    service = new MyService()
  })

  it('should create an instance', () => {
    expect(service).toBeDefined()
  })
})
```

You can find more information on isolated service unit tests in the [official Angular testing guide](https://angular.io/docs/ts/latest/guide/testing.html#!#isolated-service-tests).

## `TestBed` tests

When writing `TestBed` tests, you need to define / configure a testing module before each test:

```ts
TestBed.configureTestingModule({
  providers: [MyService],
})
```

The object we pass into the `configureTestingModule` method follows the same structure as the `@NgModule` object
that we use when defining Angular modules within our application.

The simplest test we can write, if we are using the `TestBed` would look something like this:

```ts
import { MyService } from './my.service'

describe('Service: My: TestBed', () => {
  let service: MyService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyService],
    })

    service = TestBed.get(MyService)
  })

  it('should create an instance', () => {
    expect(service).toBeDefined()
  })
})
```

As you can see, the `TestBed` tests require a bit more setup up front, but individual specs (`it`s) are not
any different. So why would you ever use the `TestBed` for your service tests? There are advantages
to that approach if your service has dependencies.

## Service Dependencies

As soon as you add even one dependency to your service, you need to also add it to your tests.
In case of isolated tests, you will need to pass an instance of an injectable dependency class into the
constructor of your service instantiation.

```ts
let serviceUnderTest = new MyService(new MyServiceDependency())
```

But this approach would only work if `MyServiceDependency` does not have any dependencies itself.
If it does, you would obviously need to pass them in as well, and so on and so forth. This can
get out of hand really quickly.

With this approach it is also harder to mock and stub dependencies, which is something we
would definitely prefer to do, as we only want to test a specific service, not the dependencies.

Let's see if we can solve these problems in the `TestBed` testing approach.

Our `TestBed` test is failing, with a `No Provider for MyServiceDependency!` message, which indicates
that we are requesting an intance of `MyServiceDependency` in our `MyService` class, but we never
added `MyServiceDependency` to any `providers` of any known modules.
Let's look at how we would add a dependency to our `TestBed` tests in the most basic way.

```ts
TestBed.configureTestingModule({
  providers: [MyService, MyServiceDependency],
})
```

That gets rid of the error, but we are still faced with the same problems as we did with isolated tests:

- If `MyServiceDependency` has dependencies - we would have to add them to the `providers` as well.
- We are injecting an actual instance of `MyServiceDependency` and not a mock / stub.

The solution to both of these points would be to create a stub of `MyServiceDependency` and inject it
instead of the real `MyServiceDependency`. Something we can do very easily with the `TestBed` approach.

## Stubbing a dependency

First, we need to create a stub class of our `MyServiceDependency` class that we will be injecting
instead of the real `MyServiceDependency` class.

```ts
class MyServiceDependencyStub {}
```

Even if the class is blank, i.e. has no methods or properties - we should have no problems
injecting it instead of the real service, which we would do in our testing module configuration.

```ts
TestBed.configureTestingModule({
  providers: [
    MyService,
    { provide: MyServiceDependency, useClass: MyServiceDependencyStub },
  ],
})
```

Our test is now passing again.

As you write tests for your service, you will sooner or later encounter some code that uses the dependency,
like calling a method or accessing a property on it, which will require you to add it to your stub.

For example, let's say we are writing a test for the following `doSomething` method on `MyService`:

```ts
//...

@Injectable()
class MyService {
  constructor(private myServiceDependency: MyServiceDependency) {}

  doSomething() {
    this.myServiceDependency.getSomeValue()
  }
}
```

Potential test for this method would be checking that `getSomeValue` method is called on `myServiceDependency`.
However, because we are injecting a stub into our testing module, we need to make sure that when
`doSomething` will be called within our tests - `getSomeValue` method is present on the stub. Simply
adding it to our stub will do.

```ts
class MyServiceDependencyStub {
  getSomeValue() {}
}
```

Now, we can easily set up a spy on `getSomeValue` and assert that it was actually called during the
execution of `doSomething`, resulting in the following full spec file:

```ts

import { MyService } from './my.service';
import { MyServiceDependency } from './my-service-dependency';

class MyServiceDependencyStub {
  getSomeValue() {}
}

describe('Service: My: TestBed', () => {
  let service: MyService;
  let myServiceDependency: MyServiceDependency;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MyService,
        { provide: MyServiceDependency, useClass: MyServiceDependencyStub }
      ]
    });

    service = TestBed.get(MyService);
    myServiceDependency = TestBed.get(MyServiceDependency);
  });

  it('should create an instance', () => {
    expect(service).toBeDefined();
  });

  it('should do something'), () => {
    spyOn(myServiceDependency, 'getSomeValue');
    service.doSomething();
    expect(myServiceDependency.getSomeValue).toHaveBeenCalled();
  });
});

```

> In case you ever forget to add a method to a stub, and then try to spy on that method, you will be
> greeted with an `Error: getSomeValue() method does not exist` error.

Sample application demonstrating these concepts in a more realistic scenario can be found
<a href="https://github.com/kirjai/blog-code-snippets/tree/master/testing-services-with-deps" target="_blank">here</a>
