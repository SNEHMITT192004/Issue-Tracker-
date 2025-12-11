# 📖 File Upload Feature - Visual Reference Guide

## 🎨 UI Elements Added

### Project Form - New Section
```
┌─────────────────────────────────────────────┐
│           PROJECT INFO TAB                   │
├─────────────────────────────────────────────┤
│                                             │
│  Title: [___________________]               │
│                                             │
│  Description: [RICH TEXT EDITOR]            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Attachment                          │   │
│  │ [Choose File]  (PNG, JPG, PDF only) │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ✓ File selected: document.pdf              │  ← Green box
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Existing Attachments:               │   │  ← Blue box
│  │ 📎 budget.pdf    [Download]         │   │
│  │ 📎 logo.jpg      [Download]         │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Ticket Form - New Section
```
┌──────────────────────────────────────────────┐
│          TICKET INFO TAB                     │
├──────────────────────────────────────────────┤
│                                              │
│  Title: [_____________________]              │
│                                              │
│  Description: [RICH TEXT EDITOR]             │
│                                              │
│  Type: [SELECT]    Status: [SELECT]          │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Attachment                             │  │
│  │ [Choose File]  (PNG, JPG, PDF only)    │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ✓ File selected: image.jpg                  │  ← Green
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Existing Attachments:                  │  │  ← Blue
│  │ 📎 screenshot.png  [Download]          │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Created 2 hours ago                         │
│  Updated 1 hour ago                          │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 📁 File Storage Structure

```
TrackIt-master/
├── server/
│   ├── uploads/                    ← NEW FOLDER
│   │   ├── 1734011234567-doc.pdf   ← Uploaded files
│   │   ├── 1734011235890-img.jpg
│   │   ├── 1734011236123-photo.png
│   │   └── ...
│   │
│   ├── middleware/
│   │   └── upload.js               ← UPDATED
│   │
│   ├── models/
│   │   ├── project.model.js        ← UPDATED (attachments field)
│   │   ├── ticket.model.js         ← UPDATED (attachments field)
│   │   └── ...
│   │
│   ├── controllers/
│   │   ├── project.controller.js   ← UPDATED (handle file)
│   │   ├── ticket.controller.js    ← UPDATED (handle file)
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── project.route.js        ← UPDATED (upload middleware)
│   │   ├── ticket.route.js         ← UPDATED (upload middleware)
│   │   └── ...
│   │
│   ├── app.js                      ← UPDATED (static serve)
│   └── ...
│
├── client/
│   ├── src/
│   │   ├── services/
│   │   │   ├── project-service.js  ← UPDATED (FormData)
│   │   │   ├── ticket-service.js   ← UPDATED (FormData)
│   │   │   └── ...
│   │   │
│   │   └── components/
│   │       ├── projects/
│   │       │   └── AddProject.jsx   ← UPDATED (file input)
│   │       │
│   │       ├── tickets/
│   │       │   ├── CreateTicket.jsx ← UPDATED (file state)
│   │       │   ├── TicketInfo.jsx   ← UPDATED (file input + display)
│   │       │   └── ...
│   │       └── ...
│   └── ...
│
├── UPLOAD_FEATURE_SETUP.md         ← Documentation
├── QUICK_START_UPLOAD.md           ← Quick start guide
├── IMPLEMENTATION_CHECKLIST.md     ← Detailed checklist
├── FEATURE_SUMMARY.md              ← Feature overview
└── ...
```

---

## 🔄 Request/Response Examples

### 1. Create Project with File

**Frontend (FormData):**
```js
const formData = new FormData();
formData.append("title", "My Project");
formData.append("description", "Project description");
formData.append("assignees[0]", "userId1");
formData.append("assignees[1]", "userId2");
formData.append("attachment", fileObject);

// POST to /project
axios.post("/project", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
```

**Backend Processing:**
```
1. Express receives multipart/form-data
2. Multer middleware:
   - Checks MIME type (PNG, JPG, JPEG, PDF only)
   - Saves file to /uploads/1734011234567-filename.pdf
   - Passes req.file to controller
3. Controller:
   - Creates project in MongoDB
   - Pushes attachment to attachments array
   - Returns created project with attachment info
```

**Database Result:**
```js
{
  _id: ObjectId("..."),
  title: "My Project",
  description: "Project description",
  assignees: [userId1, userId2],
  attachments: [{
    fileName: "1734011234567-document.pdf",
    filePath: "uploads/1734011234567-document.pdf",
    uploadedAt: ISODate("2025-12-11T10:30:00.000Z")
  }],
  createdOn: ISODate("2025-12-11T10:30:00.000Z"),
  updatedOn: ISODate("2025-12-11T10:30:00.000Z")
}
```

