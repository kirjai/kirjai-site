---
layout: post
tags: ['angular', 'post']
title: Validation for reactive forms in Angular
permalink: /validation-model-driven-forms-ng2/
date: 2016-09-30
---

As you might know, there are two prominent ways of creating forms in Angular 2+: **Template-driven** forms and Model-driven or **Reactive forms**. **Template-driven** forms definitely have a stronger correlation to how forms are created in AngularJS 1.x, in that they mostly rely on you declaring your form logic in the HTML template. **Reactive** forms however, are created from a configuration that you specify in your Component class.

In this post we will be going over the Reactive form definition, how to make use of validators as well as writing your own custom validators and providing users with good error messages upon validation.

## Set up

Firstly, let's create a simple component and its corresponding template.

```ts
// email-form.component.ts
import { Component } from '@angular/core'

@Component({
  selector: 'app-email-form',
  templateUrl: 'email-form.component.html',
})
export class EmailForm {}
```

```html
<!-- email-form.component.html -->

<form>
  <h2>Email Form</h2>
  <label for="email">Email:</label>
  <input id="email" type="text" />

  <button type="submit">Submit</button>
</form>
```

This creates a very basic form that doesn't do anything yet. So the next step is to write up our component and the template.

## Enter the `FormBuilder`

The `FormBuilder` is part of the `@angular/forms` module that we will be using to create our Reactive form.

In order to use the `FormBuilder`, we need to import it's type into our component first.

```ts
// email-form.component.ts
import { FormBuilder } from '@angular/forms'
```

Next we need to actually inject the `FormBuilder` into our component. We do that as we would with any service - in our constructor.

```ts
// email-form.component.ts
export class EmailForm {
  constructor(private builder: FormBuilder) {}
}
```

Now we can use the `FormBuilder` by referencing it by its the private variable name `builder`, inside our component. Great! So we can now create our form configuration. Let me first provide an example, which I will explain in more detail afterwards.

```ts

// email-form.component.ts
//...

constructor (private builder: FormBuilder) {
  this.emailForm = this.builder.group({})
}

```

We've created a new property on our class - `emailForm` and assigned a new `group` to it, created by the builder. `FormBuilder` helps us by creating a `FormGroup` object that will hold our `FormControl`s (more on that later). We will specify individual `FormControl`s that correspond to our input fields by passing them into the this new `FormGroup` we just created.

**However**, we assigned the group to a property we haven't defined yet, so at the top of our `EmailForm` class we need to define the new `emailForm` property. One thing to note is that the name of the property `emailForm` can be anything, as with any variable, it is not mapped to anything yet at this point.

```ts
// email-form.component.ts
export class EmailForm {
  emailForm: FormGroup

  //...
}
```

## `FormControl` and `formControlName`

`FormControl` is an Angular class, and we can map instances of this class to form fields. Without `FormControl`s, we can't have validation, or essentially provide _any_ communication between the HTML form and the component class (unless we use `ngModel`, of course).

So since with reactive forms we specify the form configuration upfront, we need to specify controls that the form will be mapped to. We need to do that inside the form configuration object (our `emailForm` property) which we are passing to the `this.builder.group()` function call inside our constructor.

```ts

// email-form.component.ts
//...

constructor (private builder: FormBuilder) {
  this.emailForm = this.builder.group({
    email: ['']
  })
}

```

What exactly happens here? Well, we are passing a `FormControl` object into our `emailForm`. As mentioned earlier, a `FormControl` corresponds to a form field. In our case we have an email input field, and here we are specifying its `FormControl` object. As with any object, it consists of key-value pairs, and here our new `FormControl` object has the key of `email` and value of an array. For now our array value contains just one element, an empty string. This first element in the array represents the default value for our field, and, since we don't want a default value, we are just passing in an empty string.

That's great and all, but how can we map this to our HTML form in the template? There's only two things we need to do for that.

```html
<!-- email-form.component.html -->

<form [formGroup]="emailForm">
  <h2>Email Form</h2>
  <label for="email">Email:</label>
  <input id="email" type="text" formControlName="email" />

  <button type="submit">Submit</button>
</form>
```

