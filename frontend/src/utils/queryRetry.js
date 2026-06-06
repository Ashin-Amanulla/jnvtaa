/** Do not retry client/rate-limit errors — retrying 429 makes throttling worse. */
export function shouldRetryQuery(failureCount, error) {
  const status = error?.status ?? error?.response?.status;

  if (status === 429 || status === 401 || status === 403 || status === 404) {
    return false;
  }

  return failureCount < 1;
}
