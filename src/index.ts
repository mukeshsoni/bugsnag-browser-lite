import jsonStringify from "safe-json-stringify";
import ErrorStackParser from "error-stack-parser";
import { StackFrame } from "error-stack-parser";

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
interface DeviceInfo {
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

interface SessionInfo {
  id: string;
  startedAt: TimeString;
  // Details of the number of handled and unhandled events that have occurred
  // so far in this session.
  events: {
    handled: number;
    unhandled: number;
  };
}

interface BugsnagStackFrame {
  file?: string;
  lineNumber: number;
  columnNumber?: number;
  method: string;
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
interface BugsnagErrorReport {
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

interface Config {
  apiKey?: string;
  notifyUrl: string;
}

export const notifyUrl = "https://notify.bugsnag.com";
let config: Config = {
  notifyUrl,
};

const _pad = (n: number) => (n < 10 ? `0${n}` : n);
// Date#toISOString
export function isoDate() {
  // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  const d = new Date();
  return (
    d.getUTCFullYear() +
    "-" +
    _pad(d.getUTCMonth() + 1) +
    "-" +
    _pad(d.getUTCDate()) +
    "T" +
    _pad(d.getUTCHours()) +
    ":" +
    _pad(d.getUTCMinutes()) +
    ":" +
    _pad(d.getUTCSeconds()) +
    "." +
    (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
    "Z"
  );
}

// const REPORT_FILTER_PATHS = [
// "events.[].app",
// "events.[].metaData",
// "events.[].user",
// "events.[].breadcrumbs",
// "events.[].request",
// "events.[].device",
// ];

function prepareReportJson(report: BugsnagErrorReport): string {
  let payload = jsonStringify(report, null, null);
  if (payload.length > 10e5) {
    delete report.events[0].metaData;
    report.events[0].metaData = {
      notifier: `WARNING!
Serialized payload was ${payload.length / 10e5}MB (limit = 1MB)
metaData was removed`,
    };
    payload = jsonStringify(report, null, null);
    if (payload.length > 10e5) throw new Error("payload exceeded 1MB limit");
  }
  return payload;
}

function sendReport(report: BugsnagErrorReport, cb = () => {}) {
  if (typeof XMLHttpRequest !== "undefined") {
    try {
      const url = config.notifyUrl;
      const req = new XMLHttpRequest();
      req.onreadystatechange = function () {
        if (req.readyState === XMLHttpRequest.DONE) cb();
      };
      req.open("POST", url);
      req.setRequestHeader("Content-Type", "application/json");
      req.setRequestHeader("Bugsnag-Api-Key", config.apiKey);
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

export function hasStack(error: NotifiableError) {
  return (
    !!error &&
    (!!error.stack || !!error.stacktrace || !!error["opera#sourceloc"]) &&
    typeof (error.stack || error.stacktrace || error["opera#sourceloc"]) ===
      "string" &&
    error.stack !== `${error.name}: ${error.message}`
  );
}

function normaliseFunctionName(name: string) {
  return /^global code$/i.test(name) ? "global code" : name;
}

// takes a stacktrace.js style stackframe (https://github.com/stacktracejs/stackframe)
// and returns a Bugsnag compatible stackframe (https://docs.bugsnag.com/api/error-reporting/#json-payload)
function formatStackframe(frame: StackFrame): BugsnagStackFrame {
  const f = {
    file: frame.fileName,
    method: normaliseFunctionName(frame.functionName),
    lineNumber: frame.lineNumber,
    columnNumber: frame.columnNumber,
  };
  // Some instances result in no file:
  // - calling notify() from chrome's terminal results in no file/method.
  // - non-error exception thrown from global code in FF
  // This adds one.
  if (f.lineNumber > -1 && !f.file && !f.method) {
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

function getOsName() {
  let osName = "Unknown OS";

  if (navigator.appVersion.indexOf("Win") != -1) osName = "Windows";
  if (navigator.appVersion.indexOf("Mac") != -1) osName = "MacOS";
  if (navigator.appVersion.indexOf("X11") != -1) osName = "UNIX";
  if (navigator.appVersion.indexOf("Linux") != -1) osName = "Linux";

  return osName;
}

function detectDeviceInfo(): DeviceInfo {
  const nav = navigator;
  const nVer = navigator.appVersion;
  const nAgt = navigator.userAgent;
  let browserName = navigator.appName;
  let browserVersion = "" + parseFloat(navigator.appVersion);
  let nameOffset, verOffset, ix;

  // In Opera, the true version is after "Opera" or after "Version"
  if ((verOffset = nAgt.indexOf("Opera")) != -1) {
    browserName = "Opera";
    browserVersion = nAgt.substring(verOffset + 6);
    if ((verOffset = nAgt.indexOf("Version")) != -1)
      browserVersion = nAgt.substring(verOffset + 8);
  }
  // In MSIE, the true version is after "MSIE" in userAgent
  else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
    browserName = "Microsoft Internet Explorer";
    browserVersion = nAgt.substring(verOffset + 5);
  }
  // In Chrome, the true version is after "Chrome"
  else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
    browserName = "Chrome";
    browserVersion = nAgt.substring(verOffset + 7);
  }
  // In Safari, the true version is after "Safari" or after "Version"
  else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
    browserName = "Safari";
    browserVersion = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf("Version")) != -1)
      browserVersion = nAgt.substring(verOffset + 8);
  }
  // In Firefox, the true version is after "Firefox"
  else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
    browserName = "Firefox";
    browserVersion = nAgt.substring(verOffset + 8);
  }
  // In most other browsers, "name/version" is at the end of userAgent
  else if (
    (nameOffset = nAgt.lastIndexOf(" ") + 1) <
    (verOffset = nAgt.lastIndexOf("/"))
  ) {
    browserName = nAgt.substring(nameOffset, verOffset);
    browserVersion = nAgt.substring(verOffset + 1);
    if (browserName.toLowerCase() == browserName.toUpperCase()) {
      browserName = navigator.appName;
    }
  }
  // trim the browserVersion string at semicolon/space if present
  if ((ix = browserVersion.indexOf(";")) != -1)
    browserVersion = browserVersion.substring(0, ix);
  if ((ix = browserVersion.indexOf(" ")) != -1)
    browserVersion = browserVersion.substring(0, ix);

  return {
    language: nav.language,
    userAgent: nav.userAgent,
    time: isoDate(),
    osName: getOsName(),
    browserName,
    browserVersion,
  };
}

interface Options {
  metaData?: object;
  user?: UserInfo;
}

// Javascript Error object contains a `name` property which gives the type of
// error. E.g. SyntaxError, TypeError, RangeError, EvalError
// User can create their own custom error too and give it a custom name
export function prepareBugsnagReport(
  config: Config,
  error: NotifiableError,
  opts?: Options
) {
  return {
    apiKey: config.apiKey,
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
  sendReport(prepareBugsnagReport(config, error, opts));
}

const bugsnagClient = {
  notify,
};

export function init(apiKey: string) {
  config.apiKey = apiKey;

  return bugsnagClient;
}
