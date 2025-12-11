const getMyProjects = () => {
    return {
        url: `/project`,
        method: "get"
    };
};

const createProject = (data, file) => {
    const formData = new FormData();
    
    // Append all form fields
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
            value.forEach((item) => {
                formData.append(key, item);
            });
            return;
        }

        // Skip plain objects (populated fields) — only append primitives/files
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
        url: "/project",
        data: formData,
        method: "post",
        headers: {
            "Content-Type": "multipart/form-data"
        }
    };
};

const updateProject = (data, projectId, file) => {
    const formData = new FormData();
    
    // Append all form fields
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
            value.forEach((item) => {
                formData.append(key, item);
            });
            return;
        }

        // Skip plain objects (populated fields) — only append primitives/files
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
        url: `/project/${projectId}`,
        data: formData,
        method: "patch",
        headers: {
            "Content-Type": "multipart/form-data"
        }
    };
};

const getProjectInfo = (projectId) => {
    return {
        method: "get",
        url: `/project/${projectId}`
    };
};

const deleteProject = (projectId) => {
    return {
        method: "delete",
        url: `/project/${projectId}`
    };
};

const getProjectStats = (projectId) => {
    return {
        method: "get",
        url: `/project/stat/${projectId}`
    };
};

const ProjectService = {
    getMyProjects,
    createProject,
    getProjectInfo,
    updateProject,
    deleteProject,
    getProjectStats
};

export default ProjectService;