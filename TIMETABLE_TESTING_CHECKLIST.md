# Timetable Generation - Testing Checklist

## Pre-Testing Setup

### 1. Environment Verification
- [ ] MongoDB is running
- [ ] Backend server is running (`npm start` in Backend directory)
- [ ] Frontend dev server is running (`npm run dev` in Frontend directory)
- [ ] You can login to the application

### 2. Database Configuration Check
Run these checks in MongoDB or through the Configurations page:

- [ ] **Batches**: At least 1 batch configured
  - Example: `{ batchId: "BTECHCSE2024", programme: "B.Tech CSE", size: 60 }`

- [ ] **Rooms**: At least 2 rooms configured (1 classroom, 1 lab)
  - Example classroom: `{ roomId: "LT101", capacity: 100, isLab: false }`
  - Example lab: `{ roomId: "LAB201", capacity: 30, isLab: true }`

- [ ] **Slots**: At least 5 time slots configured
  - Example: `{ slotId: "Mon-A", day: "Monday", startTime: "09:00", endTime: "10:00" }`

- [ ] **Courses**: At least 1 course configured with:
  - Valid semester (1-8)
  - Faculty assignment (at least one faculty with email)
  - Student batch assignment (at least one batch)
  - L-T-P values set

- [ ] **Faculties**: At least 1 user with role="FACULTY"
  - Should have `employeeId` set (e.g., "F001")
  - Optional: Set `unavailableSlots` array
  - Optional: Set `maxHoursPerDay` (default: 4)

### 3. System Files Verification
- [ ] Solver exists: `Backend/Scheduling Algorithm/build/timetable_solver`
- [ ] Python script exists: `Backend/Scheduling Algorithm/build/csv_to_pdf.py`
- [ ] Solver is executable: Run `chmod +x Backend/Scheduling\ Algorithm/build/timetable_solver`

### 4. Python Dependencies
- [ ] Install required packages:
  ```bash
  pip3 install pandas jinja2 weasyprint
  ```
- [ ] Verify installation:
  ```bash
  python3 -c "import pandas, jinja2, weasyprint; print('All dependencies OK')"
  ```

---

## Testing Scenarios

### Test 1: Basic Timetable Generation ✅
**Objective**: Generate a simple timetable for one semester

**Steps**:
1. Login as ADMIN
2. Go to "Central Management" tab
3. Select "Semester 1" from dropdown
4. Click "Generate Timetable"
5. Wait for processing (button shows "Generating...")

**Expected Result**:
- ✅ Toast: "Generating timetable... This may take a moment."
- ✅ After 5-30 seconds, new tab opens with PDF
- ✅ PDF also downloads automatically
- ✅ Success toast: "Timetable generated successfully! 🎉"
- ✅ Button returns to "Generate Timetable" state

**If Failed**: Check browser console and backend logs for errors

---

### Test 2: Generate for All Semesters ✅
**Objective**: Generate timetable for all courses regardless of semester

**Steps**:
1. Go to "Central Management" tab
2. Ensure semester dropdown shows "Semester" (no selection)
3. Click "Generate Timetable"

**Expected Result**:
- ✅ PDF generated with all courses
- ✅ Filename: `timetable_all_semesters.pdf`

---

### Test 3: Empty Semester Error Handling ✅
**Objective**: Test error handling when no courses exist

**Steps**:
1. Select "Semester 8" (assuming no courses in semester 8)
2. Click "Generate Timetable"

**Expected Result**:
- ✅ Error toast: "Validation Error: No courses found for semester 8."
- ✅ No PDF generated
- ✅ Button returns to normal state

---

### Test 4: Missing Configuration Error ✅
**Objective**: Test validation of required configurations

**Steps**:
1. Go to "Configurations" tab
2. Delete all batches
3. Go back to "Central Management"
4. Try to generate timetable

**Expected Result**:
- ✅ Error toast: "Validation Error: No batches configured. Please configure batches first."

**Cleanup**: Re-add batches after test

---

### Test 5: Horizontal Sharing ✅
**Objective**: Verify courses are duplicated per batch for horizontal sharing

**Setup**:
1. Create a course with:
   - `sharingType: "Horizontal"`
   - `studentBatches: ["BTECHCSE2024", "BTECHCCE2024"]`
2. Generate timetable

**Verification** (check backend console logs):
- ✅ `courses.csv` should contain 2 entries:
  - `CSE101_BTECHCSE2024,...`
  - `CSE101_BTECHCCE2024,...`

---

### Test 6: Vertical Sharing ✅
**Objective**: Verify combined batch creation for vertical sharing

**Setup**:
1. Create a course with:
   - `sharingType: "Vertical"`
   - `studentBatches: ["BTECHCSE2024", "BTECHCCE2024"]`
2. Generate timetable

**Verification** (check backend console logs):
- ✅ `batches.csv` should contain combined batch:
  - `BTECHCSE2024+BTECHCCE2024,B.Tech CSE,120`
- ✅ `courses.csv` should contain single entry:
  - `CSE101,...,BTECHCSE2024+BTECHCCE2024,...`

---

### Test 7: Faculty Unavailability ✅
**Objective**: Verify faculty unavailable slots are respected

**Setup**:
1. Go to "Faculty Management" tab
2. Click on a faculty's unavailable slots (edit icon)
3. Select "Mon-A" and "Tue-B" as unavailable
4. Assign this faculty to a course
5. Generate timetable

**Verification**:
- ✅ In generated PDF, this faculty should NOT be scheduled during Mon-A or Tue-B slots
- ✅ `teachers.csv` should show: `...,Mon-A;Tue-B,4`

---

### Test 8: Lab Course Handling ✅
**Objective**: Verify lab courses are assigned to lab rooms

