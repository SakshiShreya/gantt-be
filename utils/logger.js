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
export default function nodeLogger(params) {
  const rawParams = JSON.parse(JSON.stringify(params));

  const trace = stackTrace.get()[1];
  const path = trace.getFileName();
  const file = path ? path.split("/").pop() : "";
  const method = trace.getFunctionName();
  const line = trace.getLineNumber();

  const logData = {
    code: rawParams.code,
    description: rawParams.description,
    type: rawParams.type,
    ref: rawParams.ref,
    path,
    file,
    method,
    line,
    ts: new Date().toISOString(),
  };

  // so that logging is done once process is free
  setTimeout(() => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(logData));
  }, 0);
}
