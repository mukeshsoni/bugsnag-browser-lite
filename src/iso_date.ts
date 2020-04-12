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

