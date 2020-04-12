import { NotifiableError } from "./bugsnag";

export function hasStack(error: NotifiableError) {
  return (
    !!error &&
    (!!error.stack || !!error.stacktrace || !!error["opera#sourceloc"]) &&
    typeof (error.stack || error.stacktrace || error["opera#sourceloc"]) ===
      "string" &&
    error.stack !== `${error.name}: ${error.message}`
  );
}

