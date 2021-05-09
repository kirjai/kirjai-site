---
layout: post
tags: ['angular', 'post']
title: Accessing child component's class with ViewChild
permalink: /accessing-child-component-with-viewchild/
date: 2017-01-10
---

Most communication between parent and child components in Angular happens with `Input` and `Output` bindings. However, in more complex cases you might want a direct access to a child component's class instance.
We can achieve exactly that using a powerful `ViewChild` decorator.

This is especially useful if you have reusable self contained components, like a modal component. Realistically, the parent component will decide when to display the modal.
One way to achieve that is by having an `isModalOpen` boolean property in the parent and pass it as an `Input` into the `ModalComponent`.

```ts
@Component({
  selector: 'app-modal-parent'
  template: `<app-modal [isOpen]="isModalOpen"></app-modal> <button (click)="isModalOpen = true">Open the modal</button>`
})
export class ModalParentComponent {
  isModalOpen = false;
}
```

However, that introduces needles state into the parent component, in the form of `isModalOpen` property.

Let's say our implementation of `ModalComponent` has an `open()` and `close()` methods.

```ts
@Component({
  selector: 'app-modal',
  template: `...`,
})
export class ModalComponent {
  open() {
    // logic to open a modal
  }
  close() {
    // logic to close a modal
  }
}
```

With this implementation, we can call `open()` from the parent component whenever we need to open the modal. However, this isn't something that can be easily fit into the standard component `Input`s and `Output`s.
Instead, we can use `ViewChild` to get access to `ModalComponent`s instance inside the `ModalParentComponent` class and call `open()` under certain conditions.

## `ViewChild`

Inside our parent component, we ask the `ViewChild` decorator to find an instance of `ModalComponent` in our component and store it in a property.

```ts
@Component({
  //...
  template: `<app-modal></app-modal> <button (click)="openModal()"></button>`,
})
export class ModalParentComponent {
  @ViewChild(ModalComponent) modalInstance
  openModal() {
    this.modalInstance.open()
  }
}
```

Now, we can control the `ModalComponent` directly without any state.
