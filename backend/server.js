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


// Public site configuration (no secrets are ever exposed).
app.get("/api/config", (req, res) => {

    const contactEmail = (process.env.CONTACT_EMAIL || "").trim();

    res.json({
        contactEmail: contactEmail
    });
});


// Save a generated project blueprint.
app.post("/api/projects", (req, res) => {

    const {
        title,
        idea,
        projectType,
        description,
        stack,
        features,
        tasks,
        chain,
        complexityScore,
        complexityLevel,
        estimatedTime
    } = req.body || {};

    if (!title || !idea) {
        return res.status(400).json({
            message: "Title and project idea are required."
        });
    }

    const sql = `
        INSERT INTO projects
            (title, idea, project_type, description, tech_stack, features, tasks,
             architecture, complexity_score, complexity_level, estimated_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        title,
        idea,
        projectType || "general",
        description || "",
        JSON.stringify(stack || []),
        JSON.stringify(features || []),
        JSON.stringify(tasks || []),
        JSON.stringify(chain || []),
        complexityScore || 0,
        complexityLevel || "Beginner",
        estimatedTime || ""
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error("Save project error:", err);

            return res.status(500).json({
                message: "Could not save the project."
            });
        }

        res.status(201).json({
            message: "Project saved ✔",
            id: result.insertId
        });
    });

});


// List all saved projects (newest first).
app.get("/api/projects", (req, res) => {

    db.query(
        `SELECT id, title, idea, project_type, description, tech_stack, features, tasks,
                architecture, complexity_score, complexity_level, estimated_time, created_at
         FROM projects
         ORDER BY created_at DESC, id DESC`,
        (err, rows) => {

            if (err) {
                console.error("List projects error:", err);

                return res.status(500).json({
                    message: "Could not load projects."
                });
            }

            res.json(rows);
        }
    );

});


// Get a single saved project.
app.get("/api/projects/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            message: "Invalid project id."
        });
    }

    db.query(
        `SELECT id, title, idea, project_type, description, tech_stack, features, tasks,
                architecture, complexity_score, complexity_level, estimated_time, created_at
         FROM projects
         WHERE id = ?`,
        [id],
        (err, rows) => {

            if (err) {
                console.error("Get project error:", err);

                return res.status(500).json({
                    message: "Could not load the project."
                });
            }

            if (!rows.length) {
                return res.status(404).json({
                    message: "Project not found."
                });
            }

            res.json(rows[0]);
        }
    );

});


// Delete a saved project.
app.delete("/api/projects/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            message: "Invalid project id."
        });
    }

    db.query(
        "DELETE FROM projects WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                console.error("Delete project error:", err);

                return res.status(500).json({
                    message: "Could not delete the project."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Project not found."
                });
            }

            res.json({
                message: "Project deleted ✔"
            });
        }
    );

});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`ProjectForge server running on http://localhost:${PORT}`);
});