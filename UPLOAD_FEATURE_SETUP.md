# 📎 File Upload Feature - Complete Setup Guide

## ✅ Implementation Complete!

Your TrackIt project now has a complete file upload feature for **Projects** and **Tickets**. Here's what was added:

---

## 🔧 Backend Changes

### 1. **Multer Middleware** (`server/middleware/upload.js`)
- ✅ Created with disk storage configuration
- ✅ Stores files in `/uploads` folder with timestamp + original filename
- ✅ File filter allows: PNG, JPG, JPEG, PDF only
- ✅ Converted to ES6 modules (`import/export`)

### 2. **Database Models**

#### Project Model (`server/models/project.model.js`)
```js
attachments: [
  {
    fileName: String,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now }
  }
]
```

#### Ticket Model (`server/models/ticket.model.js`)
```js
attachments: [
  {
    fileName: String,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now }
  }
]
```

### 3. **Controllers Updated**

#### Project Controller (`server/controllers/project.controller.js`)
- ✅ `addProject()` - handles file upload on project creation
- ✅ `updateProject()` - handles file upload on project update
- ✅ `addProjectAttachment()` - existing endpoint for standalone attachment upload

#### Ticket Controller (`server/controllers/ticket.controller.js`)
- ✅ `createTicket()` - handles file upload on ticket creation
- ✅ `updateTicket()` - handles file upload on ticket update

### 4. **Routes Updated**

#### Project Routes (`server/routes/project.route.js`)
```js
router.post("/", upload.single("attachment"), addProject);
router.patch("/:projectId", upload.single("attachment"), updateProject);
```

#### Ticket Routes (`server/routes/ticket.route.js`)
```js
router.post("/project/:projectId", upload.single("attachment"), createTicket);
router.patch("/project/:projectId", upload.single("attachment"), updateTicket);
```

### 5. **Static File Server** (`server/app.js`)
```js
app.use("/uploads", express.static("uploads"));
```
Now files are accessible at: `http://localhost:5000/uploads/filename.png`

---

## 🎨 Frontend Changes

### 1. **Ticket Service** (`client/src/services/ticket-service.js`)
- ✅ Updated `createTicket()` to accept file parameter
- ✅ Updated `updateTicket()` to accept file parameter
- ✅ Both methods now use `FormData` for multipart uploads
- ✅ File sent as `attachment` field

### 2. **Ticket Components**

#### CreateTicket.jsx
- ✅ Added `attachmentFile` state
- ✅ Passes file to service calls
- ✅ Clears file on modal close

#### TicketInfo.jsx
- ✅ Added file input field
- ✅ Displays selected file with green confirmation
- ✅ Shows existing attachments with download links
- ✅ Allowed file types: PNG, JPG, JPEG, PDF
- ✅ Download functionality for existing attachments

### 3. **Project Components**

#### Project Service (`client/src/services/project-service.js`)
- ✅ Updated `createProject()` to accept file parameter
- ✅ Updated `updateProject()` to accept file parameter
- ✅ Both methods now use `FormData` for multipart uploads

#### AddProject.jsx
- ✅ Added `attachmentFile` state
- ✅ Passes file to service calls
- ✅ Clears file on modal close
- ✅ File input field with validation
- ✅ Shows selected file confirmation
- ✅ Displays existing attachments with download links

---

## 🚀 How to Use

### **Creating a Project with Attachment:**
1. Click "Create Project"
2. Fill in project details
3. Select file in "Attachment" field (PNG, JPG, JPEG, PDF)
4. See "✓ File selected: filename.ext"
5. Click "Create"
6. File uploads with project to `/uploads`

### **Creating a Ticket with Attachment:**
1. Click "Create Ticket"
2. Go to "Ticket Info" tab
3. Fill in ticket details
4. Select file in "Attachment" field
5. See "✓ File selected: filename.ext"
6. Click "Create"

### **Viewing Existing Attachments:**
- When editing a project/ticket, existing attachments are shown in a blue box
- Click "Download" to download the file
- File is downloaded as original filename

### **Accessing Uploaded Files Directly:**
```
http://localhost:5000/uploads/1734001234567-document.pdf
```

