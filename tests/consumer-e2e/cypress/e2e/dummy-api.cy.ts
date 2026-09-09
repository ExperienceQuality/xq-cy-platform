describe("dummy API consumer", () => {
  it("uses the platform and completes a payment", () => {
    cy.xqPlatformReady().should("equal", true)
    cy.task("xq:echoTestData", { source: "consumer" }).should("deep.equal", { source: "consumer" })

    cy.request("POST", "/auth/login", { username: "customer", password: "password" })
      .its("body.user.id")
      .then((userId) => {
        cy.request("POST", "/payments", { username: "customer", amount: 100 })
          .its("body")
          .should("include", { userId, amount: 100, status: "successful" })
      })
  })

  it("returns a domain error for an overdrawn payment", () => {
    cy.request({
      method: "POST",
      url: "/payments",
      body: { username: "customer", amount: 100000 },
      failOnStatusCode: false
    }).its("body").should("deep.equal", { error: "insufficient_balance" })
  })
})
