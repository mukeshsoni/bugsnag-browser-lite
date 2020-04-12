import * as React from "react";

import { BugsnagClient } from "./bugsnag_client";

export const formatComponentStack = (str: string) => {
  const lines = str.split(/\s*\n\s*/g);
  let ret = "";
  for (let line = 0, len = lines.length; line < len; line++) {
    if (lines[line].length) ret += `${ret.length ? "\n" : ""}${lines[line]}`;
  }
  return ret;
};

interface Props {
  bugsnagClient: BugsnagClient;
  FallbackComponent?: React.ElementType<any>;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    const { bugsnagClient } = this.props;

    const handledState = {
      severity: "error",
      unhandled: true,
      severityReason: { type: "unhandledException" },
    } as const;

    if (info && info.componentStack) {
      info.componentStack = formatComponentStack(info.componentStack);
    }

    bugsnagClient.notify(error, {
      metaData: {
        react: info,
      },
      ...handledState,
    });
  }

  render() {
    const { error } = this.state;

    if (error) {
      const { FallbackComponent } = this.props;

      if (FallbackComponent) {
        return React.createElement(FallbackComponent, this.state);
      }

      return null;
    }

    return this.props.children;
  }
}
