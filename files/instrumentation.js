// Tracing
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ZoneContextManager } from '@opentelemetry/context-zone'

// Logging
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { logs } from '@opentelemetry/api-logs'

// Metric
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { metrics } from '@opentelemetry/api'

const OTEL_BASE_URL = 'http://117.103.203.180:4318/v1'

const resource = resourceFromAttributes({
    'service.name': 'react-fe',
})

const traceProvider = new WebTracerProvider({
    resource,
    spanProcessors: [
        new BatchSpanProcessor(
            new OTLPTraceExporter({
                url: `${OTEL_BASE_URL}/traces`
            })
        )
    ],
})

traceProvider.register({
    contextManager: new ZoneContextManager(),
})

registerInstrumentations({
    instrumentations: [
        new FetchInstrumentation({
            propagateTraceHeaderCorsUrls: /.*/,
        }),
        new UserInteractionInstrumentation({
            eventNames: ['click', 'input', 'submit'],
        }),
        new XMLHttpRequestInstrumentation({
            propagateTraceHeaderCorsUrls: /.*/,
        }),
    ],
})

const loggerProvider = new LoggerProvider({
    resource,
    processors: [
        new BatchLogRecordProcessor(
            new OTLPLogExporter({
                url: `${OTEL_BASE_URL}/logs`,
            }),
        ),
    ],
})

logs.setGlobalLoggerProvider(loggerProvider)

const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
        url: `${OTEL_BASE_URL}/metrics`,
    }),
    exportIntervalMillis: 10000,
})

const myServiceMeterProvider = new MeterProvider({
    resource,
    readers: [metricReader],
})

metrics.setGlobalMeterProvider(myServiceMeterProvider)

