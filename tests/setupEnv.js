require("dotenv").config({ quiet: true });

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "secret-khusus-test";
process.env.API_KEY = process.env.API_KEY || "api-key-khusus-test";