# 🔧 File Upload Feature - Troubleshooting Guide

## Common Issues & Solutions

---

## ❌ Issue 1: "Error: ENOENT: no such file or directory, open 'uploads'"

### Symptoms:
- Server crashes on file upload
- Error in console: `Cannot find directory 'uploads'`
- Files not being saved

### Root Cause:
The `/server/uploads` folder doesn't exist

### Solutions:

**Option 1: Create folder manually**
```powershell
# In PowerShell, navigate to server
cd C:\Users\sneha\Downloads\Trackit-master\Trackit-master\server

# Create uploads folder
mkdir uploads

# Verify it exists
ls -Directory | findstr uploads
```

**Option 2: Let code create it**
Update `server/middleware/upload.js`:
```js
import fs from "fs";
import path from "path";
import multer from "multer";

// Create uploads directory if it doesn't exist
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
// ... rest of code
```

### Verification:
```powershell
# Check folder exists
Test-Path server/uploads

# Should return: True
```

---

## ❌ Issue 2: "File type not allowed"

### Symptoms:
- Cannot upload ANY files
- Error message: "File type not allowed"
- Browser console shows error

### Root Cause:
File MIME type not in allowed list

### Solution:

**Check `server/middleware/upload.js`:**
```js
const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
```

If you need to add more types:
```js
const allowed = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",           // Add GIF
  "application/pdf",
  "application/msword",  // Add DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // DOCX
];
```

**Also update frontend accept attribute:**

In `TicketInfo.jsx`:
```jsx
<Input
  type="file"
  accept="image/png,image/jpeg,image/jpg,application/pdf,image/gif,.doc,.docx"
/>
```

In `AddProject.jsx`:
```jsx
<Input
  type="file"
  accept="image/png,image/jpeg,image/jpg,application/pdf,image/gif,.doc,.docx"
/>
```

**Restart server after changes:**
```powershell
# In server terminal, press Ctrl+C to stop
# Then restart
npm start
```

---

## ❌ Issue 3: Download Returns 404 Not Found

### Symptoms:
- File uploads successfully
- Click Download, shows 404 error
- File doesn't load
- URL looks like: `http://localhost:5000/uploads/1734011234567-file.pdf`

### Root Cause:
`app.js` doesn't have the static file server configured

### Solution:

**Check `server/app.js` has this line:**
```js
app.use("/uploads", express.static("uploads"));
```

**If missing, add it after other middleware:**
```js
//preconfigure express app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Add this line:
app.use("/uploads", express.static("uploads"));

//Middleware
app.get("/", (_, res) => res.send("Welcome to TrackIt API"));
```

**Line should be BEFORE routes but AFTER cors()**

**Verify:**
```powershell
# Test if server is serving files
# In browser, go to:
http://localhost:5000/uploads/

# Should show directory listing or specific file if you paste filename
```

**Restart server:**
```powershell
# Stop server (Ctrl+C)
# Restart
npm start
```

---

## ❌ Issue 4: File Uploads But Doesn't Save to Database

### Symptoms:
- File appears in `/uploads` folder ✅
- Browser shows success message ✅
- But attachment not in database ❌
- Edit project/ticket, no attachment shows ❌

### Root Cause:
Controller not handling `req.file` properly

### Solution:

**Check `server/controllers/project.controller.js`:**

In `addProject()` function:
```js
let newProject = await Project.create({ title, description, authorId: userId, assignees });

// Add this block:
if (req.file) {
  newProject.attachments.push({
    fileName: req.file.filename,
    filePath: req.file.path
  });
  await newProject.save();
}

newProject = await newProject.populate([...]);
```

**Check `server/controllers/ticket.controller.js`:**

In `createTicket()` function:
```js
const newTicket = await Ticket.create({ projectId, type, title, ... });

// Add this block:
if (req.file) {
  newTicket.attachments.push({
    fileName: req.file.filename,
    filePath: req.file.path
  });
  await newTicket.save();
}

const ticket = await Ticket.findById(newTicket._id).populate([...]);
```

In `updateTicket()` function:
```js
if (req.file) {
  ticketToUpdate.attachments.push({
    fileName: req.file.filename,
    filePath: req.file.path
  });
}

await ticketToUpdate.save();
```

**Verify database:**
```powershell
# Check MongoDB directly using MongoDB Compass or shell
# Look for ticket/project document
# Should see:
# {
#   ...other fields...
#   attachments: [
#     {
#       fileName: "1734011234567-file.pdf",
#       filePath: "uploads/1734011234567-file.pdf",
#       uploadedAt: Date
#     }
#   ]
# }
```

---

## ❌ Issue 5: FormData Not Being Sent Correctly

