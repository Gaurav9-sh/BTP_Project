# Timetable Generation Feature - Implementation Summary

## Overview

Successfully implemented a complete timetable generation system that integrates the C++ solver and Python PDF generator with the existing frontend and backend.

---

## What Was Implemented

### 1. **Backend Changes**

#### A. Updated User Model (`Backend/Models/User.js`)
Added faculty-specific fields for timetable generation:
- `employeeId` (String, optional): Employee ID used as teacher ID in the solver
- `unavailableSlots` (Array of Strings): List of slot IDs when faculty is unavailable (e.g., ["Mon-A", "Tue-B"])
- `maxHoursPerDay` (Number, default: 4): Maximum teaching hours per day per faculty

#### B. Created Timetable Route (`Backend/Routes/timetable.js`)
New API endpoint: **POST `/api/timetable/generate`**

**Request Body:**
```json
{
  "semester": 1  // Optional; if not provided, generates for all courses
}
```

**Response:**
- Success: PDF file (application/pdf)
- Error: JSON with error message

**Process Flow:**
1. **Data Fetching**: Retrieves courses, faculties, batches, rooms, and slots from MongoDB
2. **Data Validation**: Ensures all required data exists
3. **Data Transformation**: Converts MongoDB documents to CSV format
   - `courses.csv`: Course information with batch assignments
   - `teachers.csv`: Faculty information with unavailability constraints
   - `batches.csv`: Student batch information
   - `rooms.csv`: Room/lab information
   - `slots.csv`: Time slot information
4. **CSV Generation**: Writes all CSV files to temporary directory
5. **Solver Execution**: Runs C++ solver (`timetable_solver`)
6. **PDF Generation**: Runs Python script (`csv_to_pdf.py`) to convert schedule to PDF
7. **Response**: Sends PDF to client and cleans up temporary files

**Key Features:**
- ✅ Automatic combined batch creation for vertical sharing courses
- ✅ Separate course entries for horizontal sharing (one per batch)
- ✅ Employee ID mapping for faculties
- ✅ Lab requirement detection (based on P > 0 or type === "Lab")
- ✅ Comprehensive error handling (validation, timeout, no solution)
- ✅ Automatic cleanup of temporary files

#### C. Registered Route in Server (`Backend/server.js`)
Added `timetableRoutes` to `/api/timetable`

---

### 2. **Frontend Changes**

#### A. Updated API Client (`Frontend/api.js`)
Added new function:
```javascript
export const generateTimetable = (semester = null) => {
  const payload = semester ? { semester } : {};
  return API.post("/timetable/generate", payload, {
    responseType: 'blob' // Important for PDF download
  });
};
```

#### B. Updated Academics Page (`Frontend/src/components/AcademicsPage.jsx`)

**New State:**
- `generatingTimetable`: Tracks whether timetable generation is in progress

**New Handler Function:**
- `handleGenerateTimetable()`: 
  - Shows loading state
  - Calls API with selected semester
  - Opens PDF in new tab
  - Triggers automatic download
  - Handles all error cases with appropriate messages

**Updated Button:**
- Replaced placeholder toast with actual functionality
- Shows "Generating..." state while processing
- Disabled during generation

---

## Data Mapping Details

### Courses CSV Format
```csv
course_id,title,hours_per_week,teacher_id,batch_id,requires_lab
CSE101_BTECHCSE2024,Introduction to Programming,4,F001,BTECHCSE2024,False
```

**Mapping Logic:**
- `course_id`: `CCODE` + `_` + `batchId` (for horizontal) or `CCODE` (for vertical)
- `title`: `courseName`
- `hours_per_week`: `L + T + P`
- `teacher_id`: `employeeId` (from first faculty assignment)
- `batch_id`: `batchId` or combined batch ID (e.g., "BTECHCSE2024+BTECHCCE2024")
- `requires_lab`: "True" if `P > 0` or `type === "Lab"`, else "False"

### Teachers CSV Format
```csv
teacher_id,name,unavailable_slots,max_hours_per_day
F001,Dr. Aisha Sharma,Mon-A;Tue-B,4
```

**Mapping Logic:**
- `teacher_id`: `employeeId` (or email prefix as fallback)
- `name`: `name`
- `unavailable_slots`: `unavailableSlots` array joined with semicolon
- `max_hours_per_day`: `maxHoursPerDay` (default: 4)

