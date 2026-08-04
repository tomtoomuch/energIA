// Import the express library
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Define a simple route
app.get('/', (req, res) => {
  res.status(200).json(
    {
        success: true,
        message: "Welcome to energIA API Gateway !"
    }
  );
});

app.listen(port, () => {
  console.log(`Gateway service listening at http://localhost:${port}`);
});