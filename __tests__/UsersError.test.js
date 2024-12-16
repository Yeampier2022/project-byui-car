const request = require("supertest");
const { app, startServer, connectToDatabase } = require("../unitTest");

describe("User Routes - Error Scenarios", () => {
  let agent;
  let server;

  // Start the server before tests and ensure it stops after
  beforeAll(async () => {
    // Connect to the database
    await connectToDatabase();

    // Start the server and store the server instance
    server = await startServer();

    // Use agent for maintaining sessions
    agent = request.agent(app);
  });

  it("should return 401 for unauthenticated access to get all users", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toBe(401);
    expect(response.text).toBe("Unauthorized");
  });

  it("should return 403 for unauthorized role trying to access get all users", async () => {
    // Simulate login as a client (unauthorized role)
    await agent.post("/test-login").send({
      _id: "675f5a6867f3af115a3136f7",
      role: "client",
      email: "client@example.com",
      githubId: "mockGithubIdClient",
      displayName: "Mock Client",
      avatarUrl: "https://example.com/avatar.jpg",
    });

    const response = await agent.get("/users");
    expect(response.status).toBe(403);
    expect(response.text).toBe("Forbidden: You do not have access.");
  });

  it("should return 403 when trying to update user without admin role", async () => {
    const updatedUserData = { email: "updated@example.com" };

    const response = await agent.put("/users/675f5a7c67f3af115a3136f8").send(updatedUserData);
    expect(response.status).toBe(403);
    expect(response.text).toBe("Forbidden: Insufficient permissions.");
  });

  it("should return 403 when trying to update user role without admin role", async () => {
    const updatedUserData = { role: "admin" };

    const response = await agent.put("/users/675f5a6867f3af115a3136f7").send(updatedUserData);
    expect(response.status).toBe(403);
    expect(response.text).toBe("Forbidden: Only admins can update roles.");
  });


  it("should return 403 when non-admin or non-owner tries to delete a user", async () => {
    const response = await agent.delete("/users/675f5a7c67f3af115a3136f8");
    expect(response.status).toBe(403);
    expect(response.text).toBe("Forbidden: Insufficient permissions.");
  });

  // Close the server after all tests
  afterAll(() => {
    server.close();
  });
});
