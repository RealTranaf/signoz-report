<h2 align="center">Monitor Openclaw bằng SigNoz</h2>

SigNoz có khả năng monitor các ứng dụng LLM và AI agent. Cụ thể, có thể thu thập logs, traces và metric sử dụng OpenTelemetry. Để thực hiện, cần enable plugin diagnostic-otel của OpenClaw:

```
openclaw plugins enable diagnostics-otel
```

Nếu chưa có plugin này thì cần phải cài đặt theo hướng dẫn của OpenClaw.

Thực hiện config cho exporter:

```
openclaw config set diagnostics.enabled true
openclaw config set diagnostics.otel.enabled true
openclaw config set diagnostics.otel.traces true
openclaw config set diagnostics.otel.metrics true
openclaw config set diagnostics.otel.logs true
openclaw config set diagnostics.otel.protocol http/protobuf
openclaw config set diagnostics.otel.endpoint "http://<ip_address>:4317"
openclaw config set diagnostics.otel.serviceName "<service_name>"
```

Sau đó thực hiện restart gateway.