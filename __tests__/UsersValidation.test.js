const request = require("supertest");
const { app, startServer, connectToDatabase } = require("../unitTest");
const User = require("../models/userModel");

describe("Users Validation Errors", () => {
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
            _id: 'mockAdminId',
            role: 'admin',
            email: 'mockAdmin@gmail.com',
            displayName: 'Mock Admin',
        });
    });

    describe("Validation Errors on User Updates", () => {
        it("should return validation error when invalid fields are present in the request body", async () => {
            const updateUser = {
                name: "Updated Name",
                invalidField: "This should not be here"
            };

            const response = await agent
                .put("/users/675f5a6867f3af115a3136f7")
                .send(updateUser);

            expect(response.status).toBe(422);
            expect(response.body.error).toContain("Invalid fields: invalidField");
        });

        it("should return validation error when 'email' is invalid", async () => {
            const updateUser = {
                email: "invalid-email-format",
            };

            const response = await agent
                .put("/users/675f5a6867f3af115a3136f7")
                .send(updateUser);

            expect(response.status).toBe(422);
            expect(response.body.error).toContain("Invalid email format.");
        });

        it("should return validation error when 'role' is invalid", async () => {
            const updateUser = {
                role: "superuser", // Invalid role
            };

            const response = await agent
                .put("/users/675f5a6867f3af115a3136f7")
                .send(updateUser);

            expect(response.status).toBe(422);
            expect(response.body.error).toContain("Invalid role.");
        });

        it("should return 400 when request body is empty", async () => {
            const response = await agent
                .put("/users/675f5a6867f3af115a3136f7")
                .send({}); // Empty body

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("Request body cannot be empty.");
        });

        it("should return 400 when no changes are detected", async () => {
            const user = {
                name: "Existing User",
                email: "existinguser@gmail.com",
                role: "client",
            };

            // Mock the user exists and has the same data
            jest.spyOn(User, "getUserById").mockResolvedValue(user);

            const response = await agent
                .put("/users/675f5a6867f3af115a3136f7")
                .send(user);

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("No changes detected. Update request ignored.");
        });

        it("should return 404 when updating a non-existent user", async () => {
            const updateUser = {
                name: "Updated Name",
            };

            // Mock user not found
            jest.spyOn(User, "getUserById").mockResolvedValue(null);

            const response = await agent
                .put("/users/675f5a6867f3af115a3139f7") // Non-existent ID
                .send(updateUser);

            expect(response.status).toBe(404);
            expect(response.body.error).toContain("User with ID 675f5a6867f3af115a3139f7 not found.");
        });
    });

    describe("Validation Errors on User Deletion", () => {
        it("should return 404 when deleting a non-existent user", async () => {
            // Mock user not found
            jest.spyOn(User, "getUserById").mockResolvedValue(null);

            const response = await agent
                .delete("/users/675f5a6867f3af115a3139f7");

            expect(response.status).toBe(404);
            expect(response.body.error).toContain("User not found");
        });
    });

    describe("Validation Errors on User Retrieval", () => {
        it("should return 404 when retrieving a non-existent user", async () => {
            // Mock user not found
            jest.spyOn(User, "getUserById").mockResolvedValue(null);

            const response = await agent
                .get("/users/675f5a6867f3af115a3139f7");

            expect(response.status).toBe(404);
            expect(response.body.error).toContain("User not found");
        });
    });

    // Close server after all tests
    afterAll(() => {
        server.close();
    });
});
