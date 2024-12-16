const request = require("supertest");
const { app, startServer, connectToDatabase } = require("../unitTest");

describe("Cars Routes - Authentication and Authorization Errors", () => {
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

    it("should return 401 for unauthenticated access to cars", async () => {
        // Simulate unauthenticated access
        const response = await request(app).get("/cars");
        expect(response.status).toBe(401);
        expect(response.text).toBe("Unauthorized");
    });

    it("should return 403 for non-owner trying to update a car", async () => {
        // Simulate login as client (non-owner)
        await agent.post("/test-login").send({
            _id: '675f5a4967f3af115a3136f8',
            role: 'client',
            email: 'client@example.com',
            githubId: 'mockGithubIdClient',
            displayName: 'Client User',
            avatarUrl: 'https://example.com/avatar.jpg',
        });

        const updatedCar = { model: "Corolla Hybrid" };

        // Attempt to update a car without ownership
        const response = await agent.put('/cars/6755242a0ea1e2676369eeb4').send(updatedCar);
        expect(response.status).toBe(403);
        expect(response.text).toBe("Forbidden: You do not own this car.");
    });

    it("should return 404 for accessing a non-existent car", async () => {
        const response = await agent.get('/cars/6751242a0ea1e2676369eeb1');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Car not found");
    });

    it("should return 403 when a non-admin tries to delete a car", async () => {
        // Simulate login as client (non-admin)
        await agent.post("/test-login").send({
            _id: '675f5a4967f3af115a3136f8',
            role: 'client',
            email: 'client@example.com',
            githubId: 'mockGithubIdClient',
            displayName: 'Client User',
            avatarUrl: 'https://example.com/avatar.jpg',
        });

        const response = await agent.delete('/cars/6755242a0ea1e2676369eeb4');
        expect(response.status).toBe(403);
        expect(response.text).toBe("Forbidden: You do not own this car.");
    });

    it("should return 403 when trying to delete a car without admin or owner access", async () => {
        // Simulate login as client (non-owner, non-admin)
        await agent.post("/test-login").send({
            _id: '675f5a4967f3af115a3136f8',
            role: 'client',
            email: 'client@example.com',
            githubId: 'mockGithubIdClient',
            displayName: 'Client User',
            avatarUrl: 'https://example.com/avatar.jpg',
        });

        const response = await agent.delete('/cars/6755242a0ea1e2676369eeb4');
        expect(response.status).toBe(403);
        expect(response.text).toBe("Forbidden: You do not own this car.");
    });

    // Close the server after all tests
    afterAll(() => {
        server.close();
    });
});
