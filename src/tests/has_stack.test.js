import { hasStack } from "../has_stack.ts";

test("hasStack", () => {
  expect(hasStack({ stack: "blah" })).toBe(true);
  expect(hasStack({ stacktrace: "blah" })).toBe(true);
});

