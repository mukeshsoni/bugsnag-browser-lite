import { sendReport } from "./delivery";
// import { ErrorBoundary } from "./bugsnag_react";
import { detectDeviceInfo } from "./device_info";
import { getStacktrace } from "./get_stack_trace";

// not sure if the notifier can be non-bugsnag thing
// bugsnag-js has notifier name as Bugsnag JavaScript
interface Notifier {
  name: string;
  version: string;
  url: string;
}

interface UserInfo {
  id: string;
  name?: string;
  email?: string;
}

interface AppInfo {
  id?: string;
  version?: string;
  versionCode?: string;
  bundleVersion?: string;
  codeBundleId?: string;
  buildUUID?: string;
  releaseStage?: string;
  type?: string;
  dsymUUIDs?: Array<string>;
  duration?: number;
  durationInForeground?: boolean;
  inForeground?: boolean;
  binaryArch?: "x86" | "x86_64" | "arm32" | "arm64";
}

// The time at which the error occurred, in ISO 8601 format.
// E.g. 2018-08-07T10:16:34.564Z
type TimeString = string;

// Information about the computer/device running the app.
export interface DeviceInfo {
  // The hostname of the server running your code, if applicable.
  hostname?: string;
  id?: string;
  // manufacturer of the device. E.g. - samsung
  manufacturer?: string;
  // e.g. Nexus 6
  model?: string;
  modelNumber?: string;
  osName?: string;
  osVersion?: string;
  language?: string;
  userAgent?: string;
  freeMemory?: number;
  totalMemory?: number;
  freeDisk?: number;
  browserName?: string;
  browserVersion?: string;
  jailbroken?: boolean;
  orientation?: "portrait" | "landscape";
  time?: TimeString;
}

// interface SessionInfo {
// id: string;
// startedAt: TimeString;
// // Details of the number of handled and unhandled events that have occurred
// // so far in this session.
// events: {
// handled: number;
// unhandled: number;
// };
// }

export interface BugsnagStackFrame {
  file?: string;
  lineNumber?: number;
  columnNumber?: number;
  method?: string;
  inProject?: boolean;
  // The code in this file surrounding this line. This is an object containing
  // key value pairs where each key is a line number and each value is the code
  // from that line. You can include up to three lines on either side of the
  // line where the error occurred. These will be displayed on the bugsnag
  // dashboard when you expand that line.
  code?: {
    [key: string]: string;
  };
}

interface Exception {
  errorClass: string;
  message?: string;
  stacktrace: Array<BugsnagStackFrame>;
  type?: "browserjs" | "nodejs";
}

type BreadcrumbType =
  | "navigation"
  | "request"
  | "process"
  | "log"
  | "user"
  | "state"
  | "error"
  | "manual";

interface Breadcrumb {
  timestamp: TimeString;
  name: string;
  type: BreadcrumbType;
}

interface Thread {
  id: string;
  name: string;
  errorReportingThread: boolean;
  stacktrace: Array<BugsnagStackFrame>;
  type: "cocoa" | "android" | "browserjs";
}

type Severity = "error" | "warning" | "info";

interface Event {
  exceptions: Array<Exception>;
  breadcrumbs?: Array<Breadcrumb>;
  // Details about the web request from the client that experienced the error,
  // if relevant. To display custom request data alongside these standard
  // fields on the Bugsnag website, the custom data should be included in the
  // metaData object in a request object.
  request?: {
    clientIp: string;
    headers: {
      Accept: string;
      "Accept-Encoding": string;
      "Accept-Language": string;
    };
    httpMethod: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    url: string;
    referer: string;
  };
  // An array of background threads. This is optional but recommended for apps
  // that rely heavily on threading. Threads should be in an order that makes
  // sense for your application.
  threads?: Array<Thread>;
  // A string representing what was happening in the application at the time
  // of the error. This string could be used for grouping purposes, depending
  // on the event. Usually this would represent the controller and action in a
  // server based project. It could represent the screen that the user was
  // interacting with in a client side project. For example:
  // On Ruby on Rails the context could be controller#action.
  // In Android, the context could be the top most Activity.
  // In iOS, the context could be the name of the top most UIViewController.
  context?: string;
  groupingHash?: string;
  // Whether the error was unhandled. If true, the error was detected by the
  // notifier because it was not handled by the application. If false, the
  // errors was handled and reported using Bugsnag.notify.
  unhandled?: boolean;
  severity?: Severity;
  severityReason?: {
    type:
      | "unhandledException"
      | "unhandleError"
      | "log"
      | "unhandledPromiseRejection"
      | "callbackErrorIntercept"
      | "userCallbackSetSeverity"
      | "userSpecifiedSeverity"
      | "handledException";
    attribute?: {
      level: string;
    };
  };
  // Information about the user affected by the error. These fields are
  // optional but highly recommended. To display custom user data alongside
  // these standard fields on the Bugsnag website, the custom data should be
  // included in the metaData object in a user object.
  user?: UserInfo;
  app?: AppInfo;
  device?: DeviceInfo;
  session?: any;
  metaData?: object;
}

// The bugsnag api report format can be found here
// https://bugsnagerrorreportingapi.docs.apiary.io/#reference/0/notify/send-error-reports
// Have converted the type to typescript types
export interface BugsnagErrorReport {
  apiKey: string;
  payloadVersion: number; // this is fixed as per bugsnag api requirement
  notifier: Notifier;
  events: Array<Event>;
}

export type NotifiableError =
  | Error
  | { errorClass: string; message: string }
  | { name: string; message: string }
  | any;

export interface Config {
  apiKey: string;
  notifyUrl: string;
}

export const notifyUrl = "https://notify.bugsnag.com";
let config: Config = {
  apiKey: "",
  notifyUrl,
};

interface Options {
  metaData?: object;
  user?: UserInfo;
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
        metaData: opts ? opts.metaData : undefined,
        user: opts ? opts.user : undefined,
      },
    ],
  };
}

function notify(error: NotifiableError, opts?: Options) {
  sendReport(config, prepareBugsnagReport(config.apiKey, error, opts));
}

export interface BugsnagClient {
  notify: (
    error: Error,
    opt?: {
      // tslint:disable-next-line
      metaData?: object;
      user?: UserInfo;
    }
  ) => void;
}

const bugsnagClient: BugsnagClient = {
  notify,
};

export function bugsnag(apiKey: string) {
  config.apiKey = apiKey;

  return bugsnagClient;
}
