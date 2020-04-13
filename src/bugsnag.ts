// import { ErrorBoundary } from "./bugsnag_react";
import { BugsnagClient } from "./bugsnag_client";
export { BugsnagClient } from "./bugsnag_client";
export { BugsnagErrorReport, NotifiableError } from "./types";

export default function bugsnag(apiKey: string) {
  return new BugsnagClient(apiKey);
}