### Batches CSV Format
```csv
batch_id,programme,size
BTECHCSE2024,B.Tech CSE,60
```

**Mapping Logic:**
- `batch_id`: `batchId`
- `programme`: `programme`
- `size`: `size`
- Combined batches automatically created for vertical sharing

### Rooms CSV Format
```csv
room_id,capacity,is_lab
LT101,100,False
LAB201,30,True
```

**Mapping Logic:**
- `room_id`: `roomId`
- `capacity`: `capacity`
- `is_lab`: "True" if `isLab === true`, else "False"

### Slots CSV Format
```csv
slot_id,day,start,end
Mon-A,Monday,09:00,10:00
```

**Mapping Logic:**
- `slot_id`: `slotId`
- `day`: `day`
- `start`: `startTime`
- `end`: `endTime`

---

## Error Handling

### HTTP Status Codes:
- **400 Bad Request**: Invalid semester or missing data
- **422 Unprocessable Entity**: No feasible timetable solution found
- **500 Internal Server Error**: Server/solver/PDF generation error
- **504 Gateway Timeout**: Solver execution timeout (2 minutes)

### User-Friendly Messages:
- ✅ "No courses found for semester X"
- ✅ "No faculty members found in the database"
- ✅ "No batches/rooms/slots configured"
- ✅ "No feasible timetable solution found"
- ✅ "Timetable generation timed out"

---

## Testing Guide

### Prerequisites:
1. ✅ Backend server running (`cd Backend && npm start`)
2. ✅ Frontend dev server running (`cd Frontend && npm run dev`)
3. ✅ MongoDB running with data:
   - Courses with semester, faculty assignments, and student batches
   - Faculties (Users with role="FACULTY" and employeeId)
   - Batches configured
   - Rooms configured
   - Time slots configured
4. ✅ C++ solver built: `Backend/Scheduling Algorithm/build/timetable_solver`
5. ✅ Python script exists: `Backend/Scheduling Algorithm/build/csv_to_pdf.py`
6. ✅ Python dependencies installed: `pandas`, `jinja2`, `weasyprint`

### Test Steps:

#### Test 1: Generate Timetable for Specific Semester
1. Navigate to **Central Management** tab
2. Select a semester from dropdown (e.g., "Semester 1")
3. Click **Generate Timetable** button
4. Observe:
   - Button shows "Generating..."
   - Toast notification appears: "Generating timetable..."
   - After processing: PDF opens in new tab AND downloads
   - Success toast: "Timetable generated successfully! 🎉"

#### Test 2: Generate Timetable for All Semesters
1. Navigate to **Central Management** tab
2. Ensure semester dropdown shows "Semester" (no selection)
3. Click **Generate Timetable** button
4. Observe: PDF generated for all courses

#### Test 3: Error - No Courses
1. Select a semester with no courses (e.g., Semester 8)
2. Click **Generate Timetable**
3. Observe: Error toast with message "No courses found for semester 8"

#### Test 4: Error - Missing Configuration
1. Delete all batches from Configurations
2. Try to generate timetable
3. Observe: Error toast "No batches configured"

#### Test 5: Horizontal Sharing
1. Create a course with multiple batches and sharingType="Horizontal"
2. Generate timetable
3. Verify: Course appears multiple times in `courses.csv` (one per batch)

#### Test 6: Vertical Sharing
1. Create a course with multiple batches and sharingType="Vertical"
2. Generate timetable
3. Verify: Course appears once with combined batch ID (e.g., "BATCH1+BATCH2")

#### Test 7: Faculty Unavailability
1. Go to Faculty Management tab
2. Set unavailable slots for a faculty (e.g., "Mon-A", "Tue-B")
3. Assign that faculty to a course
4. Generate timetable
5. Verify: Generated schedule respects faculty unavailability

---

## File Structure

```
BTP_Project/
├── Backend/
│   ├── Models/
│   │   └── User.js                    [UPDATED] Added faculty fields
│   ├── Routes/
│   │   └── timetable.js               [NEW] Timetable generation logic
│   ├── server.js                      [UPDATED] Registered timetable route
│   └── Scheduling Algorithm/
│       └── build/
│           ├── timetable_solver       [REQUIRED] C++ executable
│           └── csv_to_pdf.py          [REQUIRED] Python PDF generator
├── Frontend/
│   ├── api.js                         [UPDATED] Added generateTimetable()
│   └── src/
│       └── components/
│           └── AcademicsPage.jsx      [UPDATED] Added generation logic
└── TIMETABLE_GENERATION_IMPLEMENTATION.md  [NEW] This file
```

