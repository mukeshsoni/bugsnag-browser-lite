[ ] - Add a react ErrorBoundary component
[ ] - Move some stuff, like getDeviceInfo, to optional stuff. Users can use them
optionally, or may be call those functions themselves when passing options in
`init` function. We can add an `options` argument to `init` function. Which will
mean that if they don't want that information, they don't get that code in their
bundle.
[ ] - add `import-size` to check for bundle sizes of the output - https://www.npmjs.com/package/import-size
[ ] - add `husky` and `lint-staged` to catch stuff before commits. Also, add
running tests to `lint-staged`.
[X] - add `rimraf` to clean up dist file before the next build
[ ] - Think about ways to reduce the code size. Maybe write a simple
error-stack-parser version. `error-stack-parser` and `stackframe` (used inside
`error-stack-parser`) are make up 60% of the library size right now.
