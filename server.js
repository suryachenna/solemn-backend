const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Solemn AI backend is alive 🚀"
    });
});

app.listen(PORT, () => {
    console.log(`Solemn running on port ${PORT}`);
});