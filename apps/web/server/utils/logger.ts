/**
 * Simple structured logger for server-side code.
 *
 * In development, logs to console with formatting.
 * In production (Cloudflare Workers), logs are captured by wrangler tail.
 *
 * This is a lightweight implementation that can be replaced with a more
 * robust logging solution (e.g., Axiom, Datadog, LogTail) as needed.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface Logger {
  debug: (message: string, context?: LogContext) => void
  info: (message: string, context?: LogContext) => void
  warn: (message: string, context?: LogContext) => void
  error: (message: string, context?: LogContext) => void
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const contextStr = context ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

function shouldLog(level: LogLevel): boolean {
  // In production, only log info and above
  // In development, log everything
  if (import.meta.dev) {
    return true
  }
  return level !== 'debug'
}

/**
 * Create a logger instance with an optional prefix for the component/module.
 *
 * @param prefix - Optional prefix to identify the logging source
 * @returns Logger instance
 *
 * @example
 * const logger = createLogger('QueueConsumer')
 * logger.info('Processing message', { type: 'email', id: '123' })
 */
export function createLogger(prefix?: string): Logger {
  const prefixStr = prefix ? `[${prefix}] ` : ''

  return {
    debug(message: string, context?: LogContext) {
      if (shouldLog('debug')) {
        console.debug(formatMessage('debug', `${prefixStr}${message}`, context))
      }
    },

    info(message: string, context?: LogContext) {
      if (shouldLog('info')) {
        console.info(formatMessage('info', `${prefixStr}${message}`, context))
      }
    },

    warn(message: string, context?: LogContext) {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', `${prefixStr}${message}`, context))
      }
    },

    error(message: string, context?: LogContext) {
      if (shouldLog('error')) {
        console.error(formatMessage('error', `${prefixStr}${message}`, context))
      }
    },
  }
}

/**
 * Default logger instance for general use.
 */
export const logger = createLogger()
