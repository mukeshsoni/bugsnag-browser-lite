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
import { init } from 'bugsnag-browser-lite';

const bugsnagClient = init('your-bugsnag-api-key')

// on error, call notify
bugsnagClient.notify(error, { metaData: additionalInformation });
```

It's written in typescript and the types are published with the package.