We have added a new directive `formGroup` to our `form` element, and an `formControlName` to the email input field. The value we give to the `formGroup` corresponds to the name of our form control group, created by calling `builder.group`. And the value we give to `formControlName` is a `FormControl` instance that we have passed as part of our form configuration object.

Now the form we specified in the component class should be mapped to the HTML form, but how can we make sure that it actually is? We can display the value of the whole form control group in our template using the usual Angular 2+ syntax, below our form.

```html
<!-- email-form.component.html -->

<!-- ... -->

<pre> {% raw %}{{ emailForm.value | json }} {% endraw %}</pre>
```

Try typing into the text field inside your form and see the value of `email` change inside the `emailForm` object.

## Validation

Now it's time to get creative with our form and make it more useful. Our goal is to make sure that the user has typed _something_ into the input field before submitting the form, i.e. making the field required.

We can use the usual standard HTML validators, like `required`, `minlength` etc. inside our HTML, but let's add validators to the form inside our form configuration object.

We will want to use `Validators`, a class we need to import from `@angular/forms` module.

```ts
// email-form.component.ts

import { FormBuilder, Validators } from '@angular/forms'

//...
```

In order to make the email input field required, we need to add the 'required' validator to where we are defining a new `FormControl` - `email`. The validator we want applied to a control is provided as the second element inside our Control array value:

```ts

// email-form.component.ts
//...
constructor(private builder: FormBuilder){
  this.emailForm = this.builder.group({
    email: ['', Validators.required]
  })
}

```

As you can see, all we need to do to add a validator for a form control is pass it inside the array. **But**, we can only pass one `Validator` and one `AsyncValidator` inside that array. How do we add more validators to the same control then? By using `Validators.compose()`.

I'll show you how to use `Validators.compose()` a little later on in this post.

We don't need to modify anything inside our template in order to make the validation work. To confirm that our validation is actually working, we can just change the binding inside the `<pre>` tags in our template, to the following.

```html
<!-- email-form.component.html -->

<pre>{% raw %} {{ emailForm.controls['email'].valid }} {% endraw %}</pre>
```

This also demonstrates one way we can access specific `Control` objects that are part of our form, from within the template. However we will explore a better and less verbose method a little bit later.

## Custom Validators

<!-- On top of using Angular's built in validators, you are able to write your own custom validators as well. So for our example, let's write a simple  validator that checks that the first letter typed into the input field is the letter `a`. -->

In a real world use case, you would probably want to validate an email input field with a regular expression or min-length, etc. You could simply use the existing Angular validators for that, however we want to explore how to write _our own_ validators

A custom validator is essentially just a function that returns `null` if you want the input value to pass validation, or anything else if you want the validation to fail. Let's declare that function next, outside of our constructor.

```ts

// email-form.component.ts
//...

checkIfA(fieldControl: FormControl) {
  return fieldControl.value[0] === 'a' ? null : { notA: true };
}

```

As you can see, the validator function receives an instance of a form control that it going to apply validation to. We can use that instance to access the current value of the control field.

In our example we inspect the current value of the control field and verify it's first letter. If the first letter is `a` then we return `null`, indicating that it passed validation. However if the first letter is _not_ an `a` then we return an error object, which indicates that the validation failed.

The reason for returning an error object for an invalid field is so that we can provide the user with descriptive feedback as to why validation failed. We will explore just how to do that in the next section.

Now that we have our custom validation function, let's apply that to our email control.

```ts

// email-form.component.ts
//...

constructor(private builder: FormBuilder) {
  this.emailForm = this.builder.group({
    email: ['', Validators.compose([Validators.required, this.checkIfA])]
  })
}

//...

```

Instead of passing just `Validators.required` inside our array for the email control (as the second element to our array), we are now passing the return value of a `Validators.compose()` function, which takes an array of any validators we want to use. In this case, we want to use both the `Validators.required` built-in validator, as well as our custom `this.checkIfA` validator.

Whatever we type into the input field now needs to pass _both_ of these validations for the field to be valid - exactly what we want!

