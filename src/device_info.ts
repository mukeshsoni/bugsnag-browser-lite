import { DeviceInfo } from "./index";
import { isoDate } from "./iso_date";

function getOsName() {
  let osName = "Unknown OS";

  if (navigator.appVersion.indexOf("Win") != -1) osName = "Windows";
  if (navigator.appVersion.indexOf("Mac") != -1) osName = "MacOS";
  if (navigator.appVersion.indexOf("X11") != -1) osName = "UNIX";
  if (navigator.appVersion.indexOf("Linux") != -1) osName = "Linux";

  return osName;
}

export function detectDeviceInfo(): DeviceInfo {
  const nav = navigator;
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
