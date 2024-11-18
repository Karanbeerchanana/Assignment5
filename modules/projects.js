require('pg');
require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

// Set up Sequelize to point to our PostgreSQL database
const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    port: process.env.PGPORT || 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });

const Sector = sequelize.define(
  "Sector",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sector_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    feature_img_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    summary_short: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    intro_short: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    impact: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    original_source_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sector_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Sectors",
        key: "id",
      },
    },
  },
  {
    timestamps: false,
  }
);

Project.belongsTo(Sector, { foreignKey: "sector_id" });
Sector.hasMany(Project, { foreignKey: "sector_id" });

function initialize() {
  return sequelize
    .sync()
    .then(() => {
      console.log("Database synced successfully.");
    })
    .catch((error) => {
      console.error("Error syncing database:", error);
      throw error;
    });
}

function getAllProjects() {
  return Project.findAll({
    include: [Sector],
  })
    .then((projects) => {
      return projects;
    })
    .catch((error) => {
      console.error("Error retrieving projects:", error);
      throw error;
    });
}

function getProjectById(projectId) {
  return Project.findAll({
    where: { id: projectId },
    include: [Sector],
  })
    .then((projects) => {
      if (projects.length > 0) {
        return projects[0];
      } else {
        throw new Error("Unable to find requested project");
      }
    })
    .catch((error) => {
      console.error("Error finding project by ID:", error);
      throw error;
    });
}

function getProjectsBySector(sector) {
  return Project.findAll({
    include: [Sector],
    where: {
      "$Sector.sector_name$": {
        [Sequelize.Op.iLike]: `%${sector}%`,
      },
    },
  })
    .then((projects) => {
      if (projects.length > 0) {
        return projects;
      } else {
        throw new Error("Unable to find requested projects");
      }
    })
    .catch((error) => {
      console.error("Error finding projects by sector:", error);
      throw error;
    });
}

initialize()
  .then(() => {
    console.log("Projects initialized.");

    return getAllProjects();
  })
  .then((projects) => {
    console.log("All Projects:", projects);

    return getProjectById(9);
  })
  .then((project) => {
    console.log("Project 9:", project);

    return getProjectsBySector("Electricity");
  })
  .then((sectorProjects) => {
    console.log("Projects in the Electricity sector:", sectorProjects);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

function getAllSectors() {
  return Sector.findAll()
    .then((sectors) => sectors)
    .catch((error) => {
      console.error("Error retrieving sectors:", error);
      throw error;
    });
}
function addProject(projectData) {
  return Project.create({
    title: projectData.title,
    feature_img_url: projectData.feature_img_url,
    summary_short: projectData.summary_short,
    intro_short: projectData.intro_short,
    impact: projectData.impact,
    original_source_url: projectData.original_source_url,
    sector_id: projectData.sector_id,
  })
    .then(() => {
      console.log("Project added successfully");
    })
    .catch((error) => {
      console.error("Error adding project:", error);
      throw error;
    });
}

function editProject(id, projectData) {
  return Project.update(
    {
      title: projectData.title,
      feature_img_url: projectData.feature_img_url,
      summary_short: projectData.summary_short,
      intro_short: projectData.intro_short,
      impact: projectData.impact,
      original_source_url: projectData.original_source_url,
      sector_id: projectData.sector_id,
    },
    {
      where: { id: id },
    }
  )
    .then(() => {
      console.log("Project updated successfully");
    })
    .catch((error) => {
      console.error("Error updating project:", error);
      throw error;
    });
}
// In projects.js
function deleteProject(id) {
  return Project.destroy({
    where: { id: id },
  })
    .then(() => {
      console.log("Project deleted successfully");
    })
    .catch((error) => {
      console.error("Error deleting project:", error);
      throw error;
    });
}

// Export the function
module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  addProject,
  editProject,
  deleteProject,
  getAllSectors, // Ensure this function is exported
};
