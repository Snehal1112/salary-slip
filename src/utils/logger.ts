const isProd = process.env.NODE_ENV === "production";

const prefix = (scope?: string) => (scope ? `[${scope}]` : "[app]");

const safeLog = (
  fn: (...args: unknown[]) => void,
  scope: string | undefined,
  ...args: unknown[]
) => {
  try {
    if (!isProd) fn(prefix(scope), ...args);
  } catch {
    // swallow logging errors
  }
};

const logger = {
  debug: (scope?: string, ...args: unknown[]) =>
    safeLog(console.debug.bind(console), scope, ...args),
  info: (scope?: string, ...args: unknown[]) =>
    safeLog(console.info.bind(console), scope, ...args),
  warn: (scope?: string, ...args: unknown[]) =>
    safeLog(console.warn.bind(console), scope, ...args),
  error: (scope?: string, ...args: unknown[]) =>
    safeLog(console.error.bind(console), scope, ...args),
};

export default logger;
