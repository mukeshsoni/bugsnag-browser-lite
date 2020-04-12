import { StackFrame } from "error-stack-parser";
import ErrorStackParser from "error-stack-parser";

import { hasStack } from "./has_stack";
import { BugsnagStackFrame, NotifiableError } from "./bugsnag";

function normaliseFunctionName(name?: string) {
  if (name !== undefined) {
    return /^global code$/i.test(name) ? "global code" : name;
  } else {
    return name;
  }
}

// takes a stacktrace.js style stackframe (https://github.com/stacktracejs/stackframe)
// and returns a Bugsnag compatible stackframe (https://docs.bugsnag.com/api/error-reporting/#json-payload)
function formatStackframe(frame: StackFrame): BugsnagStackFrame {
  const f: BugsnagStackFrame = {
    file: frame.fileName,
    method: normaliseFunctionName(frame.functionName),
    lineNumber: frame.lineNumber,
    columnNumber: frame.columnNumber,
  } as BugsnagStackFrame;

  // Some instances result in no file:
  // - calling notify() from chrome's terminal results in no file/method.
  // - non-error exception thrown from global code in FF
  // This adds one.
  if (f.lineNumber && f.lineNumber > -1 && !f.file && !f.method) {
    f.file = "global code";
  }

  return f;
}

export function getStacktrace(
  error: NotifiableError
): Array<BugsnagStackFrame> {
  if (hasStack(error)) {
    return ErrorStackParser.parse(error).map(formatStackframe);
  }

  return [];
}
