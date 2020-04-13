import { sendReport } from "./delivery";
import { getStacktrace } from "./get_stack_trace";
import { detectDeviceInfo } from "./device_info";

import { UserInfo, NotifiableError, Severity, SeverityReason } from "./types";

interface Options {
  metaData?: object;
  user?: UserInfo;
  unhandled?: boolean;
  severity?: Severity;
  severityReason?: SeverityReason;
}

// Javascript Error object contains a `name` property which gives the type of
// error. E.g. SyntaxError, TypeError, RangeError, EvalError
// User can create their own custom error too and give it a custom name
export function prepareBugsnagReport(
  apiKey: string,
  error: NotifiableError,
  opts?: Options
) {
  return {
    apiKey,
    payloadVersion: 5,
    notifier: {
      name: "saltside web",
      version: "1.0.0",
      url: "https://saltside.se/",
    },
    events: [
      {
        exceptions: [
          {
            errorClass: error.name || "[no errorr name]",
            message: error.message || "[no errror message]",
            stacktrace: getStacktrace(error),
          },
        ],
        device: detectDeviceInfo(),
        app: {
          releaseStage: "development",
        },
        ...opts,
      },
    ],
  };
}

export const notifyUrl = "https://notify.bugsnag.com";

export class BugsnagClient {
  config: { apiKey: string; notifyUrl: string };
  constructor(apiKey: string) {
    this.config = {
      apiKey,
      notifyUrl,
    };
  }

  notify(error: NotifiableError, opts?: Options) {
    sendReport(
      this.config,
      prepareBugsnagReport(this.config.apiKey, error, opts)
    );
  }
}
