---
layout: post
tags: ['react', 'post']
title: Don't overabstract your components
description: Improve your component's API by writing focused abstractions that make your components composable.
permalink: /component-abstraction/
date: 2021-05-14
---

A lot of front end developers nowadays find themselves contributing to component libraries. Component libraries usually consist of components that are reused throughout an application. Some are even used across many different applications. At some point you are tasked with adding a new component. One of the questions you should ask yourself early in the process is - "What should this component's API be?". That is first step in a process known as component API design.

What I mean by "component API" is how consumers of your component - mainly other developers - interact with it. So in the context of React - it's what props this component has.

Component API design takes some careful thought. The right API can reduce the code you have to write and maintain. At the same time, it can make your component more powerful 🤯.

## Component as a layer of abstraction

When you are creating a new component - you are, generally, aiming to abstract _something_ away. Whatever you are abstracting ends up being the component's functionality. What it does and the reason why it exists.

As with any abstraction - you are trying to strike a balance. A balance between providing some functionality, and the ability to configure said functionality. That balance is also the reason why you want to keep your abstractions as small as possible. The more functionality you are trying to fit into a single layer of abstraction - the more functionality you might have to make configurable. Something that becomes harder to do the more functionality the abstraction has.

## Children prop

When talking about a component's props - it is important not to forget the children prop. In my opinion, the children prop is underutilized in a lot of React components.

Most React developers are familiar with it, at least in the most basic use case:

```tsx
const MyButton = ({ children }) => <button>{children}</button>

const App = () => <MyButton>Click me!</MyButton>
```

Rendering the `<App />` component will result in the following HTML:

```html
<button>Click me!</button>
```

That feels pretty natural to do. After all most of HTML is written exactly like that - by nesting elements within other elements. So, the children prop allows your components to be more composable.

```html
<body>
  <header>
    <!-- ... -->
  </header>
  <main>
    <h1>Hello world</h1>
  </main>
</body>
```

In fact, a lot of common UI elements could benefit from being implemented with the children prop. One of my favorite examples to use is the HTML `<select />` element - also referred to as a dropdown.

First, let's establish what the goal of our implementation is. What are we trying to abstract? In the context of a design system - we would, most likely, want to abstract away the specifics of how the `<select />` element is styled. Styling itself is beside the point of this post, so I'll resort to styling with CSS classes - nothing fancy.

## Basic select implementation

Tasked with implementing a component that wraps the native `<select />` element, we might start off with the following:

```tsx
interface Props {
  options: {
    label: string
    value: string
  }[]
  value: string
  onChange: (value: string) => void
}

const Select = ({ options, onChange, value }: Props) => {
  return (
    <select onChange={onChange} value={value} className="...">
      {options.map(({ label, value }) => (
        <option value={value} className="...">
          {label}
        </option>
      ))}
    </select>
  )
}
```

That you then use like:

```tsx
const App = () => <Select
    value={'abc'}
    options={[
      {
        label: 'ABC',
        value: 'abc
      },
      {
        label: 'XYZ',
        value: 'xyz'
      }
    ]}
    onChange={/* ... */}
  />
```

I have seen a lot implementations of this functionality, similar to the one above. Admittedly, over the years, I have also written few of these myself. This seems like a pretty natural abstraction, so it's easy to reach for it first. Yet, looking at this implementation now, it is too restrictive and not very composable, if you ask me.

One of the main problems with this implementation is that the component tries to do too much. It not only abstracts away the styling - it also abstracts away the HTML via a custom data structure (the `options` prop). When an abstraction tries to do too much - you might have to add ways to customize different aspects of that abstraction. It is not hard to imagine additional props that might have to be added to the `<option />` element in the future. Not to say that there aren't ways of implementing new requirements with this basic approach. However, an alternative implementation that I am proposing sidesteps the issue altogether.

## Composable select implementation

```tsx
import { ReactNode, HTMLProps } from 'react'

interface SelectProps extends HTMLProps<HTMLSelectElement> {
  children: ReactNode
}

const Select = ({ children, ...nativeProps }: SelectProps) => (
  <select {...nativeProps} className="...">
    {children}
  </select>
)

interface OptionProps extends HTMLProps<HTMLOptionElement> {
  children: ReactNode
}

const Option = ({ children, ...nativeProps }: OptionProps) => (
  <option {...nativeProps} className="...">
    {children}
  </option>
)
```

That you then use similar to a native `<select />`:

```tsx
const App = () => (
  <Select value="abc" onChange={/* ... */}>
    <Option value="abc">ABC</Option>
    <Option value="xyz">XYZ</Option>
  </Select>
)
```

This is a much more flexible, open, and composable API.

- Each part of this dropdown is configured close to where it is used;
- consumer has full control over which `<Select />` and `<Option />` implementations to use. For example, you could have different implementations offering different functionality;
- consumer can use the full power of JSX to render `<Option />` components.

