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

app.get("/health-ms",  async (req,res) => {
    try { 
        const response = await axios.get("http://ms-python:8000/health", {
        });
        return res.status(200).json({"message":"ok", response: response.data})
    } catch (err) {
        return res.status(500).json({"message":"erreur", err })
    }
})


app.get("/plants", async (req, res) => {
    try { 
        const response = await axios.get("http://ms-python:8000/plants", {
        });
        return res.status(200).json({ success: true, response: response.data })
    } catch (err) {
        return res.status(500).json({ success: false, message: "erreur", err })
    }
});

app.get("/regions", async (req, res) => {
    try { 
        const response = await axios.get("http://ms-python:8000/regions", {
        });
        return res.status(200).json({ success: true, response: response.data })
        } catch (err) {
            return res.status(500).json({ success: false, message: "erreur", err })
        }
});

app.get("/network", async (req, res) => {
    try { 
        const response = await axios.get("http://ms-python:8000/network", {
        });
        return res.status(200).json({ success: true, response: response.data })
    } catch (err) {
            return res.status(500).json({ success: false, message: "erreur", err })
    }
});

app.post("/simulate", async (req, res) => {
    return res.status(200).json({ success: true, message: "Simulation pas encore opé mais la route répond." })
});

app.listen(port, () => {
    console.log(`Gateway service listening at http://localhost:${port}`);
});