### Symptoms:
- Upload appears to work
- No server errors
- File not saved
- req.file is undefined in controller

### Root Cause:
Service not creating FormData correctly

### Solution:

**Check `client/src/services/ticket-service.js`:**
```js
const createTicket = (projectId, data, file) => {
  const formData = new FormData();
  
  // Append fields
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      data[key].forEach((item, index) => {
        formData.append(`${key}[${index}]`, item);
      });
    } else {
      formData.append(key, data[key]);
    }
  });
  
  // Append file
  if (file) {
    formData.append("attachment", file);  // ← Must be "attachment"
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
```

**Key points:**
- File field name must be **"attachment"**
- Matches `upload.single("attachment")` in route
- Headers must include `Content-Type: multipart/form-data`

**Same for `project-service.js`:**
```js
const createProject = (data, file) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      data[key].forEach((item, index) => {
        formData.append(`${key}[${index}]`, item);
      });
    } else {
      formData.append(key, data[key]);
    }
  });
  
  if (file) {
    formData.append("attachment", file);  // ← Must be "attachment"
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
```

**Test FormData:**
```js
// In browser console, test FormData creation:
const fd = new FormData();
fd.append("title", "Test");
fd.append("attachment", fileObject);

// Should work without errors
console.log(fd); // FormData object
```

---

## ❌ Issue 6: "Upload Middleware Not Recognized"

### Symptoms:
- Error: `upload is not defined`
- Error: `Cannot find module upload`
- Routes not working
- 500 errors on file upload

### Root Cause:
Import statement wrong in routes

### Solution:

**Check imports are correct:**

**`server/routes/project.route.js`:**
```js
// CORRECT ✅
import upload from "../middleware/upload.js";

// WRONG ❌
import { upload } from "../middleware/upload.js";
const upload = require("../middleware/upload");
```

**`server/routes/ticket.route.js`:**
```js
// CORRECT ✅
import upload from "../middleware/upload.js";

// WRONG ❌
const upload = require("../middleware/upload");
import { upload } from "../middleware/upload.js";
```

**Check `server/middleware/upload.js` export:**
```js
// CORRECT ✅
export default multer({ storage, fileFilter });

// WRONG ❌
module.exports = multer({ storage, fileFilter });
exports.upload = multer({ storage, fileFilter });
```

---

## ❌ Issue 7: Attachment Shows But Can't Download

### Symptoms:
- Attachment displays in UI ✅
- Blue box shows "Existing Attachments" ✅
- Click Download button ❌
- Nothing happens or 404 error

### Root Cause:
Download link is wrong or file doesn't exist

### Solution:

**Check file path in database:**
```powershell
# In MongoDB, check document:
# attachments[0].filePath should be "uploads/1734011234567-file.pdf"
# Not "C:\Users\....\uploads\file.pdf"
# Not "file.pdf"
# Not "/uploads/file.pdf"
```

**Check download handler in components:**

In `TicketInfo.jsx`:
```js
<Button
  onClick={() => {
    const link = document.createElement("a");
    link.href = `http://localhost:5000/${att.filePath}`;
    link.download = att.fileName;
    link.click();
  }}
>
  Download
</Button>
```

In `AddProject.jsx`:
```js
<Button
  onClick={() => {
    const link = document.createElement("a");
    link.href = `http://localhost:5000/${att.filePath}`;
    link.download = att.fileName;
    link.click();
  }}
>
  Download
</Button>
```

**Test URL directly in browser:**
```
Go to: http://localhost:5000/uploads/1734011234567-yourfilename.pdf

Should show file content or download dialog
If you get 404, file doesn't exist or path is wrong
```

**Check files exist:**
```powershell
# In PowerShell
cd C:\Users\sneha\Downloads\Trackit-master\Trackit-master\server\uploads

# List files
ls

# Should show files like:
# 1734011234567-document.pdf
# 1734011235890-image.jpg
```

---

## ❌ Issue 8: Multer Not Installed

### Symptoms:
- Error: `Cannot find module 'multer'`
- Server won't start
- Import error on `upload.js`

### Root Cause:
Multer package not installed

### Solution:

**Install multer:**
```powershell
# Navigate to server
cd C:\Users\sneha\Downloads\Trackit-master\Trackit-master\server

# Install multer
npm install multer

# Verify installation
npm list multer

