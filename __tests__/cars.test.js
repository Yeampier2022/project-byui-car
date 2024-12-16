const request = require("supertest");
const { app, startServer, connectToDatabase } = require("../unitTest");
const Car = require("../models/carModel"); // Assuming this is your Mongoose model for cars.

describe("Cars Routes", () => {
    let agent;
    let carId;
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
            _id: '675f5a4967f3af115a3136f9',
            role: 'admin',
            email: 'admin@example.com',
            githubId: 'mockGithubId',
            displayName: 'Admin User',
            avatarUrl: 'https://example.com/avatar.jpg',
        });
    });

    it("should get a list of cars", async () => {
        const response = await agent.get("/cars");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("should create a new car", async () => {
        const newCar = {
            make: "Toyota",
            model: "Corolla",
            year: 2022,
            engineType: "Petrol",
            VIN: "1HGBH41JXMN109186",
            category: "Sedan",
        };

        const response = await agent.post("/cars").send(newCar);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Car created");
        expect(response.body).toHaveProperty("id");
        carId = response.body.id;
    });

    it("should get a car by ID", async () => {
        const response = await agent.get(`/cars/${carId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("_id", carId);
    });

    it("should update a car by ID", async () => {
        const updatedCar = {
            model: "Corolla Hybrid",
        };

        const response = await agent.put(`/cars/${carId}`).send(updatedCar);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Car updated");
    });

    it("should delete a car by ID", async () => {
        const response = await agent.delete(`/cars/${carId}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Car deleted");
    });

    it("should return 404 for a non-existent car", async () => {
        const response = await agent.get(`/cars/${carId}`);
        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Car not found");
    });

    // Close the server after all tests
    afterAll(() => {
        server.close();
    });
});
