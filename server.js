
/********************************************************************************
 * WEB322 – Assignment 05
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Karanbeer Chanana            Student ID: 147884225        Date: November 18, 2024
 *
 * Published URL: https://assignment5-omega.vercel.app/
 *
 ********************************************************************************/

const express = require("express");
const path = require("path");
const projectData = require("./modules/projects");
require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

// Middleware
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true })); // For form data handling
app.set("views", __dirname + "/views");

projectData
  .initialize()
  .then(() => {
    console.log("Projects initialized successfully.");

    // Home page
    app.get("/", (req, res) => {
      res.render("home");
    });

    // About page
    app.get("/about", (req, res) => {
      res.render("about");
    });

    // Solutions - Projects List
    app.get("/solutions/projects", (req, res) => {
      const sector = req.query.sector;

      if (sector) {
        projectData
          .getProjectsBySector(sector)
          .then((projects) => {
            if (projects.length > 0) {
              res.render("projects", { projects });
            } else {
              res.status(404).render("404", {
                message: `No projects found for sector: ${sector}`,
              });
            }
          })
          .catch((error) =>
            res.status(404).render("404", {
              message: `No projects found for sector: ${sector}`,
            })
          );
      } else {
        projectData
          .getAllProjects()
          .then((projects) => res.render("projects", { projects }))
          .catch((error) => res.status(500).send(error));
      }
    });

    // Solutions - Single Project by ID
    app.get("/solutions/projects/:id", (req, res) => {
      const projectId = parseInt(req.params.id);

      projectData
        .getProjectById(projectId)
        .then((project) => {
          if (project) {
            res.render("project", { project });
          } else {
            res
              .status(404)
              .render("404", { message: "Unable to find requested project" });
          }
        })
        .catch((error) =>
          res.render("404", { message: "Unable to find requested project" })
        );
    });
    // Solutions - Edit Project Form (GET)
    app.get("/solutions/editProject/:id", (req, res) => {
      const projectId = parseInt(req.params.id);

      // Retrieve the project and sectors for the form
      Promise.all([
        projectData.getProjectById(projectId),
        projectData.getAllSectors(),
      ])
        .then(([project, sectors]) => {
          if (project) {
            res.render("editProject", { project, sectors });
          } else {
            res
              .status(404)
              .render("404", { message: "Unable to find requested project" });
          }
        })
        .catch((err) => {
          res.status(500).render("500", { message: `Error: ${err.message}` });
        });
    });

    // Solutions - Process Edit Project Form (POST)
    app.post("/solutions/editProject", (req, res) => {
      const projectDataInput = req.body;
      const projectId = projectDataInput.id; // Assuming the form includes a hidden field for 'id'

      projectData
        .editProject(projectId, projectDataInput)
        .then(() => {
          res.redirect("/solutions/projects"); // Redirect to projects list after updating
        })
        .catch((err) => {
          res.render("500", { message: `Error: ${err.message}` });
        });
    });

    // Solutions - Add Project Form (GET)
    app.get("/solutions/addProject", (req, res) => {
      projectData
        .getAllSectors()
        .then((sectors) => {
          res.render("addProject", { sectors });
        })
        .catch((err) => {
          res.render("500", { message: `Error: ${err}` });
        });
    });
    // Solutions - Delete Project (POST)
    app.post("/solutions/deleteProject/:id", (req, res) => {
      const projectId = parseInt(req.params.id);

      projectData
        .deleteProject(projectId)
        .then(() => {
          res.redirect("/solutions/projects"); // Redirect to projects list after deletion
        })
        .catch((err) => {
          res.render("500", { message: `Error: ${err.message}` });
        });
    });

    // 404 Error Page
    app.use((req, res) => {
      res.status(404).render("404", {
        message: "I'm sorry, we're unable to find what you're looking for",
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize projects:", error);
  });
