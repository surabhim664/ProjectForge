const express = require("express");
const cors = require("cors");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


// Test backend
app.get("/", (req, res) => {
    res.json({
        message: "ProjectForge backend is running 🚀"
    });
});


// Test MySQL
app.get("/api/test-db", (req, res) => {

    db.query("SELECT 1 AS result", (err, results) => {

        if (err) {
            console.error("Database error:", err);

            return res.status(500).json({
                message: "Database connection failed"
            });
        }

        res.json({
            message: "MySQL is connected successfully 🎉",
            result: results
        });
    });

});


const PORT = 5000;

app.listen(PORT, () => {
    console.log(`ProjectForge server running on http://localhost:${PORT}`);
});