**Disk Result:**
```
server/uploads/
└── 1734011234567-document.pdf  (actual file content)
```

**Response to Frontend:**
```js
{
  _id: "...",
  title: "My Project",
  attachments: [{
    fileName: "1734011234567-document.pdf",
    filePath: "uploads/1734011234567-document.pdf",
    uploadedAt: "2025-12-11T10:30:00.000Z"
  }]
}
```

---

### 2. Create Ticket with File

**Frontend (FormData):**
```js
const formData = new FormData();
formData.append("type", "bugTypeId");
formData.append("title", "Fix login button");
formData.append("description", "Login button not working");
formData.append("status", "Open");
formData.append("assignees[0]", "userId1");
formData.append("estimatedTime", 5);
formData.append("estimatedTimeUnit", "h");
formData.append("attachment", fileObject);

// POST to /ticket/project/:projectId
axios.post(`/ticket/project/${projectId}`, formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
```

**Database Result:**
```js
{
  _id: ObjectId("..."),
  projectId: ObjectId("..."),
  title: "Fix login button",
  type: ObjectId("..."),
  description: "Login button not working",
  status: "Open",
  assignees: [userId1],
  estimatedTime: 5,
  estimatedTimeUnit: "h",
  attachments: [{
    fileName: "1734011235890-screenshot.jpg",
    filePath: "uploads/1734011235890-screenshot.jpg",
    uploadedAt: ISODate("2025-12-11T10:31:00.000Z")
  }],
  createdBy: ObjectId("..."),
  createdOn: ISODate("2025-12-11T10:31:00.000Z")
}
```

---

## 🎯 File Download Flow

```
User clicks "Download" in UI
        ↓
onClick handler executes:
        ↓
Creates <a> element
        ↓
Sets href to: http://localhost:5000/uploads/1734011234567-file.pdf
        ↓
Sets download attribute to: "file.pdf"
        ↓
Simulates click
        ↓
Browser downloads file with original name
```

**Code:**
```js
const link = document.createElement("a");
link.href = `http://localhost:5000/${att.filePath}`;
link.download = att.fileName.split("-")[1]; // Get original name
link.click();
```

---

## 🔐 Security Validation Flow

```
User selects file in browser
        ↓
Frontend Input: accept="image/png,image/jpeg,image/jpg,application/pdf"
        ↓
User submits form
        ↓
Service creates FormData with file
        ↓
Axios POSTs multipart/form-data
        ↓
Backend Route receives request
        ↓
Multer Middleware checks:
  1. File exists? → YES
  2. MIME type in allowed list?
     ["image/png", "image/jpeg", "image/jpg", "application/pdf"]
     → YES
  3. Unique filename: Date.now() + "-" + originalname
     → "1734011234567-document.pdf"
  4. Save to: uploads/1734011234567-document.pdf
        ↓
Controller receives req.file
        ↓
Push to attachments array
        ↓
Save to database
        ↓
Return success response
```

---

## 📊 Component Props Flow

### CreateTicket → TicketInfo
```js
<TicketInfo
  ticketInfo={ticketInfo}
  onHandleFormSubmit={onHandleFormSubmit}
  formRef={formRef}
  error={error}
  ticketDescription={ticketDescription}
  setTicketDescription={setTicketDescription}
  
  // NEW PROPS:
  attachmentFile={attachmentFile}        // File object
  setAttachmentFile={setAttachmentFile}  // State setter
  existingAttachments={ticket?.attachments || []}  // Array
/>
```

### AddProject → Form
```js
// File state in AddProject.jsx
const [attachmentFile, setAttachmentFile] = useState(null);

// Passed to service
ProjectService.createProject(projectData, attachmentFile);
ProjectService.updateProject(projectData, projectId, attachmentFile);
```

---

## 🧠 State Management

### In CreateTicket.jsx
```js
const [attachmentFile, setAttachmentFile] = useState(null);

// Usage:
// 1. User selects file
<input onChange={(e) => setAttachmentFile(e.target.files[0])} />

// 2. Submit form with file
TicketService.createTicket(project._id, ticketData, attachmentFile);

// 3. Clear on close
setAttachmentFile(null);
```

### In TicketInfo.jsx
```js
// Receive from parent
const { attachmentFile, setAttachmentFile, existingAttachments } = props;