**Setup**:
1. Create a course with `P: 2` (or `type: "Lab"`)
2. Ensure at least one room has `isLab: true`
3. Generate timetable

**Verification**:
- ✅ `courses.csv` should show `requires_lab: True`
- ✅ In PDF, lab course should be scheduled in a lab room

---

### Test 9: No Feasible Solution ✅
**Objective**: Test error handling when solver can't find a solution

**Setup**:
1. Create constraints that are impossible to satisfy:
   - 10 courses with 10 hours each
   - Only 2 time slots
   - Mark all faculty as unavailable for most slots
2. Generate timetable

**Expected Result**:
- ✅ Error toast: "No Solution Found: No feasible timetable solution found. Please review constraints (faculty availability, room capacity, etc.)."
- ✅ Backend logs show solver error

---

### Test 10: Concurrent Requests ✅
**Objective**: Verify multiple users can generate timetables simultaneously

**Setup**:
1. Open application in 2 different browsers
2. Login to both
3. Click "Generate Timetable" in both at the same time

**Expected Result**:
- ✅ Both requests complete successfully
- ✅ No file conflicts (each uses unique temp directory)

---

## Post-Testing Verification

### 1. Check Backend Logs
Look for:
- ✅ "📅 Generating timetable for semester X..."
- ✅ "📊 Fetching data from database..."
- ✅ "✅ Found N courses, M faculties, P batches, Q rooms, R slots"
- ✅ "🔄 Transforming data..."
- ✅ "📁 Creating temporary directory..."
- ✅ "✓ Created courses.csv (N rows)"
- ✅ "⚙️ Running timetable solver..."
- ✅ "✅ schedule.csv generated successfully"
- ✅ "📄 Generating PDF..."
- ✅ "✅ PDF generated successfully"
- ✅ "📤 Sending PDF to client..."
- ✅ "🧹 Cleaning up temporary files..."
- ✅ "✅ Timetable generation completed successfully!"

### 2. Check Temporary Directory Cleanup
```bash
# Should be empty or not exist
ls /tmp/timetable_*
```

### 3. Verify PDF Contents
- ✅ PDF opens correctly
- ✅ Contains timetable grid
- ✅ Shows courses, teachers, rooms, time slots
- ✅ No obvious conflicts (same teacher/room in same slot)

---

## Common Issues & Solutions

### Issue: Button stays in "Generating..." state
**Cause**: Request failed but state wasn't reset
**Solution**: Refresh page, check network tab for error

### Issue: PDF downloads but is empty/corrupted
**Cause**: Python script error or invalid schedule.csv
**Solution**: 
1. Check backend logs for Python errors
2. Verify Python dependencies installed
3. Test Python script manually:
   ```bash
   cd Backend/Scheduling\ Algorithm/build
   python3 csv_to_pdf.py schedule.csv test.pdf
   ```

### Issue: "No courses found" but courses exist
**Cause**: 
- Courses don't have semester field set
- Filtering issue
**Solution**: Check course documents in MongoDB, ensure `semester` field is set

### Issue: "No feasible solution" always
**Cause**: Over-constrained problem
**Solution**:
1. Reduce faculty unavailability
2. Add more rooms
3. Add more time slots
4. Reduce course hours
5. Generate for fewer courses (one semester at a time)

### Issue: Solver timeout
**Cause**: Problem too complex
**Solution**:
1. Reduce number of courses (generate per semester)
2. Simplify constraints
3. Increase timeout in `timetable.js` (line 354): change `timeout: 120000` to higher value

---

## Performance Benchmarks

Based on expected usage:

| Scenario | Courses | Expected Time | Status |
|----------|---------|---------------|--------|
| Single semester (5 courses) | 5 | 5-10 seconds | ✅ Fast |
| Single semester (20 courses) | 20 | 15-30 seconds | ✅ Normal |
| All semesters (100 courses) | 100 | 30-60 seconds | ⚠️ Slow |
| Complex constraints | Any | 60-120 seconds | ⚠️ May timeout |

---

## Ready to Deploy Checklist

- [ ] All 10 test scenarios passed
- [ ] No errors in backend logs
- [ ] PDFs generated correctly
- [ ] Temporary files cleaned up
- [ ] Faculty unavailability working
- [ ] Both horizontal and vertical sharing working
- [ ] Error handling working correctly
- [ ] User feedback (toasts) working
- [ ] PDF opens in new tab
- [ ] PDF downloads automatically
- [ ] Button states correct (disabled during generation)
- [ ] Documentation complete

---

## Next Steps (Optional Enhancements)

1. **Faculty Data Migration**: Create script to migrate faculty data from localStorage to database
2. **Progress Indicator**: Add real-time progress updates via WebSocket
3. **Schedule Preview**: Show schedule in-app before downloading
4. **Conflict Detection**: Highlight conflicts in UI before generation
5. **Export Options**: Add Excel/CSV/Google Calendar export
6. **Schedule History**: Save generated schedules with versioning
7. **Batch Generation**: Generate timetables for multiple semesters at once
8. **Optimization Options**: Allow users to prioritize certain constraints

---

## Support & Debugging

If you encounter issues during testing:

1. **Check Backend Console**: Most errors are logged here
2. **Check Browser Console**: Frontend errors appear here
3. **Check Network Tab**: See API request/response details
4. **Check MongoDB**: Verify data integrity
5. **Test Solver Manually**: Run solver directly with sample CSV files
6. **Test Python Script**: Run `csv_to_pdf.py` directly

For help, refer to:
- `TIMETABLE_GENERATION_IMPLEMENTATION.md` - Full implementation details
- Backend logs - Detailed execution trace
- `timetable.js` - Source code with comments

---

**Good luck with testing! 🚀**


