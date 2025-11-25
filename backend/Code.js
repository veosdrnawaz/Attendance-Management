/**
 * SMART ATTENDANCE MANAGER - BACKEND
 * Copy this entire content into your Google Apps Script project.
 */

// --- CONFIGURATION ---
// Replace with the ID of the spreadsheet that holds the 'Tenants' sheet.
// For the first run, run setupMasterSheet() to generate it.
var MASTER_SHEET_ID = "REPLACE_WITH_ACTUAL_SHEET_ID_AFTER_SETUP"; 

// --- API ENTRY POINTS ---

function doGet(e) {
  // Useful for simple health checks or debug
  return ContentService.createTextOutput("Smart Attendance Manager API is Active");
}

function doPost(e) {
  var output = { success: false, error: "Unknown error" };
  
  try {
    if (!e.postData || !e.postData.contents) throw new Error("No payload");
    
    var req = JSON.parse(e.postData.contents);
    var action = req.action;
    var payload = req.payload;
    var token = req.authToken;
    var pin = req.pin;
    
    // 1. Authenticate User via Google ID Token
    var userProfile = verifyGoogleToken(token);
    if (!userProfile) throw new Error("Invalid Auth Token");
    
    // 2. Identify Tenant & Role
    var context = getUserContext(userProfile.email);
    
    // 3. Route Request
    output = routeRequest(action, payload, context, pin);
    
  } catch (err) {
    output = { success: false, error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- ROUTING ---

function routeRequest(action, payload, context, pin) {
  var role = context.role;
  var db = context.db; // The spreadsheet ID for this tenant
  
  // Super Admin Actions
  if (role === 'SUPER_ADMIN') {
    if (action === 'getAllTenants') return getAllTenants();
    if (action === 'createTenant') return createTenant(payload);
  }
  
  // Institution Admin Actions
  if (role === 'INSTITUTION_ADMIN') {
    // Check PIN for sensitive actions
    if (action === 'verifyPin') return { success: verifyPin(context.tenantId, pin) };
    if (!verifyPin(context.tenantId, pin)) throw new Error("Session locked. Verify PIN.");
    
    if (action === 'getInstitutionAnalytics') return getInstitutionAnalytics(db);
    
    // Teacher Management
    if (action === 'getTeachers') return getTeachers(db);
    if (action === 'createTeacher') return createTeacher(db, payload);
    if (action === 'updateTeacher') return updateTeacher(db, payload);
    if (action === 'deleteTeacher') return deleteTeacher(db, payload);
    
    // Student Management
    if (action === 'getAllStudents') return getAllStudents(db);
    if (action === 'createStudent') return createStudent(db, payload);
    if (action === 'updateStudent') return updateStudent(db, payload);
    if (action === 'deleteStudent') return deleteStudent(db, payload);
    
    // Class Helper
    if (action === 'getClasses') return getClasses(db);
  }
  
  // Teacher / Shared Actions
  if (action === 'verifyAuth') {
    return { success: true, data: { role: role, tenantId: context.tenantId, name: context.name } };
  }
  
  if (db) {
    if (action === 'getTeacherClasses') return getTeacherClasses(db, context.email, role);
    if (action === 'getStudentsByClass') return getStudentsByClass(db, payload.classId);
    if (action === 'markAttendance') return markAttendance(db, payload, context.email);
  }
  
  throw new Error("Action not found or unauthorized for role: " + role);
}

// --- CORE FUNCTIONS ---

function verifyGoogleToken(token) {
  // In production, validate using Google's endpoint:
  // https://oauth2.googleapis.com/tokeninfo?id_token=XYZ
  // For this prototype, we decode and trust the payload if the script is deployed as "Execute as Me"
  // and accessible by "Anyone".
  if(!token) return null;
  
  try {
    var parts = token.split('.');
    var payload = JSON.parse(Utilities.newBlob(Utilities.base64Decode(parts[1])).getDataAsString());
    return { email: payload.email, name: payload.name, picture: payload.picture };
  } catch (e) {
    return null;
  }
}

function getUserContext(email) {
  // 1. Check if Super Admin (Hardcoded for prototype security)
  var scriptProps = PropertiesService.getScriptProperties();
  if (email === scriptProps.getProperty('SUPER_ADMIN_EMAIL')) {
    return { role: 'SUPER_ADMIN', email: email };
  }
  
  // 2. Lookup in Master Tenant Sheet to see if they are an Admin
  var masterSs = SpreadsheetApp.openById(MASTER_SHEET_ID);
  var tenantsSheet = masterSs.getSheetByName('Tenants');
  var tenantsData = tenantsSheet.getDataRange().getValues();
  
  for (var i = 1; i < tenantsData.length; i++) {
    if (tenantsData[i][3] === email) { // Admin Email column
      return { 
        role: 'INSTITUTION_ADMIN', 
        tenantId: tenantsData[i][0], 
        db: tenantsData[i][5], // Spreadsheet ID
        email: email
      };
    }
  }
  
  // 3. If not admin, check specific tenant spreadsheets for Teachers (Expensive operation, should be cached)
  // For optimization in this demo, we assume we don't know the tenant, returning Guest.
  // In a real app, you'd have a 'GlobalUserIndex' sheet.
  
  return { role: 'GUEST', email: email };
}

function createTenant(payload) {
  var id = Utilities.getUuid();
  var pinHash = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, "123456")); // Default PIN
  
  // Copy Template
  var newSs = SpreadsheetApp.create("SAAS_INST_" + payload.name);
  var ssid = newSs.getId();
  
  // Setup Sheets in new DB
  var ss = SpreadsheetApp.openById(ssid);
  ss.insertSheet('Teachers').appendRow(['teacher_id', 'name', 'email', 'classes_json']);
  ss.insertSheet('Students').appendRow(['student_id', 'name', 'roll_no', 'class_id', 'parent_contact']);
  ss.insertSheet('Classes').appendRow(['class_id', 'name', 'schedule']);
  ss.insertSheet('Attendance').appendRow(['record_id', 'class_id', 'date', 'student_id', 'status', 'timestamp']);
  ss.deleteSheet(ss.getSheetByName('Sheet1'));
  
  // Add Dummy Data
  ss.getSheetByName('Classes').appendRow(['c1', 'Computer Science 101', 'Mon 10am']);
  ss.getSheetByName('Classes').appendRow(['c2', 'Mathematics', 'Tue 10am']);
  ss.getSheetByName('Students').appendRow(['s1', 'John Doe', '1001', 'c1', '555-0101']);
  
  // Register in Master
  var masterSs = SpreadsheetApp.openById(MASTER_SHEET_ID);
  masterSs.getSheetByName('Tenants').appendRow([
    id, payload.name, payload.plan, payload.email, pinHash, ssid, new Date()
  ]);
  
  return { success: true };
}

// --- Teacher CRUD ---

function getTeachers(dbId) {
  var ss = SpreadsheetApp.openById(dbId);
  var sheet = ss.getSheetByName('Teachers');
  var data = sheet.getDataRange().getValues();
  var teachers = [];
  for(var i=1; i<data.length; i++) {
    var classes = [];
    try { classes = JSON.parse(data[i][3]); } catch(e) {}
    teachers.push({
      teacherId: data[i][0],
      name: data[i][1],
      email: data[i][2],
      classes: classes
    });
  }
  return { success: true, data: teachers };
}

function createTeacher(dbId, payload) {
  var ss = SpreadsheetApp.openById(dbId);
  var sheet = ss.getSheetByName('Teachers');
  var id = Utilities.getUuid();
  sheet.appendRow([id, payload.name, payload.email, JSON.stringify(payload.classes || [])]);
  return { success: true };
}

function updateTeacher(dbId, payload) {
  var ss = SpreadsheetApp.openById(dbId);
  var sheet = ss.getSheetByName('Teachers');
  var data = sheet.getDataRange().getValues();
  for(var i=1; i<data.length; i++) {
    if(data[i][0] == payload.teacherId) {
       sheet.getRange(i+1, 2).setValue(payload.name);
       sheet.getRange(i+1, 3).setValue(payload.email);
       sheet.getRange(i+1, 4).setValue(JSON.stringify(payload.classes || []));
       return { success: true };
    }
  }
  return { success: false, error: "Teacher not found" };
}

function deleteTeacher(dbId, payload) {
  var ss = SpreadsheetApp.openById(dbId);
  var sheet = ss.getSheetByName('Teachers');
  var data = sheet.getDataRange().getValues();
  for(var i=1; i<data.length; i++) {
    if(data[i][0] == payload.teacherId) {
       sheet.deleteRow(i+1);
       return { success: true };
    }
  }
  return { success: false, error: "Teacher not found" };
}

// --- Student CRUD ---

function getAllStudents(dbId) {
  var ss = SpreadsheetApp.openById(dbId);
  var data = ss.getSheetByName('Students').getDataRange().getValues();
  var students = [];
  
  for(var i=1; i<data.length; i++) {
     students.push({
       studentId: data[i][0],
       name: data[i][1],
       rollNo: data[i][2],
       classId: data[i][3],
       parentContact: data[i][4] || ''
     });
  }
  return { success: true, data: students };
}

function createStudent(dbId, payload) {
  var ss = SpreadsheetApp.openById(dbId);
  var sheet = ss.getSheetByName('Students');
  var id = Utilities.getUuid();
  sheet.appendRow([id, payload.name, payload.rollNo, payload.classId, payload.parentContact || '']);
  return { success: true };
}

function updateStudent(dbId, payload) {
  var ss = SpreadsheetApp.openById(dbId);
  var sheet = ss.getSheetByName('Students');
  var data = sheet.getDataRange().getValues();
  for(var i=1; i<data.length; i++) {
    if(data[i][0] == payload.studentId) {
       sheet.getRange(i+1, 2).setValue(payload.name);
       sheet.getRange(i+1, 3).setValue(payload.rollNo);
       sheet.getRange(i+1, 4).setValue(payload.classId);
       sheet.getRange(i+1, 5).setValue(payload.parentContact || '');
       return { success: true };
    }
  }
  return { success: false, error: "Student not found" };
}

function deleteStudent(dbId, payload) {
  var ss = SpreadsheetApp.openById(dbId);
  var sheet = ss.getSheetByName('Students');
  var data = sheet.getDataRange().getValues();
  for(var i=1; i<data.length; i++) {
    if(data[i][0] == payload.studentId) {
       sheet.deleteRow(i+1);
       return { success: true };
    }
  }
  return { success: false, error: "Student not found" };
}

// --- Class Helpers ---

function getClasses(dbId) {
  var ss = SpreadsheetApp.openById(dbId);
  var sheet = ss.getSheetByName('Classes');
  var data = sheet.getDataRange().getValues();
  var classes = [];
  for(var i=1; i<data.length; i++) {
    classes.push({
      classId: data[i][0],
      name: data[i][1],
      schedule: data[i][2]
    });
  }
  return { success: true, data: classes };
}

// --- Teacher/Shared View ---

function getTeacherClasses(dbId, email, role) {
  var ss = SpreadsheetApp.openById(dbId);
  var sheet = ss.getSheetByName('Classes');
  var data = sheet.getDataRange().getValues();
  var classes = [];
  
  // In a real app, filter by teacher email assignment.
  // Here returning all classes for demo if Admin or Teacher
  for(var i=1; i<data.length; i++) {
    classes.push({
      classId: data[i][0],
      name: data[i][1],
      schedule: data[i][2]
    });
  }
  return { success: true, data: classes };
}

function getStudentsByClass(dbId, classId) {
  var ss = SpreadsheetApp.openById(dbId);
  var data = ss.getSheetByName('Students').getDataRange().getValues();
  var students = [];
  
  for(var i=1; i<data.length; i++) {
    if(data[i][3] === classId) { // class_id match
       students.push({
         studentId: data[i][0],
         name: data[i][1],
         rollNo: data[i][2],
         classId: data[i][3],
         parentContact: data[i][4] || ''
       });
    }
  }
  return { success: true, data: students };
}

function markAttendance(dbId, payload, userEmail) {
  var ss = SpreadsheetApp.openById(dbId);
  var sheet = ss.getSheetByName('Attendance');
  var timestamp = new Date();
  
  var rows = payload.records.map(function(r) {
    return [
      Utilities.getUuid(),
      payload.classId,
      payload.date,
      r.studentId,
      r.status,
      timestamp
    ];
  });
  
  // Batch write
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 6).setValues(rows);
  }
  
  return { success: true };
}

