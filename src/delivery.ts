import { BugsnagErrorReport, Config } from "./types";
import { isoDate } from "./iso_date";
import { prepareReportJson } from "./prepare_report_json";

export function sendReport(
  config: Config,
  report: BugsnagErrorReport,
  cb = () => {}
) {
  if (typeof XMLHttpRequest !== "undefined") {
    try {
      const url = config.notifyUrl;
      const req = new XMLHttpRequest();
      req.onreadystatechange = function() {
        if (req.readyState === XMLHttpRequest.DONE) cb();
      };
      req.open("POST", url);
      req.setRequestHeader("Content-Type", "application/json");
      req.setRequestHeader("Bugsnag-Api-Key", config.apiKey || "");
      req.setRequestHeader("Bugsnag-Payload-Version", "5");
      req.setRequestHeader("Bugsnag-Sent-At", isoDate());
      req.send(prepareReportJson(report));
    } catch (e) {
      console.error(e);
    }
  } else {
    console.error("Bugsnag logger: Could not find XMLHttpRequest");
  }
}
