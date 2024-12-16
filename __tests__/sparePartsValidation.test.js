const request = require("supertest");
const { app, startServer, connectToDatabase } = require("../unitTest");

describe("Spare Parts Validation Errors", () => {
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

    it("should return validation error when 'name' is missing", async () => {
        const newSparePart = {
            description: 'Durable brake pads designed for safe and reliable stopping performance.',
            price: 59.99,
            stock: 120,
            compatibleCars: ['SUV', 'Truck', 'Sedan'],
            category: 'Car Brake Components',
        };

        const response = await agent
            .post("/spare-parts")
            .send(newSparePart);
        
        expect(response.status).toBe(422);
        expect(response.body.error).toContain("Name is required.");
    });

    it("should return validation error when 'price' is negative", async () => {
        const newSparePart = {
            name: 'Brake Pads',
            description: 'Durable brake pads designed for safe and reliable stopping performance.',
            price: -59.99,
            stock: 120,
            compatibleCars: ['SUV', 'Truck', 'Sedan'],
            category: 'Car Brake Components',
        };

        const response = await agent
            .post("/spare-parts")
            .send(newSparePart);
        
        expect(response.status).toBe(422);
        expect(response.body.error).toContain("Price must be a non-negative number.");
    });

    it("should return validation error when 'compatibleCars' contains invalid car type", async () => {
        const newSparePart = {
            name: 'Brake Pads',
            description: 'Durable brake pads designed for safe and reliable stopping performance.',
            price: 59.99,
            stock: 120,
            compatibleCars: ['SUV', 'Truck', 'Motorcycle'],
            category: 'Car Brake Components',
        };

        const response = await agent
            .post("/spare-parts")
            .send(newSparePart);
        
        expect(response.status).toBe(422);
        expect(response.body.error).toContain("Compatible cars must be one of: Sedan, SUV, Truck, Coupe, Hatchback, Convertible.");
    });

    it("should return validation error when 'category' is not provided", async () => {
        const newSparePart = {
            name: 'Brake Pads',
            description: 'Durable brake pads designed for safe and reliable stopping performance.',
            price: 59.99,
            stock: 120,
            compatibleCars: ['SUV', 'Truck', 'Sedan'],
        };

        const response = await agent
            .post("/spare-parts")
            .send(newSparePart);
        
        expect(response.status).toBe(422);
        expect(response.body.error).toContain("Category is required.");
    });

    it("should return validation error when extra fields are present in the request body", async () => {
        const newSparePart = {
            name: 'Brake Pads',
            description: 'Durable brake pads designed for safe and reliable stopping performance.',
            price: 59.99,
            stock: 120,
            compatibleCars: ['SUV', 'Truck', 'Sedan'],
            category: 'Car Brake Components',
            extraField: 'extraValue'
        };

        const response = await agent
            .post("/spare-parts")
            .send(newSparePart);
        
        expect(response.status).toBe(422);
        expect(response.body.error).toContain("Invalid fields: ");
    });

    it("should return validation error when the request body is empty", async () => {
        const response = await agent
            .post("/spare-parts")
            .send({}); // Empty body
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain("Request body cannot be empty.");
    });

    // For updating spare parts
    it("should return validation error when no fields are provided for update", async () => {
        const response = await agent
            .put(`/spare-parts/675526a65147b661d631771f`) // Existing part ID
            .send({name : 'Brake Pads'});

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("No changes detected. Update request ignored.");
    });

    it("should return validation error when updating a non-existent spare part", async () => {
        const updatedSparePart = {
            description: 'Updated brake pads.',
        };

        const response = await agent
            .put(`/spare-parts/675526a65147b661d631779f`) // Non-existent part ID
            .send(updatedSparePart);
        
        expect(response.status).toBe(404);
        expect(response.body.error).toContain("Spare part with ID 675526a65147b661d631779f not found.");
    });

    // Close server after all tests
    afterAll(() => {
        server.close();
    });
});
