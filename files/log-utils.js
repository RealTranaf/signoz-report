import { logs, SeverityNumber } from '@opentelemetry/api-logs'

const logger = logs.getLogger('react-fe')

export function logInfo(body, attrs = {}) {
    logger.emit({
        body,
        severityNumber: SeverityNumber.INFO,
        severityText: 'INFO',
        attributes: attrs,
    })
}

export function logWarn(body, attrs = {}) {
    logger.emit({
        body,
        severityNumber: SeverityNumber.WARN,
        severityText: 'WARN',
        attributes: attrs,
    })
}

export function logError(body, attrs = {}) {
    logger.emit({
        body,
        severityNumber: SeverityNumber.ERROR,
        severityText: 'ERROR',
        attributes: attrs,
    })
}
