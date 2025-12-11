import express from "express";
import { addProject, deleteProject, getUserProjects, updateProject, getProjectInfo, getProjectStat } from "../controllers/project.controller.js";
import { checkUserPermissions, validateParamId, validateResource } from "../middleware/middleware.js";
import { createProjectSchema } from "../schema/validation.schema.js";
import upload from "../middleware/upload.js";
import { Permissions } from "../util/utils.js";
import { addProjectAttachment } from "../controllers/project.controller.js";

const router = express.Router();

router.get("/", getUserProjects);
router.get("/stat/:projectId", [validateParamId("projectId")], getProjectStat);
router.get("/:projectId", validateParamId("projectId"), getProjectInfo);

router.post("/",
    upload.single("attachment"),
    checkUserPermissions("projects", Permissions.canManageProjects),
    validateResource(createProjectSchema),
    addProject);

router.patch("/:projectId",
    upload.single("attachment"),
    checkUserPermissions("projects", Permissions.canManageProjects),
    validateResource(createProjectSchema),
    validateParamId("projectId"),
    updateProject);

router.delete("/:projectId",
    [checkUserPermissions("projects", Permissions.canManageProjects), validateParamId("projectId")],
    deleteProject);
// Upload attachment to project
router.post("/:projectId/attachment",
    upload.single("attachment"),
    validateParamId("projectId"),
    addProjectAttachment
);


export default router;