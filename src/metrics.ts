// metrics.ts

import { Counter, Gauge, Histogram, Summary } from 'prom-client';

// Define custom metrics using prom-client
export const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status'],
});

export const httpErrorsTotal = new Counter({
    name: 'http_errors_total',
    help: 'Total number of HTTP errors',
    labelNames: ['method', 'path', 'status'],
});

export const httpDuration = new Gauge({
    name: 'http_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status'],
});

// export const httpResponseSize = new Gauge({
//     name: 'http_response_size_bytes',
//     help: 'Size of HTTP responses in bytes',
//     labelNames: ['method', 'path', 'status'],
// });

// export const httpRequestSize = new Gauge({
//     name: 'http_request_size_bytes',
//     help: 'Size of HTTP requests in bytes',
//     labelNames: ['method', 'path', 'status'],
// });

export const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5], // Example custom bucket boundaries
});

export const httpRequestLatency = new Summary({
    name: 'http_request_latency_seconds',
    help: 'Latency of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status'],
});


export const responseTimeHistogram = new Histogram({
    name: 'http_response_time_seconds',
    help: 'HTTP response time in seconds',
    labelNames: ['path'],
    buckets: [0.1, 0.5, 1, 2, 5], // Define custom buckets for histogram
});

export const responseSizeSummary = new Summary({
    name: 'http_response_size_bytes',
    help: 'HTTP response size in bytes',
    labelNames: ['path'],
});

export const requestSizeGauge = new Gauge({
    name: 'http_request_size_bytes',
    help: 'HTTP request size in bytes',
    labelNames: ['path'],
});