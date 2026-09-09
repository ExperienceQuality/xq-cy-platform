declare global {
  namespace Cypress {
    interface Chainable {
      /** Verify that the XQ support layer is loaded. */
      xqPlatformReady(): Chainable<boolean>
    }
  }
}

export {}
