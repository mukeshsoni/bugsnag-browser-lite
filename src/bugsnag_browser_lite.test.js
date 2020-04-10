import mock from "xhr-mock";
import bugsnag, {
  hasStack,
  getStacktrace,
  prepareBugsnagReport,
  notifyUrl,
  isoDate,
} from "./index.ts";

test("hasStack", () => {
  expect(hasStack({ stack: "blah" })).toBe(true);
  expect(hasStack({ stacktrace: "blah" })).toBe(true);
});

beforeEach(() => mock.setup());

afterEach(() => mock.teardown());

test("notify function", async () => {
  const apiKey = "abc";
  const bugsnagClient = bugsnag(apiKey);

  const error = new Error("check check 123");

  mock.post(notifyUrl + "/", (req, res) => {
    expect(req.header("Bugsnag-Api-Key")).toBe(apiKey);
    expect(typeof req.body()).toBe("string");
    expect(JSON.parse(req.body()).apiKey).toBe(apiKey);
    expect(JSON.parse(req.body()).events[0].device.browserName).toBe("jsdom");
    expect(JSON.parse(req.body()).events[0].device.osName).toBe("Unknown OS");

    return res.status(200);
  });

  try {
    eval("const a =");
  } catch (e) {
    bugsnagClient.notify(e);
  }
});
