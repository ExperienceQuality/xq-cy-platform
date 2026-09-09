# @xq/cypress-platform

The XQ Cypress platform is a composable distribution package for shared Cypress infrastructure. It centralizes platform capabilities while keeping consumer tests as normal Cypress tests.

The package has two public entry points:

```text
@xq/cypress-platform/plugin   Node-side setupNodeEvents integration
@xq/cypress-platform/support  Browser-side support integration
```

## Installation

Install Cypress and the platform package in the consumer repository:

```bash
npm install --save-dev cypress @xq/cypress-platform
```

Cypress is a peer dependency of the platform. The platform owns its internal capability implementations, but the consumer owns the Cypress version.

## Required consumer files

A minimal consumer repository looks like this:

```text
payment-e2e/
├── cypress/
│   ├── e2e/
│   │   └── payment.cy.ts
│   └── support/
│       └── e2e.ts
├── cypress.config.ts
├── package.json
└── tsconfig.json
```

### Node-side setup

Register the platform from `cypress.config.ts`:

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

Always return the configuration returned by `setupCompanyCypress`. The platform may apply defaults and register enabled Node-side capabilities.

### Browser-side setup

Import the support entry point from `cypress/support/e2e.ts`:

```ts
import "@xq/cypress-platform/support"
```

This is the single browser-side integration point for platform commands, assertions, and supported third-party support modules.

## Capabilities

Capabilities are configured through the company API rather than through vendor-specific plugin functions:

```ts
setupCompanyCypress(on, config, {
  reporting: true,
  testData: true
})
```

Current capabilities:

| Capability | Default | Consumer behavior |
| --- | ---: | --- |
| `reporting` | `true` | Enables the platform reporting capability boundary. |
| `testData` | `true` | Registers the `xq:echoTestData` Node task. |

Disable an optional capability explicitly when it is not needed:

```ts
setupCompanyCypress(on, config, {
  reporting: false,
  testData: false
})
```

Unknown capability names fail during Cypress configuration loading. This is intentional: a typo should fail immediately instead of silently changing the test environment.

## Using the platform in tests

Tests continue to use Cypress directly:

```ts
describe("payment", () => {
  it("creates a payment", () => {
    cy.xqPlatformReady().should("equal", true)

    cy.request("POST", "/payments", {
      username: "customer",
      amount: 100
    }).its("body").should("include", {
      amount: 100,
      status: "successful"
    })
  })
})
```

The platform does not replace Cypress primitives such as `cy.request`, `cy.get`, `click`, `type`, or `should`.

### Platform task

When the `testData` capability is enabled, the platform registers:

```ts
cy.task("xq:echoTestData", { source: "payment-e2e" })
  .should("deep.equal", { source: "payment-e2e" })
```

This task is a deterministic smoke-test capability in the initial platform slice. Domain-specific test-data tasks will be added behind the same company platform boundary.

### Platform command

The support entry point currently provides:

```ts
cy.xqPlatformReady().should("equal", true)
```

The command is useful for a consumer smoke test that proves the support layer was loaded. It is not intended to replace ordinary Cypress commands.

## TypeScript configuration

Cypress’s TypeScript preprocessor expects a `tsconfig.json` in the consumer project. A minimal configuration is:

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

The platform publishes declarations for its custom Cypress commands through the `plugin` and `support` package subpaths.

### Type hints for third-party commands

If a third-party support plugin adds Cypress commands, its type declarations
must be loaded by the platform type entry point as well as its runtime support
module.

For a vendor command that is intentionally part of the consumer contract, the
platform can load the vendor types from `src/types/index.d.ts`:

```ts
import "cypress"
import "third-party-plugin"

declare global {
  namespace Cypress {
    interface Chainable {
      xqPlatformReady(): Chainable<boolean>
    }
  }
}

export {}
```

The vendor package must be a regular dependency of
`@xq/cypress-platform`, because the published declaration file references it:

```json
{
  "dependencies": {
    "third-party-plugin": "^2.0.0"
  }
}
```

The consumer then receives the vendor command hints by importing the normal
platform support entry point:

```ts
import "@xq/cypress-platform/support"

cy.vendorCommand().should("be.visible")
```

Prefer a company-owned command declaration when the vendor API should remain
replaceable. The platform can import the vendor support module internally and
expose a stable company command instead:

```ts
declare global {
  namespace Cypress {
    interface Chainable {
      xqAuthenticate(username: string): Chainable<void>
    }
  }
}
```

This keeps implementation details out of consumer tests. If the underlying
plugin changes, only the platform adapter and its declarations need to change.

Do not duplicate or manually reimplement vendor declarations in every
consumer repository. Keep third-party type loading in the platform package,
and keep company-level types in the platform’s public type entry point.

## Running locally

Add a Cypress script to `package.json`:

```json
{
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run --browser chrome"
  }
}
```

Start the system under test, then run:

```bash
npm run cy:run
```

Use `SUT_BASE_URL` to point the tests at another environment:

```bash
SUT_BASE_URL=http://127.0.0.1:5000 npm run cy:run
```

## Running with Docker

The reference workspace uses the official Cypress image `cypress/included:15.21.1`. That image provides Cypress, browsers, and the Linux dependencies needed for headless execution.

For the reference workspace, run:

```bash
npm run test:consumer:docker
```

Consumer repositories can use the same pattern:

```bash
docker run --rm --init \\
  --volume "$PWD:/e2e" \\
  --workdir /e2e \\
  cypress/included:15.21.1 \\
  cypress run --project /e2e --browser chrome
```

Pin the image version to the Cypress version declared by the consumer. The image already contains the Cypress binary; do not download a second binary inside the container. Install project dependencies as needed, preferably with `npm ci --ignore-scripts` when using an included image.

## Extending the setup

Use native Cypress APIs for local behavior that is not a company-wide capability. Do not import or configure the platform’s internal vendor implementations directly.

The platform team may replace an underlying vendor implementation while keeping the company capability API stable.

## Version and compatibility policy

Consumer repositories should:

- use the approved Cypress major version range;
- upgrade the platform package through the normal dependency workflow;
- avoid direct dependencies on platform-internal vendor plugins;
- keep Node and browser requirements aligned with CI;
- run the consumer smoke suite after platform upgrades.

## Troubleshooting

### Platform defaults are not applied

Return the result:

```ts
return setupCompanyCypress(on, config)
```

Do not call the setup function and then return the original `config`.

### `cy.xqPlatformReady` is undefined

Confirm that `cypress/support/e2e.ts` contains:

```ts
import "@xq/cypress-platform/support"
```

### `xq:echoTestData` is not registered

Confirm that `testData` has not been disabled and that the Node setup function is registered in `cypress.config.ts`.

### Cypress cannot compile TypeScript files

Add a consumer-level `tsconfig.json` and use matching `NodeNext` settings for `module` and `moduleResolution`.
