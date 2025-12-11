import Project from "../models/project.model.js";
import Ticket from "../models/ticket.model.js";
import { validateObjectId } from "../util/utils.js";

export const getUserTickets = async (req, res) => {

    const { userId } = req.params;

    try {

        const tickets = await Ticket.find({ assignees: userId })
            .populate({ path: "projectId", select: { title: 1 } })
            .populate({ path: "type", select: { __v: 0 } })
            .populate({ path: "createdBy", select: { firstName: 1, lastName: 1 } })
            .populate({ path: "assignees", select: { firstName: 1, lastName: 1 } });

        return res.json(tickets);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server issue" });
    }

};

export const getProjectTickets = async (req, res) => {
    const { projectId } = req.params;

    try {
        const userId = req.user._id;

        // Ensure the user belongs to the project
        const project = await Project.findById(projectId);

        if (!project.assignees.includes(userId)) {
            return res.status(403).json({ message: "Not authorized to get project tickets" });
        }

        const tickets = await Ticket.find({ projectId })
            .populate({ path: "projectId", select: { title: 1 } })
            .populate({ path: "createdBy", select: { firstName: 1, lastName: 1 } })
            .populate({ path: "type", select: { __v: 0 } })
            .populate({ path: "assignees", select: { firstName: 1, lastName: 1 }, populate: { path: "roleId", select: { _id: 0, name: 1 } } });

        return res.json(tickets);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server issue" });
    }
};

export const getTicketInfo = async (req, res) => {
    const { ticketId } = req.params;

    try {
        const userId = req.user._id;

        // Ensure the ticket exist
        const ticket = await Ticket.findOne({ _id: ticketId })
            .populate({ path: "projectId", select: { title: 1 } })
            .populate({ path: "type", select: { __v: 0 } })
            .populate({ path: "createdBy", select: { firstName: 1, lastName: 1 } })
            .populate({ path: "assignees", select: { firstName: 1, lastName: 1 } });

        if (!ticket) {
            return res.status(403).json({ message: "Ticket does not exist" });
        }

        // Ensure the user belongs to the project (protect against null project)
        const project = await Project.findById(ticket.projectId);

        if (!project || !project.assignees.includes(userId)) {
            return res.status(403).json({ message: "Not authorized to view the ticket" });
        }

        return res.json(ticket);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server issue" });
    }
};

export const createTicket = async (req, res) => {
    const { projectId } = req.params;
    const {
        type,
        title,
        description,
        status,
        assignees,
        estimatedTime,
        estimatedTimeUnit
    } = req.body;

    try {
        console.log('createTicket invoked. req.body:', req.body);
        console.log('createTicket req.file:', req.file);
        const userId = req.user._id;

        // Ensure the user belongs to the project
        const project = await Project.findOne({ _id: projectId });

        if (!project.assignees.includes(userId)) {
            return res.status(403).json({ message: "Not authorized to add tickets to a project" });
        }

        // Normalize assignees: handle FormData single string, repeated fields, or JSON string
        let normalizedAssignees = assignees;
        if (normalizedAssignees && typeof normalizedAssignees === "string") {
            // Try JSON parse for array-like string
            if (normalizedAssignees.trim().startsWith("[")) {
                try {
                    normalizedAssignees = JSON.parse(normalizedAssignees);
                } catch (e) {
                    // fallback to single string array
                    normalizedAssignees = [normalizedAssignees];
                }
            } else {
                normalizedAssignees = [normalizedAssignees];
            }
        }

        const newTicket = await Ticket.create({ projectId, type, title, description, status, assignees: normalizedAssignees, estimatedTime, estimatedTimeUnit, createdBy: userId });
        if (req.file) {
    newTicket.attachments.push({
        fileName: req.file.filename,
        filePath: req.file.path
    });
    await newTicket.save(); // save the attachment info
}


        const ticket = await Ticket.findById(newTicket._id)
            .populate({ path: "projectId", select: { title: 1 } })
            .populate({ path: "type", select: { __v: 0 } })
            .populate({ path: "createdBy", select: { firstName: 1, lastName: 1 } })
            .populate({ path: "assignees", select: { firstName: 1, lastName: 1 } });

        return res.json(ticket);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server issue" });
    }
};

export const updateTicket = async (req, res) => {
    const { projectId } = req.params;

    try {
        console.log('updateTicket invoked. req.body:', req.body);
        console.log('updateTicket req.file:', req.file);
        const userId = req.user._id;

        // Validate ticket id
        const isValidId = validateObjectId(req.body._id, "Invalid ticket id", res);
        if (!isValidId) return;

        // Ensure the user belongs to the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(403).json({ message: "Project does not exist" });
        }

        if (!project.assignees || !project.assignees.includes(userId)) {
            return res.status(403).json({ message: "Not authorized to add tickets to a project" });
        }


        // Normalize assignees similar to create flow
        let body = { ...req.body };
        if (body.assignees && typeof body.assignees === "string") {
            if (body.assignees.trim().startsWith("[")) {
                try {
                    body.assignees = JSON.parse(body.assignees);
                } catch (e) {
                    body.assignees = [body.assignees];
                }
            } else {
                body.assignees = [body.assignees];
            }
        }

        const ticketToUpdate = await Ticket.findById(req.body._id);
        if (!ticketToUpdate) {
            return res.status(403).json({ message: "Ticket does not exist" });
        }

        // Whitelist fields that are safe to update to avoid overwriting protected fields
        const allowedFields = [
            "title",
            "type",
            "description",
            "status",
            "assignees",
            "estimatedTime",
            "estimatedTimeUnit",
            "updatedOn"
        ];

        const updateData = {};
        allowedFields.forEach((f) => {
            if (body[f] !== undefined) updateData[f] = body[f];
        });
        updateData.updatedOn = Date.now();

        // Apply only whitelisted updates
        Object.assign(ticketToUpdate, updateData);

        if (req.file) {
            ticketToUpdate.attachments.push({
                fileName: req.file.filename,
                filePath: req.file.path
            });
        }

        await ticketToUpdate.save();


        const updatedTicket = await Ticket.findById(req.body._id)
            .populate({ path: "projectId", select: { title: 1 } })
            .populate({ path: "type", select: { __v: 0 } })
            .populate({ path: "createdBy", select: { firstName: 1, lastName: 1 } })
            .populate({ path: "assignees", select: { firstName: 1, lastName: 1 } });

        return res.json(updatedTicket);


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server issue" });
    }
};

export const deleteTicket = async (req, res) => {
    const { ticketId } = req.params;

    try {
        const result = await Ticket.deleteOne({ _id: ticketId });

        if (result.deletedCount === 0) {
            return res.status(403).json({ message: "Ticket does not exist" });
        }

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server issue" });
    }
};