---

## Key Design Decisions

### 1. **Temporary Directory for Isolation**
Each timetable generation request creates a unique temporary directory to avoid conflicts between concurrent requests.

### 2. **Employee ID as Teacher ID**
Uses `employeeId` from User model as the `teacher_id` in the solver. Falls back to email prefix if not set.

### 3. **Combined Batches for Vertical Sharing**
Automatically creates virtual combined batches (e.g., "BATCH1+BATCH2") with aggregated size.

### 4. **Separate Entries for Horizontal Sharing**
Creates separate course entries for each batch, allowing different scheduling per batch.

### 5. **2-Minute Timeout**
Prevents indefinite hangs. If solver takes longer, returns 504 timeout error.

### 6. **Automatic Cleanup**
Temporary files are always cleaned up, even on errors (using `finally` block).

---

## Known Limitations & Future Enhancements

### Current Limitations:
1. **Faculty data not in database**: Currently, faculty details (except User model fields) are stored in localStorage. The new fields (employeeId, unavailableSlots, maxHoursPerDay) are in the database, but full migration is pending.
2. **Single faculty per course**: Only uses the first faculty assignment as the teacher. Multi-faculty courses not fully supported.
3. **No progress indication**: User doesn't see solver progress (could add WebSocket updates).
4. **No schedule preview**: Directly downloads PDF without preview.

### Potential Enhancements:
- [ ] Add faculty data migration script to move localStorage data to database
- [ ] Support multiple teachers per course section
- [ ] Add real-time progress updates via WebSocket
- [ ] Add schedule preview/edit before finalizing
- [ ] Add schedule versioning and history
- [ ] Add conflict detection and resolution UI
- [ ] Support semester-wide constraint editing
- [ ] Add export to Excel/Google Calendar

---

## Troubleshooting

### Issue: "No feasible timetable solution found"
**Causes:**
- Over-constrained problem (too many unavailable slots)
- Not enough rooms
- Not enough time slots
- Faculty teaching too many courses

**Solutions:**
- Reduce faculty unavailable slots
- Add more rooms
- Add more time slots
- Adjust course hours or split large courses

### Issue: "Timetable generation timed out"
**Causes:**
- Problem too complex for solver
- Solver hanging due to constraints

**Solutions:**
- Simplify constraints
- Generate for fewer courses (one semester at a time)
- Increase timeout in `timetable.js` (line 354)

### Issue: "PDF generation did not create output file"
**Causes:**
- Missing Python dependencies
- `csv_to_pdf.py` script errors
- Invalid schedule.csv format

**Solutions:**
- Install: `pip3 install pandas jinja2 weasyprint`
- Check Python script logs in console
- Verify schedule.csv was created

### Issue: "Failed to copy solver/Python script"
**Causes:**
- Solver not built
- Files don't exist at expected path

**Solutions:**
- Build solver: `cd Backend/Scheduling\ Algorithm/build && cmake .. && make`
- Verify files exist:
  - `Backend/Scheduling Algorithm/build/timetable_solver`
  - `Backend/Scheduling Algorithm/build/csv_to_pdf.py`

---

## API Documentation

### Endpoint: `POST /api/timetable/generate`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "semester": 1  // Optional: 1-8, or omit for all semesters
}
```

**Success Response (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="timetable_semester_1.pdf"
Content-Length: <file_size>

<PDF binary data>
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid semester. Must be between 1 and 8."
}
```

**422 Unprocessable Entity:**
```json
{
  "success": false,
  "message": "No feasible timetable solution found. Please review constraints."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error during timetable generation.",
  "error": "Detailed error message"
}
```

**504 Gateway Timeout:**
```json
{
  "success": false,
  "message": "Timetable generation timed out. The problem might be too complex."
}
```

---

## Conclusion

The timetable generation feature is now fully implemented and integrated. Users can:
- ✅ Generate timetables for specific semesters or all courses
- ✅ Configure faculty unavailability constraints
- ✅ Handle horizontal and vertical course sharing
- ✅ Download generated timetables as PDFs
- ✅ Receive clear error messages for any issues

All implementation follows best practices with proper error handling, data validation, and user feedback.

