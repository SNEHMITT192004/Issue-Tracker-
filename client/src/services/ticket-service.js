import useAuthStore from "@/hooks/useAuth";

const getUserTickets = () => {
    const userProfile = useAuthStore.getState().userProfile;
    return {
        method: "get",
        url: `/ticket/user/${userProfile._id}`
    };
};

const getProjectTickets = (projectId) => {
    return {
        method: "get",
        url: `/ticket/project/${projectId}`
    };
};

const getTicketInfo = (ticketId) => {
    return {
        method: "get",
        url: `/ticket/${ticketId}`
    };
};

const createTicket = (projectId, data, file) => {
    const formData = new FormData();
    
    // Append all form fields
    Object.keys(data).forEach(key => {
        const value = data[key];
        // Skip undefined or null
        if (value === undefined || value === null) return;

        // If the value is an array, append each item separately (multipart arrays)
        if (Array.isArray(value)) {
            value.forEach((item) => {
                formData.append(key, item);
            });
            return;
        }

        // If value is a plain object (e.g. populated `createdBy`), skip it
        // Files are handled separately; we only want primitive/string values here
        if (typeof value === 'object' && !(value instanceof File)) {
            return;
        }

        formData.append(key, value);
    });
    
    // Append file if provided
    if (file) {
        formData.append("attachment", file);
    }
    
    return {
        method: "post",
        url: `/ticket/project/${projectId}`,
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    };
};

const updateTicket = (projectId, data, file) => {
    const formData = new FormData();
    
    // Append all form fields
    Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
            data[key].forEach((item) => {
                // Append repeated key for arrays so multer parses into array
                formData.append(key, item);
            });
        } else {
            formData.append(key, data[key]);
        }
    });
    
    // Append file if provided
    if (file) {
        formData.append("attachment", file);
    }
    
    return {
        method: "patch",
        url: `/ticket/project/${projectId}`,
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    };
};

const deleteTicket = (ticketId) => {
    return {
        method: "delete",
        url: `/ticket/${ticketId}`
    };
};


const TicketService = {
    getProjectTickets,
    getTicketInfo,
    getUserTickets,
    createTicket,
    updateTicket,
    deleteTicket
};

export default TicketService;