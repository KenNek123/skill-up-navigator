export type ApiErrorCode =
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'RATE_LIMIT'
  | 'PROVIDER_ERROR'
  | 'INVALID_JSON'
  | 'EMPTY_RESPONSE'
  | 'UNKNOWN'

export type ApiError = {
  code: ApiErrorCode
  message: string
  retryable: boolean
  statusCode?: number
}

export type ApiResult<T> =
  | { success: true; data: T; model?: string; warnings?: string[] }
  | { success: false; error: ApiError }

const classifyError = (
  error: unknown,
  response?: { ok: boolean; status: number }
): ApiError => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('timeout') || message.includes('aborted')) {
      return {
        code: 'TIMEOUT',
        message: 'Request timed out',
        retryable: true,
      }
    }

    if (message.includes('network') || message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        retryable: true,
      }
    }

    if (message.includes('json')) {
      return {
        code: 'INVALID_JSON',
        message: error.message,
        retryable: false,
      }
    }
  }

  if (response && !response.ok) {
    if (response.status === 429) {
      return {
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded',
        retryable: true,
        statusCode: 429,
      }
    }

    if (response.status >= 500) {
      return {
        code: 'PROVIDER_ERROR',
        message: `Provider error: ${response.status}`,
        retryable: true,
        statusCode: response.status,
      }
    }

    if (response.status === 404) {
      return {
        code: 'PROVIDER_ERROR',
        message: 'Model not found',
        retryable: false,
        statusCode: 404,
      }
    }

    return {
      code: 'PROVIDER_ERROR',
      message: `HTTP ${response.status}`,
      retryable: false,
      statusCode: response.status,
    }
  }

  return {
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : 'Unknown error',
    retryable: false,
  }
}

export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        reject(new Error('Request aborted'))
      })
    }

    promise
      .then((result) => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

export const exponentialBackoff = (attempt: number, baseDelayMs = 1000): number => {
  const delay = Math.min(baseDelayMs * Math.pow(2, attempt), 10000)
  const jitter = Math.random() * 0.3 * delay
  return delay + jitter
}

export type RetryConfig = {
  maxRetries: number
  timeoutMs: number
  baseDelayMs?: number
  shouldRetry?: (error: ApiError, attempt: number) => boolean
}

const defaultShouldRetry = (error: ApiError, attempt: number): boolean => {
  if (!error.retryable) return false
  if (attempt >= 3) return false
  if (error.code === 'RATE_LIMIT' && attempt >= 2) return false
  return true
}

export const withRetry = async <T>(
  operation: (signal: AbortSignal) => Promise<T>,
  config: RetryConfig
): Promise<ApiResult<T>> => {
  const { maxRetries, timeoutMs, baseDelayMs = 1000, shouldRetry = defaultShouldRetry } = config
  let lastError: ApiError | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()

    try {
      const result = await withTimeout(operation(controller.signal), timeoutMs, controller.signal)
      return { success: true, data: result }
    } catch (error) {
      const classified = classifyError(error)
      lastError = classified

      const isLastAttempt = attempt === maxRetries
      const shouldRetryThis = shouldRetry(classified, attempt)

      if (isLastAttempt || !shouldRetryThis) {
        break
      }

      const delay = exponentialBackoff(attempt, baseDelayMs)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return {
    success: false,
    error: lastError ?? {
      code: 'UNKNOWN',
      message: 'All retry attempts failed',
      retryable: false,
    },
  }
}

export const createApiErrorResponse = (error: ApiError) => {
  const statusCode = error.statusCode ?? (error.code === 'TIMEOUT' ? 408 : 500)

  return {
    status: statusCode,
    body: {
      error: error.message,
      code: error.code,
      retryable: error.retryable,
    },
  }
}
