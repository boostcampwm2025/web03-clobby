import { Global, Module } from "@nestjs/common";
import { PrometheusService } from "./prometheus/prometheus.service";
import { ConfigService } from "@nestjs/config";
import { HttpMetricsInterceptor } from "./prometheus/prometheus.intercepter";


@Global()
@Module({
  providers : [
    ConfigService,
    PrometheusService,
    HttpMetricsInterceptor
  ],
  exports : [
    PrometheusService,
    HttpMetricsInterceptor
  ]
})
export class PrometheusModule {};