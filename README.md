# XQ Cypress Platform

Composable Cypress infrastructure for XQ consumer repositories. The platform centralizes shared Cypress setup, commands, assertions, and Node-side capabilities while consumer repositories continue using normal Cypress tests.

## Repository layout

```text
packages/cypress-platform/   Publishable platform package
apps/dummy-api/              Local system under test for the example suite
tests/consumer-e2e/          Consumer-style Cypress project
tests/cypress-platform.test.mjs
                             Unit tests for platform setup
scripts/run-cypress-docker.sh
                             Docker-based consumer test runner
```

## Requirements

- Node.js 20 or newer
- npm
- Docker, only for the Docker-based Cypress suite

## Install

```bash
npm ci
```

## Build

Build the platform package:

```bash
npm run build:platform
```

Build output is written to `packages/cypress-platform/dist`.

## Test

Run platform unit tests:

```bash
npm test
```

Run the consumer end-to-end suite in the official Cypress Docker image. The command installs dependencies, builds the platform, starts the dummy API, waits for its health endpoint, and runs Cypress in Chrome:

```bash
npm run test:consumer:docker
```

Run the dummy API directly:

```bash
npm run start:dummy-api
```

The API listens on `http://127.0.0.1:4310` by default. Override its port with `PORT`.

## Using the platform

Install the package in a consumer repository:

```bash
npm install --save-dev cypress @xq/cypress-platform
```

Register the Node-side integration in `cypress.config.ts` and return its result:

```ts
import { defineConfig } from "cypress"
import { setupCompanyCypress } from "@xq/cypress-platform/plugin"

export default defineConfig({
  e2e: {
    baseUrl: process.env.SUT_BASE_URL ?? "http://127.0.0.1:4310",
    setupNodeEvents(on, config) {
      return setupCompanyCypress(on, config)
    }
  }
})
```

Load browser-side commands and assertions from `cypress/support/e2e.ts`:

```ts
import "@xq/cypress-platform/support"
```

The package exposes two public entry points:

- `@xq/cypress-platform/plugin` for `setupCompanyCypress`
- `@xq/cypress-platform/support` for browser-side support registration

## Capabilities

Capabilities are configured through the company-owned API:

```ts
setupCompanyCypress(on, config, {
  reporting: true,
  testData: true
})
```

Both capabilities are enabled by default.

| Capability | Behavior |
| --- | --- |
| `reporting` | Enables the platform reporting capability boundary. |
| `testData` | Registers the `xq:echoTestData` Cypress task. |

Disable capabilities explicitly when needed:

```ts
setupCompanyCypress(on, config, {
  reporting: false,
  testData: false
})
```

Unknown capability names fail during Cypress configuration loading, helping catch configuration typos early.

The support integration currently provides:

```ts
cy.xqPlatformReady().should("equal", true)
```

When `testData` is enabled, consumers can use the deterministic smoke-test task:

```ts
cy.task("xq:echoTestData", { source: "consumer" })
  .should("deep.equal", { source: "consumer" })
```

## Configuration and types

Consumer TypeScript projects should include Cypress configuration and support files in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["cypress", "node"]
  },
  "include": ["cypress.config.ts", "cypress/**/*.ts"]
}
```

Keep vendor plugin imports and type declarations inside the platform package when they form part of the company contract. Consumer tests should depend on stable company-owned APIs.

## Compatibility

- Package version: `0.1.0`
- Cypress peer dependency: `>=13 <16`
- Docker runner image: `cypress/included:15.21.1`

Keep the Cypress version, Node version, browser versions, and CI image aligned. Run the consumer smoke suite after platform upgrades.

## License

Internal XQ project.
