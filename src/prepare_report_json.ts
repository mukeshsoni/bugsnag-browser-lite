import jsonStringify from "safe-json-stringify";

import { BugsnagErrorReport } from "./index";

// const REPORT_FILTER_PATHS = [
// "events.[].app",
// "events.[].metaData",
// "events.[].user",
// "events.[].breadcrumbs",
// "events.[].request",
// "events.[].device",
// ];

export function prepareReportJson(report: BugsnagErrorReport): string {
  let payload = jsonStringify(report, null);
  if (payload.length > 10e5) {
    delete report.events[0].metaData;
    report.events[0].metaData = {
      notifier: `WARNING!
Serialized payload was ${payload.length / 10e5}MB (limit = 1MB)
metaData was removed`,
    };
    payload = jsonStringify(report, null);
    if (payload.length > 10e5) throw new Error("payload exceeded 1MB limit");
  }
  return payload;
}
