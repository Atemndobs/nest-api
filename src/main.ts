import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
const swaggerStats = require('swagger-stats');
import {
    httpRequestsTotal,
    httpErrorsTotal,
    httpDuration,
    requestSizeGauge,
    httpRequestLatency,
    responseSizeSummary,
    responseTimeHistogram,
    httpRequestDuration
} from './metrics'; // Import custom metrics


async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable swagger-stats middleware
    app.use(swaggerStats.getMiddleware({
        swaggerSpec: {}, // Replace with your swagger specification
        uriPath: '/swagger-stats', // Endpoint path for swagger-stats
        onResponseFinish: (req, res, rrr) => {
            // Define any custom logic to collect and process metrics using prom-client
            // For example:
            const statusCode = res.statusCode;
            const responseTime = rrr.getDuration(); // Get response time from swagger-stats
            const responseSize = rrr.getResponseLength(); // Get response size from swagger-stats
            const requestSize = rrr.getRequestLength(); // Get request size from swagger-stats
            // Collect custom metrics using prom-client, e.g., counter, gauge, histogram, summary, etc.
            // For example:
            if (statusCode < 400) {
                httpRequestsTotal.inc({path: req.path});
            } else {
                httpErrorsTotal.inc({path: req.path});
            }
            responseTimeHistogram.observe({path: req.path}, responseTime);
            responseSizeSummary.observe({path: req.path}, responseSize);
            requestSizeGauge.set({path: req.path}, requestSize);
        },
    }));

    await app.listen(3000);
}

bootstrap();
