const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.GATEWAY_PORT || 3000;

const PYTHON_API_URL =
  process.env.PYTHON_SERVICE_URL || "http://ms-python:8000";

app.use(express.json());


app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to energIA API Gateway!"
  });
});


app.get("/plants", async (req, res) => {
  try {
    const response = await axios.get(
      `${PYTHON_API_URL}/plants`
    );

    return res.status(response.status).json(response.data);

  } catch (error) {
    return handlePythonError(error, res);
  }
});


app.get("/regions", async (req, res) => {
  try {
    const response = await axios.get(
      `${PYTHON_API_URL}/regions`
    );

    return res.status(response.status).json(response.data);

  } catch (error) {
    return handlePythonError(error, res);
  }
});


function handlePythonError(error, res) {
  const status = error.response?.status || 500;

  const detail =
    error.response?.data || {
      message: "Impossible de contacter le service Python"
    };

  return res.status(status).json({
    success: false,
    error: detail
  });
}


app.listen(port, () => {
  console.log(
    `Gateway service listening at http://localhost:${port}`
  );
});