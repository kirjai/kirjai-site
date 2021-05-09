---
layout: post
tags: ['angular', 'post']
title: Testing Angular forms with dispatchEvent
permalink: /testing-angular-forms-with-dispatchevent/index.html
date: 2016-12-08
---

When testing your Angular applications, make sure you don't forget to test your forms as well. But obviously forms, especially template-driven forms (`ngModel`), are not something
you would write unit tests for. Instead, you want to write [shallow component tests](https://angular.io/docs/ts/latest/guide/testing.html#!#shallow-component-test), where you get access
to native DOM elements that make up your application. Users will interact with your forms by typing, focusing, clicking, etc. so you want to trigger all those events in your tests as well.

## Shallow test setup

Here's the setup for writing shallow component tests for `MyComponent`:

```ts
describe('Component', () => {
  let fixture: ComponentFixture<MyComponent>
  let component: MyComponent
  let debugElement: DebugElement

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [MyComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(MyComponent)
    component = fixture.componentInstance
    debugElement = fixture.debugElement
  })

  // Specs
})
```

Now, in `MyComponent`'s template we have an input element with an `ngModel` and a `blur` event handler.

```html
<input
  id="myInput"
  type="text"
  [(ngModel)]="myInputValue"
  (blur)="someMethod()"
/>
```

Potential tests that we may write for this input element is testing that the `myInputValue` binding is valid and that `someMethod` is called when the input loses focus.
In the test setup, we have already defined a `debugElement` variable that will allow us to query the HTML of our component in order to get ahold of our input element.

```ts
// this spec isn't finished yet. no assertion.
it('should bind the input to the correct property', () => {
  // first round of change detection
  fixture.detectChanges()
  // get ahold of the input
  let input = debugElement.query(By.css('#myInput'))
  let inputElement = input.nativeElement
})
```

> Note: it's important to remember to trigger the initial round of change detection before trying to query the `debugElement`. Component's HTML only gets rendered out, after the first
> round of change detection.

## `.dispatchEvent()`

Now we have access to the native `input` element, which means we can set its value and assert that the two-way binding between `myInputValue` in the component class and the input value is valid.

**However**, simply assigning a string to input's `value` property is not enough, as that will not trigger a change event. Considering that `ngModel` acts as an event listener, we need to
trigger an `"input"` event ourselves, using `.dispatchEvent`. We do that after we've assigned our input a value.

```ts
it('should bind the input to the correct property', () => {
  // first round of change detection
  fixture.detectChanges()

  // get ahold of the input
  let input = debugElement.query(By.css('#myInput'))
  let inputElement = input.nativeElement

  //set input value
  inputElement.value = 'test value'
  inputElement.dispatchEvent(new Event('input'))

  expect(component.myInputValue).toBe('test value')
})
```

Which results in a passing test.

`.dispatchEvent` has nothing to do with Angular, and is [part of Web API](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent).
With that in mind, we can now write our second test that asserts that `someMethod` is called when the input loses focus.

```ts
it('should do something on blur', () => {
  spyOn(component, 'someMethod')
  // first round of change detection
  fixture.detectChanges()

  // get ahold of the input
  let input = debugElement.query(By.css('#myInput'))
  let inputElement = input.nativeElement

  //set input value
  inputElement.dispatchEvent(new Event('blur'))

  expect(component.someMethod).toHaveBeenCalled()
})
```

So as you can see, we can trigger any event listeners on our elements with `.dispatchEvent`.

> [Here](https://developer.mozilla.org/en-US/docs/Web/Events) is a list of all Javascript events.

> Code example available [here](https://github.com/kirjai/blog-code-snippets/tree/master/testing-form-inputs).
