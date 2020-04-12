bugsnag-browser-lite is a light weight replacement for [@bugsnag/js](https://github.com/bugsnag/bugsnag-js). 

`@bugsnag/js` does a lot of stuff and works in both browser and nodejs. This
makes the library very large. I made `bugsnag-browser-lite` which can be used
only in the browser and is significantly smaller than `@bugsnag/js`. 

This library does not yet have auto notification on unhandled errors and exceptions.

### Installation

```
npm install bugsnag-browser-lite -save-dev
```

### Usage
```
import bugsnag from 'bugsnag-browser-lite';

const bugsnagClient = bugsnag('your-bugsnag-api-key')

// on error, call notify
bugsnagClient.notify(error, { metaData: additionalInformation });
```

Catching and logging all unhandled exceptions in react.

```
import bugsnag, { ErrorBoundary } from 'bugsnag-browser-lite';

const bugsnagClient = bugsnag('your-bugsnag-api-key')

<ErrorBoundary bugsnagClient={bugsnagClient}> >
  <YourApp />
</ErrorBoundary>
```

It's written in typescript and the types are published with the package.
