import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = {
    vus: 20,          // 20 users đồng thời
    duration: '5m',   // chạy 5 phút
    thresholds: {
        http_req_failed: ['rate<0.1'], // <10% error
        http_req_duration: ['p(95)<500'], // p95 < 500ms
    },
}

const BASE_URL = 'http://117.103.203.180:8081/games'

export default function () {

    // =====================
    // 1. GET list games
    // =====================
    let res1 = http.get(`${BASE_URL}?platform=&status=`)

    check(res1, {
        'GET list status 200': (r) => r.status === 200,
    })

    sleep(1)

    // =====================
    // 2. CREATE game (POST)
    // =====================
    let payload = JSON.stringify({
        name: `Game-${Math.random()}`,
        description: 'k6 generated game',
        platform: 'PC',
        status: 'ONGOING'
    })

    let headers = {
        'Content-Type': 'application/json',
    }

    let res2 = http.post(BASE_URL, payload, { headers })

    check(res2, {
        'POST game success': (r) => r.status === 200 || r.status === 201,
    })

    let gameId = null

    try {
        gameId = JSON.parse(res2.body).id
    } catch (e) { }

    sleep(1)

    // =====================
    // 3. GET by ID
    // =====================
    if (gameId) {
        let res3 = http.get(`${BASE_URL}/${gameId}`)

        check(res3, {
            'GET by id': (r) => r.status === 200,
        })
    }

    sleep(1)

    // =====================
    // 4. UPDATE game
    // =====================
    if (gameId) {
        let updatePayload = JSON.stringify({
            name: `Game-updated-${Math.random()}`,
            description: 'updated by k6',
            platform: 'PC',
            status: 'PUBLISHED'
        })

        http.put(`${BASE_URL}/${gameId}`, updatePayload, { headers })
    }

    sleep(1)

    // =====================
    // 5. DELETE game (optional load)
    // =====================
    if (gameId && Math.random() < 0.3) {
        http.del(`${BASE_URL}/${gameId}`)
    }

    sleep(2)
}