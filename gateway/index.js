const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.GATEWAY_PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to energIA API Gateway!"
    });
});

app.get("/health-ms", async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to energIA API Gateway!"
    });
});


app.get("/plants", async (req, res) => {

});

app.get("/regions", async (req, res) => {

});

app.get("/network", async (req, res) => {

});

app.post("/simulate", async (req, res) => {

});

app.listen(port, () => {
    console.log(`Gateway service listening at http://localhost:${port}`);
});