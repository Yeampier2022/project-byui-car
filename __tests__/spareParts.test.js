const request = require("supertest");
const { app, startServer, connectToDatabase } = require("../unitTest");

describe("Spare Parts Routes", () => {
    let agent;
    let id;
    let server;

    // Start the server before tests and ensure it stops after
    beforeAll(async () => {
        // Connect to the database
        await connectToDatabase();
        
        // Start the server and store the server instance
        server = await startServer();
        
        // Use agent for maintaining sessions
        agent = request.agent(app);

        // Perform login before each test
        await agent.post("/test-login").send({
            _id: 'mockUserId',
            role: 'admin',
            email: 'mock@gmail.com',
            githubId: 'mockGithubId',
            displayName: 'Mock User',
            avatarUrl: 'https://example.com/avatar.jpg',
        });
    });

    it("should get all spare parts", async () => {
        const response = await agent.get("/spare-parts");
        expect(response.status).toBe(200);
    });

    it("should create a new spare part", async () => {
        const newSparePart = {
            name: 'Brake Pads',
            description: 'Durable brake pads designed for safe and reliable stopping performance.',
            price: 59.99,
            stock: 120,
            compatibleCars: ['SUV', 'Truck', 'Sedan'],
            category: 'Car Brake Components',
        };

        const response = await agent
            .post("/spare-parts")
            .send(newSparePart);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Spare Part created");
        expect(response.body).toHaveProperty("id");
        id = response.body.id;
    });

    it("should get a single spare part by ID", async () => {
        const response = await agent.get(`/spare-parts/${id}`);
        expect(response.status).toBe(200);
    });

    it("should update an existing spare part", async () => {
        const updatedSparePart = {
            description: 'SUPER Durable brake pads designed for safe and reliable stopping performance.'
        };

        const response = await agent
            .put(`/spare-parts/${id}`)
            .send(updatedSparePart);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Spare Part updated");
    });

    it("should delete a spare part", async () => {
        const response = await agent.delete(`/spare-parts/${id}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Spare Part deleted");
    });

    // Close server after all tests
    afterAll(() => {
        server.close();
    });
});