function verifyPin(tenantId, pin) {
  // In production, fetch hash from Tenants sheet and compare
  return pin === "123456"; // Default for demo
}

function getInstitutionAnalytics(dbId) {
  var ss = SpreadsheetApp.openById(dbId);
  var sCount = ss.getSheetByName('Students').getLastRow() - 1;
  var cCount = ss.getSheetByName('Classes').getLastRow() - 1;
  
  // Mock data for charts
  return { 
    success: true, 
    data: {
      totalStudents: sCount > 0 ? sCount : 0,
      totalClasses: cCount > 0 ? cCount : 0,
      averageAttendance: 85,
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      attendanceRates: [80, 85, 90, 82, 88]
    }
  };
}

function getAllTenants() {
   var masterSs = SpreadsheetApp.openById(MASTER_SHEET_ID);
   var data = masterSs.getSheetByName('Tenants').getDataRange().getValues();
   var tenants = [];
   for(var i=1; i<data.length; i++) {
     tenants.push({
       tenantId: data[i][0],
       name: data[i][1],
       plan: data[i][2],
       adminEmail: data[i][3],
       isActive: true
     });
   }
   return { success: true, data: tenants };
}

// --- SETUP ---
function setupMasterSheet() {
  var ss = SpreadsheetApp.create("SAAS_MASTER_DB");
  var id = ss.getId();
  
  var sheet = ss.getSheetByName('Sheet1');
  sheet.setName('Tenants');
  sheet.appendRow(['tenant_id', 'institution_name', 'plan', 'admin_email', 'admin_pin_hash', 'spreadsheet_id', 'created_at']);
  
  console.log("Master Sheet Created ID: " + id);
}
