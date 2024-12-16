const request = require("supertest");
const { app, startServer, connectToDatabase } = require("../unitTest");
const { createUser, deleteUserById } = require("../models/userModel");

describe("Users Routes", () => {
    let agent;
    let userId; // Stores the ID of the test user
    let server;

    // Start the server and set up the database connection before tests
    beforeAll(async () => {
        // Connect to the database
        await connectToDatabase();

        // Start the server and store the server instance
        server = await startServer();

        // Use agent for maintaining sessions
        agent = request.agent(app);

        // Perform login before tests
        await agent.post("/test-login").send({
            _id: "mockUserId",
            role: "admin",
            email: "mock@gmail.com",
            githubId: "mockGithubId",
            displayName: "Mock Admin",
            avatarUrl: "https://example.com/avatar.jpg",
        });

        // Create a test user in the database
        const testUser = {
            name: "Test User",
            email: "testuser@example.com",
            role: "client",
            githubId: "87234989",
            avatarUrl: "https://example.com/avatar.jpg",
        };

        userId = await createUser(testUser);
    });

    it("should get all users", async () => {
        const response = await agent.get("/users");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it("should get a single user by ID", async () => {
        const response = await agent.get(`/users/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body._id).toBe(String(userId));
        expect(response.body.name).toBe("Test User");
    });

    it("should update a user by ID", async () => {
        const updatedData = {
            name: "Updated Test User",
            email: "updateduser@example.com",
        };

        const response = await agent.put(`/users/${userId}`).send(updatedData);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User updated");

        // Verify the update
        const updatedResponse = await agent.get(`/users/${userId}`);
        expect(updatedResponse.body.name).toBe(updatedData.name);
        expect(updatedResponse.body.email).toBe(updatedData.email);
    });

    it("should delete a user by ID", async () => {
        const response = await agent.delete(`/users/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User deleted");

        // Verify deletion
        const deletedResponse = await agent.get(`/users/${userId}`);
        expect(deletedResponse.status).toBe(404); // User should no longer exist
    });

    // Clean up and close the server after all tests
    afterAll(async () => {
        try {
            await deleteUserById(userId); // Ensure cleanup in case test failed
        } catch (err) {
            console.warn("Cleanup failed:", err.message);
        }
        server.close();
    });
});