# Should show version number like "multer@1.4.5-lts.1"
```

**Check package.json:**
```json
{
  "dependencies": {
    "multer": "^1.4.5-lts.1"  // ← Should be there
  }
}
```

---

## ❌ Issue 9: File Upload Works But Shows Old Attachment After Edit

### Symptoms:
- Upload new file ✅
- File saves to /uploads ✅
- New file appears in database ✅
- BUT UI still shows old file after refresh ❌
- Edit project, still shows old file in list

### Root Cause:
Multiple attachments appended, UI showing first one

### Solution:

This is actually normal behavior - files accumulate. To show latest:

**Option 1: Show all attachments (recommended)**
```jsx
{existingAttachments.length > 0 && (
  <Box p={3} bg="blue.50">
    <Text>Existing Attachments:</Text>
    <VStack>
      {existingAttachments.map((att, idx) => (
        <HStack key={idx}>
          <Text>📎 {att.fileName}</Text>
          <Button onClick={() => downloadFile(att)}>Download</Button>
        </HStack>
      ))}
    </VStack>
  </Box>
)}
```

**Option 2: Show only latest attachment**
```jsx
{existingAttachments.length > 0 && (
  const latest = existingAttachments[existingAttachments.length - 1];
  <Box p={3} bg="blue.50">
    <Text>Latest Attachment:</Text>
    <HStack>
      <Text>📎 {latest.fileName}</Text>
      <Button onClick={() => downloadFile(latest)}>Download</Button>
    </HStack>
  </Box>
)}
```

**Option 3: Add delete functionality** (Future enhancement)
```js
// In controller
router.delete("/project/:projectId/attachment/:attachmentId", 
  deleteProjectAttachment);
```

---

## ✅ Verification Checklist

Run through this when troubleshooting:

- [ ] `/uploads` folder exists in `/server`
- [ ] Multer installed: `npm list multer`
- [ ] `upload.js` exists in `server/middleware/`
- [ ] `app.js` has `app.use("/uploads", express.static("uploads"))`
- [ ] Routes have `upload.single("attachment")` middleware
- [ ] Controllers check `if (req.file)` and handle it
- [ ] Services create FormData correctly
- [ ] File field name is "attachment" everywhere
- [ ] Headers include `"Content-Type": "multipart/form-data"`
- [ ] Models have `attachments` field
- [ ] Database document shows attachment after upload
- [ ] File exists in `/server/uploads/`

---

## 🐛 Debug Mode

### Enable detailed logging:

**In `server/middleware/upload.js`:**
```js
const fileFilter = (req, file, cb) => {
  console.log("File received:", {
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size
  });
  
  const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
  
  if (allowed.includes(file.mimetype)) {
    console.log("✅ File type allowed");
    cb(null, true);
  } else {
    console.log("❌ File type not allowed");
    cb(new Error("File type not allowed"), false);
  }
};
```

**In controllers:**
```js
console.log("req.file:", req.file);
console.log("req.body:", req.body);

if (req.file) {
  console.log("Saving attachment:", {
    fileName: req.file.filename,
    filePath: req.file.path
  });
}
```

**Check server console output:**
```
File received: { originalName: 'document.pdf', mimeType: 'application/pdf', size: 25000 }
✅ File type allowed
Saving attachment: { fileName: '1734011234567-document.pdf', filePath: 'uploads/1734011234567-document.pdf' }
```

---

## 📞 If All Else Fails

1. **Restart everything:**
   ```powershell
   # Kill backend and frontend
   # Delete node_modules
   rm -r node_modules
   # Reinstall
   npm install
   npm install multer
   # Restart
   npm start
   ```

2. **Check server console for errors:**
   ```
   Look for red error messages
   Pay attention to line numbers
   Search Google for exact error message
   ```

3. **Check browser console:**
   ```
   Press F12 → Console tab
   Look for red errors
   Check Network tab for 404/500 errors
   ```

4. **Verify database connection:**
   ```
   Check MongoDB is running
   Verify connection string in config.js
   Try connecting with MongoDB Compass
   ```

5. **Test with curl:**
   ```powershell
   # Test file upload with curl
   $form = @{
     title = "Test"
     attachment = Get-Item "C:\path\to\file.pdf"
   }
   
   Invoke-WebRequest -Uri "http://localhost:5000/project" `
     -Method Post `
     -Form $form `
     -Headers @{"Authorization" = "Bearer YOUR_TOKEN"}
   ```

---

## 🎯 Summary

| Issue | Quick Fix |
|-------|-----------|
| ENOENT uploads folder | `mkdir uploads` in server folder |
| File type not allowed | Check MIME types in upload.js |
| Download 404 | Verify app.js has static serve |
| Not saving to DB | Check controller has `if (req.file)` block |
| FormData issues | Ensure field name is "attachment" |
| Module not found | Check imports are correct |
| Can't download | Verify file path and file exists |
| Multer not installed | `npm install multer` |
| Multiple attachments | Expected behavior, works correctly |

---

Good luck! 🚀 Most issues are resolved by checking these common problems.