All those benefits with very little code is a win in my book.

## Shifting responsibility

There are noticeable differences between the two implementations. One, is that in the composable implementation, some responsibility has been shifted to the consumer. Generally, that is a good thing, but only to an extent. What you want to avoid is having an incomplete abstraction - leaving it up to the consumer to "finish".

For example, let's say that we want to apply a custom CSS class to the `<select />` element. You want to do that conditionally, based on a value of another prop. We also want that same class to appear on each `<option />` element as well. Leaving it up to the consumer to do that isn't a great idea - it should be handled by our abstraction instead.

However, it might not be immediately clear how to do that, since our `<Select />` component doesn't have direct access to the `<Option />` components.

## Communication between components

There are a few different ways how a parent component can pass values to its children. One of the ways is using the React Context API. It allows parent components to communicate with children components without having a direct reference to them.

Going back to our example - we can wrap all `<Select />` component's children in a context provider. `<Option />` components can then read values from that context, and use them to perform any work they have to. All without the consumer having to do any extra work.
What we'll do is we'll add a new prop to `<Select />` called `variant`. If its value is equal to `'primary'` - we'll apply a CSS class `'primary-variant'` to the `<select />` and `<option />` elements.

```tsx
import { ReactNode, HTMLProps, createContext, useContext } from 'react'

const SelectContext = createContext<{
  additionalClasses: string
}>(null!)

interface SelectProps extends HTMLProps<HTMLSelectElement> {
  children: ReactNode
  variant: string
}

const Select = ({ children, variant, ...nativeProps }: SelectProps) => {
  const additionalClasses = variant === 'primary' ? 'primary-variant' : ''
  return (
    <select {...nativeProps} className={`${additionalClasses} ...`}>
      <SelectContext.Provider value={% raw %}{{ additionalClasses }} {% endraw %}>
        {children}
      </SelectContext.Provider>
    </select>
  )
}

interface OptionProps extends HTMLProps<HTMLOptionElement> {
  children: ReactNode
}

const Option = ({ children, ...nativeProps }: OptionProps) => {
  const { additionalClasses } = useContext(SelectProps);
  return (
    <option {...nativeProps} className={`${additionalClasses} ...`}>
      {children}
    </option>
  )
}
```

Using the React Context API - we were able to pass `additionalClasses` value from the parent `<Select />` component, to its children `<Option />` components.

As you can see, we are still able to implement the dropdown UI element as a single unit. Even though it is split across multiple components.

## Trade-offs

The composable way of implementing UI elements is not a one-size-fits-all solution. As most things, it comes with some trade-offs.

### More opportunity for misconfiguration

This approach shifts some responsibility onto the consumer of a component. With that responsibility, there are more opportunities for a consumer to misconfigure something. However, in my personal view, it should not be that big of a concern.

First, there are often plenty of ways to misconfigure functionality in a non - composable implementation as well. In a composable implementation, configuration is defined closer to where it is used. Meaning that functionality of each `<option />` element is defined on the `<Option />` component. As opposed to being defined on the parent `<Select />`, as in the original / basic implementation. Because of that, I would argue that misconfiguration is easier to identify when it occurs.

Second, configuration of UI elements is usually done during development and it is done statically. As opposed to dynamically at runtime. That increases your chances of noticing that something is misconfigured while you are still developing it.

### Results in more typing

Similar to the point above - this approach often results in more typing for the consumer. But one way to look at it is that you are trading implicit behaviour for an explicit one. In my experience, explicit implementations are easier to maintain and debug. Additionally, it is important to remember that in case extra typing is a problem - you are free to abstract it away into another layer of abstraction. Composable implementation gives you a foundation. You can build other abstractions on top of it.

In the `<Select />` component example, we have decoupled the styling abstraction from a structural abstraction. Now that they are decoupled, you are able to implement either of those abstractions independently of one another. You can then combine them in any way that your use case calls for. That is a strong point for composability - you are able to make that decision for each use case independently. This approach tends to results in smaller and thus more focused abstractions.

Remember, you can always abstract at the consumer level, whereas the more configurable you make an abstraction - the higher the maintenance burden, as that code becomes more ... well, abstract.

### Lack of type safety

As far as I know, there is currently no way to effectively type-check children of a component. Meaning that, you cannot type-check that a specific component was provided in the children prop.

## Conclusion

My advice is to approach component API design from the perspective of the consumer first. Using that as a starting point for iterating over the API. Having said that, the first API design that comes to your mind might not be the right one. How do you know? Take inspiration from existing component libraries, like [Reach UI](https://reach.tech/), [Material UI](https://material-ui.com/), [React Bootstrap](https://react-bootstrap.github.io/), [Ant Design](https://ant.design) to name a few. There is a lot of overlap in problems a lot of us are solving, after all.

Finally, if I find myself rendering components and elements from a configuration object - I take a step back. I re-evaluate whether the problem I am solving could be solved in a more composable and open way.