// File input
<Input
  type="file"
  onChange={(e) => setAttachmentFile(e.target.files[0])}
/>

// Display selected
{attachmentFile && (
  <Box p={2} bg="green.100">
    ✓ File selected: {attachmentFile.name}
  </Box>
)}

// Display existing
{existingAttachments.length > 0 && (
  <Box p={3} bg="blue.50">
    {existingAttachments.map((att) => (
      <HStack>
        <Text>📎 {att.fileName}</Text>
        <Button onClick={() => downloadFile(att)}>Download</Button>
      </HStack>
    ))}
  </Box>
)}
```

---

## 🔗 API Endpoint Mapping

```
Frontend Call                          Backend Route
─────────────────────────────────────────────────────────
POST /project                     POST   /project
  + FormData                         + upload.single("attachment")
  + file                             + addProject()

PATCH /project/:id                PATCH  /project/:id
  + FormData                         + upload.single("attachment")
  + file                             + updateProject()

POST /ticket/project/:projectId    POST   /ticket/project/:projectId
  + FormData                         + upload.single("attachment")
  + file                             + createTicket()

PATCH /ticket/project/:projectId   PATCH  /ticket/project/:projectId
  + FormData                         + upload.single("attachment")
  + file                             + updateTicket()
```

---

## 🎨 Chakra UI Components Used

**New Imports Added:**
```js
import {
  Text,       // Display file name and info
  Box,        // Container for status messages
  VStack,     // Vertical layout for attachments list
  HStack,     // Horizontal layout for file + download button
  Button,     // Download button
} from "@chakra-ui/react";
```

**UI Pattern:**
```js
// File Input
<FormControl>
  <FormLabel>Attachment</FormLabel>
  <Input type="file" accept="..." />
  <Text fontSize="xs">Allowed: PNG, JPG, JPEG, PDF</Text>
</FormControl>

// Status Message (Green)
{file && (
  <Box p={2} bg="green.100" borderRadius="md">
    <Text fontSize="sm" color="green.800">
      ✓ File selected: {file.name}
    </Text>
  </Box>
)}

// Attachments List (Blue)
{attachments.length > 0 && (
  <Box p={3} bg="blue.50" borderRadius="md">
    <Text fontSize="sm" fontWeight={600}>
      Existing Attachments:
    </Text>
    <VStack align="start" spacing={1}>
      {attachments.map((att) => (
        <HStack key={idx} spacing={2}>
          <Text fontSize="sm">📎 {att.fileName}</Text>
          <Button size="xs" colorScheme="blue">
            Download
          </Button>
        </HStack>
      ))}
    </VStack>
  </Box>
)}
```

---

## 📝 Error Handling

**User Selects Non-Allowed File:**
```
User tries to upload .docx file
        ↓
Frontend input has accept="...pdf,image/..."
        ↓
Browser prevents selection (file dialog doesn't show .docx)
        ↓
OR user overrides and selects anyway
        ↓
Backend Multer fileFilter checks MIME type
        ↓
MIME type not in allowed array
        ↓
Multer rejects with error
        ↓
Error returned to frontend
        ↓
Alert shown to user: "File type not allowed"
```

---

## ✅ Validation Layers

```
Layer 1: Browser (accept attribute)
  └─ User sees only allowed file types

Layer 2: Frontend Validation (optional)
  └─ Could add file size check
  └─ Could add file extension check

Layer 3: Multer File Filter
  └─ Checks MIME type
  └─ Returns error if not allowed

Layer 4: Controller
  └─ Verifies req.file exists
  └─ Saves to database
  └─ Returns success/error
```

---

## 🎯 Key Files Reference

| File | Purpose | Changes |
|------|---------|---------|
| `upload.js` | Multer config | File type validation |
| `project.model.js` | DB schema | + attachments field |
| `ticket.model.js` | DB schema | + attachments field |
| `project.controller.js` | Logic | Handle file on create/update |
| `ticket.controller.js` | Logic | Handle file on create/update |
| `project.route.js` | Routes | + upload middleware |
| `ticket.route.js` | Routes | + upload middleware |
| `app.js` | Express | + static file serving |
| `project-service.js` | API calls | Use FormData |
| `ticket-service.js` | API calls | Use FormData |
| `AddProject.jsx` | UI | + file input |
| `CreateTicket.jsx` | UI | + file state |
| `TicketInfo.jsx` | UI | + file input & display |

---

This visual reference should help you understand every aspect of the file upload feature! 🎨

