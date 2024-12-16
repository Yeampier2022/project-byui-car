const request = require("supertest");
const { app, startServer, connectToDatabase } = require("../unitTest");

describe("Car Validation Errors", () => {
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
            _id: '675515720c8c05de9d7dee26',
            role: 'admin',
            email: 'mock@gmail.com',
            githubId: 'mockGithubId',
            displayName: 'Mock User',
            avatarUrl: 'https://example.com/avatar.jpg',
        });
    });

    it("should return validation error when 'make' is missing", async () => {
        const newCar = {
            model: 'Model S',
            year: 2020,
            engineType: 'Electric',
            VIN: '5YJ3E1EA7KF313542',
            category: 'Sedan',
        };

        const response = await agent
            .post("/cars")
            .send(newCar);

        expect(response.status).toBe(422);
        expect(response.body.error).toContain("Make is required.");
    });

    it("should return validation error when 'VIN' is not 17 characters", async () => {
        const newCar = {
            make: 'Tesla',
            model: 'Model S',
            year: 2020,
            engineType: 'Electric',
            VIN: '12345',
            category: 'Sedan',
        };

        const response = await agent
            .post("/cars")
            .send(newCar);

        expect(response.status).toBe(422);
        expect(response.body.error).toContain("VIN must be 17 characters long.");
    });

    it("should return validation error when 'category' is invalid", async () => {
        const newCar = {
            make: 'Tesla',
            model: 'Model S',
            year: 2020,
            engineType: 'Electric',
            VIN: '5YJ3E1EA7KF313542',
            category: 'Motorcycle', // Invalid category
        };

        const response = await agent
            .post("/cars")
            .send(newCar);

        expect(response.status).toBe(422);
        expect(response.body.error).toContain("Category must be one of: Sedan, SUV, Truck, Coupe, Hatchback, Convertible.");
    });

    it("should return validation error when extra fields are present in the request body", async () => {
        const newCar = {
            make: 'Tesla',
            model: 'Model 3',
            year: 2021,
            engineType: 'Electric',
            VIN: '5YJ3E1EA7KF313543',
            category: 'Sedan',
            extraField: 'extraValue' // Invalid field
        };

        const response = await agent
            .post("/cars")
            .send(newCar);

        expect(response.status).toBe(422);
        expect(response.body.error).toContain("Invalid fields: extraField");
    });

    it("should return validation error when the request body is empty", async () => {
        const response = await agent
            .post("/cars")
            .send({}); // Empty body

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("Request body cannot be empty.");
    });

    // For updating cars
    it("should return validation error when no fields are provided for update", async () => {
        const response = await agent
            .put(`/cars/6755242a0ea1e2676369eeb4`) // Existing car ID
            .send({}); // No fields provided

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("Request body cannot be empty.");
    });

    it("should return validation error when updating a non-existent car", async () => {
        const updatedCar = {
            model: 'Updated Model S',
        };

        const response = await agent
            .put(`/cars/675e5904ac37d999c486e3c0`) // Non-existent car ID
            .send(updatedCar);

        expect(response.status).toBe(404);
        expect(response.body.error).toContain("Car with ID 675e5904ac37d999c486e3c0 not found.");
    });

    // Close server after all tests
    afterAll(() => {
        server.close();
    });
});
