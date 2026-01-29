import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { PrometheusService } from "./prometheus.service";
import { finalize, Observable } from "rxjs";


@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {

  constructor(private readonly prom : PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {

    // start, req - res까지 처리
    const start = process.hrtime.bigint();
    const req = context.switchToHttp().getRequest(); // http에서 request
    const res = context.switchToHttp().getResponse(); // http에서 response

    const method = req.method; // method를 수집한다.

    const route : string = 
      ( req.route && req.route.path ) || 
      req.originalUrl ||
      req.url || 
      "unknown";

    return next.handle().pipe(
      finalize(() => {
        const status : string = (res.statusCode || 0).toString(); // 400, 200 등 상태

        const durationSec = Number(process.hrtime.bigint() - start) / 1e9; // 총 걸린 시간을 수집
        
        // prometheus 메트릭 정보 저장
        this.prom.httpRequestsTotal.labels(method, route, status).inc();
        this.prom.httpRequestDuration.labels(method, route, status).observe(durationSec);
      }),
    );
  };
};

// websocket용 intercepter