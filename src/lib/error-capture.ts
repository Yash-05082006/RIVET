let lastError: Error | undefined;

export function consumeLastCapturedError(): Error | undefined {
  const error = lastError;
  lastError = undefined;
  return error;
}

export function captureError(error: Error) {
  lastError = error;
}
