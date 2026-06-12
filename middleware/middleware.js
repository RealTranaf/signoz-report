import express from "express"
import axios from "axios"
import bodyParser from "body-parser"

const app = express()

// parse x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

const OTEL_ENDPOINT =
  process.env.OTEL_ENDPOINT || "http://host.docker.internal:4318/v1/logs";

app.post("/prtg", async (req, res) => {
    try {
        const data = req.body

        // normalize PRTG payload device=%device&sensor=%name&status=%status&message=%message&value=%value&datetime=%datetime
        const event = {
            device: data.device,
            sensor: data.sensor,
            status: data.status,
            message: data.message,
            value: data.value,
            datetime: data.datetime,
            source: "prtg",
            severity:
                data.status === "Down"
                    ? "critical"
                    : data.status === "Warning"
                    ? "warning"
                    : "info",
        }

        // send to OTEL Collector (OTLP logs HTTP)
        await axios.post(
            OTEL_ENDPOINT,
            {
                resourceLogs: [
                    {
                        resource: {
                            attributes: [
                                {
                                    key: "service.name",
                                    value: { stringValue: "prtg-alerts" }
                                }
                            ]
                        },
                        scopeLogs: [
                            {
                                logRecords: [
                                    {
                                        timeUnixNano: Date.now() * 1e6,
                                        body: {
                                            stringValue: JSON.stringify(event),
                                        },
                                        attributes: [
                                            { key: "device", value: { stringValue: event.device } },
                                            { key: "sensor", value: { stringValue: event.sensor } },
                                            { key: "status", value: { stringValue: event.status } },
                                            { key: "severity", value: { stringValue: event.severity } },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }
        )

        res.status(200).send("ok")
    } catch (err) {
        console.error(err.message)
        res.status(500).send("error")
    }
})

app.listen(8083, () => {
    console.log("PRTG middleware running on port 8083")
})