---

## 📁 Folder Structure

```
server/
├── middleware/
│   ├── upload.js         ✅ Multer configuration
│   └── ...
├── models/
│   ├── project.model.js  ✅ Added attachments field
│   ├── ticket.model.js   ✅ Added attachments field
│   └── ...
├── controllers/
│   ├── project.controller.js  ✅ Updated add/update
│   ├── ticket.controller.js   ✅ Updated add/update
│   └── ...
├── routes/
│   ├── project.route.js  ✅ Added upload middleware
│   ├── ticket.route.js   ✅ Added upload middleware
│   └── ...
├── uploads/              ✅ Created (add to .gitignore)
├── app.js               ✅ Added static serve
└── ...

client/
├── src/
│   ├── services/
│   │   ├── project-service.js  ✅ Updated with FormData
│   │   ├── ticket-service.js   ✅ Updated with FormData
│   │   └── ...
│   └── components/
│       ├── projects/
│       │   └── AddProject.jsx      ✅ Added file input
│       ├── tickets/
│       │   ├── CreateTicket.jsx    ✅ Added file state
│       │   └── TicketInfo.jsx      ✅ Added file input & display
│       └── ...
```

---

## 🔐 Security Features

✅ **File Type Validation**: Only PNG, JPG, JPEG, PDF allowed  
✅ **Server-side Filtering**: Mimetype checked on backend  
✅ **Unique Filenames**: `Date.now() + "-" + originalname` prevents conflicts  
✅ **User Authorization**: Upload requires proper permissions  

---

## ⚙️ API Endpoints

### Projects
```
POST   /project              → Create project with attachment
PATCH  /project/:projectId   → Update project with attachment
POST   /project/:projectId/attachment  → Standalone file upload
```

### Tickets
```
POST   /ticket/project/:projectId      → Create ticket with attachment
PATCH  /ticket/project/:projectId      → Update ticket with attachment
```

---

## 🎯 Testing Checklist

- [ ] Install dependencies: `npm install` in `/server`
- [ ] Verify `/uploads` folder exists in `/server`
- [ ] Check `.gitignore` contains `uploads/`
- [ ] Start backend: `npm start` (or `node server.js`)
- [ ] Start frontend: `npm run dev`
- [ ] Create a new project with a PDF/image attachment
- [ ] Verify file appears in `/uploads` folder
- [ ] Edit the project and verify attachment displays
- [ ] Download the attachment from the project view
- [ ] Create a ticket with an attachment
- [ ] Verify ticket attachment displays in ticket info
- [ ] Test with different file types (PNG, JPG, PDF)
- [ ] Verify non-allowed files are rejected

---

## 🐛 Troubleshooting

**Files not uploading?**
- Check that `/uploads` folder exists in `server/` directory
- Verify multer is installed: `npm list multer`
- Check server console for errors

**Download not working?**
- Ensure `app.use("/uploads", express.static("uploads"))` is in `app.js`
- Check that files exist in `/uploads` directory
- Verify file path in database is correct

**File type not allowed?**
- Update `fileFilter` in `server/middleware/upload.js`
- Add mimetype to the `allowed` array
- Restart server after changes

**Attachment not saving?**
- Verify attachment field in model schema
- Check that `req.file` is being passed correctly
- Look for errors in server console

---

## 📝 Notes

- Attachments are optional (file upload is not required)
- Multiple attachments can be added by editing project/ticket multiple times
- Files are stored with timestamp prefix to prevent overwrites
- Consider implementing file size limits in production
- Set up cloud storage (AWS S3, Azure Blob, etc.) for production instead of local `/uploads`

---

## 🎉 Feature Complete!

Your TrackIt project now has a professional file upload system. This feature is:
- ✅ Practical and user-friendly
- ✅ Secure with file type validation
- ✅ Scalable for future enhancements
- ✅ Ready for production with minor adjustments

**Next Steps:**
- Add multiple file uploads using `upload.array()`
- Implement file size limits
- Add drag-and-drop upload UI
- Set up cloud storage for production
- Add file preview functionality

---

Generated: December 11, 2025
