import * as stackTrace from "stack-trace";

export const Type = {
  error: "error",
  warn: "warn",
  info: "info",
  http: "http",
  verbose: "verbose",
  debug: "debug",
  silly: "silly",
};

/**
 *
 * @param {object} params - Log parameters
 * @param {number} params.code - HTTP status code
 * @param {string} params.description - description of the error
 * @param {Type} params.type - type of the error
 * @param {object} params.ref - Log references
 */
export default function logger(params) {
  const rawParams = JSON.parse(JSON.stringify(params));

  let { stack } = rawParams;

  if (!stack) {
    try {
      stack = stackTrace.parse();
    } catch (e) {
      stack = undefined;
    }
  }

  const logData = {
    code: rawParams.code,
    description: rawParams.description,
    type: rawParams.type,
    ref: rawParams.ref,
    stack,
    ts: new Date().toISOString(),
  };

  // so that logging is done once process is free
  setTimeout(() => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(logData));
  }, 0);
}
