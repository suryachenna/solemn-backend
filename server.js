const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Solemn AI backend is alive 🚀"
    });
});

app.get("/ping", (req, res) => {
    res.json({
        command: "ping",
        response: "pong"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Solemn running on port ${PORT}`);
});