## Displaying validation errors

As you might have guessed, we can inspect the `.valid` property inside our template to check if a field control is valid or not, and conditionally trigger HTML tags depending on the value. Let's explore that in more detail.

In AngularJS 1.x we had a helpful feature - `ngMessages` that we could use to more easily display helpful messages to the user and explain why their form is invalid. Let's see how we can easily recreate `ngMessages` in Angular 2+.

In the previous section I provided a little snippet that we can use in our HTML template to see output the validity of our email input field. Admittedly that was quite a verbose way of doing it and - if we want to keep our templates clean and easy to read - it would be far better use the following approach.

Inside our component class we will define a property for our email control, which we can easily access from inside our template.

```ts

// email-form.component.ts

//...

constructor(private builder: FormBuilder){
  this.emailForm = this.builder.group({
    email: ['', Validators.compose([Validators.required, this.checkIfA])]
  })

  // This is our new property, which we will access from the template
  this.email = this.emailForm.controls['email'];
}

//...

```

The idea here is that we write the same verbose way of accessing that control only once, so that we can reference it easily in other places.

**However**, once again, we are assigning a value to a property on our `EmailForm` class, that doesn't exist yet. Let's add this property at the top of our class definition.

```ts
// email-form.component.ts

export class EmailForm {
  emailForm: ControlGroup
  email: AbstractControl
  //...
}
```

All we did was create a new property 'email' of type 'AbstractControl', which is an Angular class.

Now we can access the control object for the email field inside our template more easily. Let's replace our previous verbose output with the new one.

```html
<!-- email-form.component.html -->

<!-- before -->

<pre>{% raw %} {{ emailForm.controls['email'].valid }} {% endraw %}</pre>

<!-- after -->

<pre>{% raw %} {{ email.valid }} {% endraw %}</pre>
```

It is a little easier to check the validity of our email field now. Let's get on to displaying error messages.

The first thing we'll do is add a paragraph tag `<p>` with an error message saying that the email field is invalid.

```html
<!-- email-form.component.html -->

<!-- ... -->
<label for="email">Email:</label>
<input id="email" type="text" formControlName="email" />

<p *ngIf="!email.valid">Email is invalid</p>

<!-- ... -->
```

We are using a structural directive `ngIf` (provided by Angular 2+) to conditionally display the error message. However, even though it is better than showing nothing, the message by itself is not really descriptive enough. Considering our tricky validation (where the first letter needs to be an `a`) we definitely need more descriptive error messages. So here's a better solution:

```html
<!-- email-form.component.html -->

<!-- ... -->
<label for="email">Email:</label>
<input id="email" type="text" formControlName="email" />

<div *ngIf="!email.valid">
  <p *ngIf="email.hasError('required')">Email is required</p>
  <p *ngIf="email.hasError('notA')">
    First letter of the email needs to be an a
  </p>
</div>

<!-- ... -->
```

The error messages are now being triggered conditionally, depending on which validations are failing. At first, both messages are displayed, however try typing anything that doesn't begin with an `a` and the `Email is required` error message will disappear, and the other one will stay. That's exactly what we want.

We used a `hasError` method on our email field control object to check if the email field has specific errors. The `notA` error that we are checking for in the second error message is the same error that we are passing inside our custom validator that we wrote.

```ts
// email-form.component.ts

return fieldControl.value[0] === 'a' ? null : { notA: true } // <-
```

One final enhancement I would like to add to this form is to not show the errors initially, but to only show them (if appropriate) once the user has interacted with the email field. This is a common practice and is considered a good user experience.

With our current set up, it is very easy to add that feature in.

```html
<!-- email-form.component.html -->

<!-- ... -->

<div *ngIf="!email.valid && email.dirty">
  <p *ngIf="email.hasError('required')">Email is required</p>
  <p *ngIf="email.hasError('notA')">
    First letter of the email needs to be an a
  </p>
</div>
<!-- ... -->
```

All we need to do is added an `&&` to our `ngIf` directive, which checks if the email field has been interacted with, or `dirty`.
