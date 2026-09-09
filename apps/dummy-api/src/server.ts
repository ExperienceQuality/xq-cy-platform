import { createServer, type IncomingMessage, type ServerResponse } from "node:http"

type User = { id: string; username: string; balance: number }
type Payment = { id: string; userId: string; amount: number; status: "successful" }

const users = new Map<string, User>([
  ["customer", { id: "user-customer", username: "customer", balance: 1000 }]
])
const payments = new Map<string, Payment>()

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json" })
  response.end(JSON.stringify(body))
}

async function body(request: IncomingMessage): Promise<Record<string, unknown>> {
  let value = ""
  for await (const chunk of request) value += chunk
  return value ? JSON.parse(value) as Record<string, unknown> : {}
}

function route(path: string): string[] {
  return path.split("/").filter(Boolean)
}

const server = createServer(async (request, response) => {
  try {
    const parts = route(request.url ?? "/")
    if (request.method === "GET" && parts[0] === "health") return json(response, 200, { status: "ok" })

    if (request.method === "POST" && parts[0] === "auth" && parts[1] === "login") {
      const input = await body(request)
      const user = users.get(String(input.username))
      if (!user || input.password !== "password") return json(response, 401, { error: "invalid_credentials" })
      return json(response, 200, { token: `token-${user.id}`, user })
    }

    if (request.method === "GET" && parts[0] === "users" && parts[1]) {
      const user = [...users.values()].find((candidate) => candidate.id === parts[1])
      return user ? json(response, 200, user) : json(response, 404, { error: "user_not_found" })
    }

    if (request.method === "POST" && parts[0] === "payments") {
      const input = await body(request)
      const user = users.get(String(input.username))
      const amount = Number(input.amount)
      if (!user || !Number.isFinite(amount) || amount <= 0) return json(response, 400, { error: "invalid_payment" })
      if (amount > user.balance) return json(response, 409, { error: "insufficient_balance" })
      user.balance -= amount
      const payment = { id: `payment-${payments.size + 1}`, userId: user.id, amount, status: "successful" as const }
      payments.set(payment.id, payment)
      return json(response, 201, payment)
    }

    if (request.method === "GET" && parts[0] === "payments" && parts[1]) {
      const payment = payments.get(parts[1])
      return payment ? json(response, 200, payment) : json(response, 404, { error: "payment_not_found" })
    }

    json(response, 404, { error: "not_found" })
  } catch (error) {
    json(response, 500, { error: "internal_error", message: error instanceof Error ? error.message : "unknown" })
  }
})

const port = Number(process.env.PORT ?? 4310)
server.listen(port, "127.0.0.1", () => console.log(`dummy-api listening on http://127.0.0.1:${port}`))
