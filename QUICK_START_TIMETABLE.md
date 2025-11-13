# Quick Start: Timetable Generation Feature

## 🚀 Get Started in 5 Minutes

This guide will help you quickly set up and test the new timetable generation feature.

---

## ✅ Step 1: Verify Setup (2 minutes)

### Check Required Files
```bash
cd "BTP_Project/Backend/Scheduling Algorithm/build"
ls -la timetable_solver csv_to_pdf.py
```
Both files should exist. If not:
```bash
cd ..
mkdir -p build && cd build
cmake .. && make
# Copy csv_to_pdf.py to build directory if needed
```

### Check Python Dependencies
```bash
python3 -c "import pandas, jinja2, weasyprint; print('✅ All dependencies OK')"
```
If error, install:
```bash
pip3 install pandas jinja2 weasyprint
```

### Make Solver Executable
```bash
chmod +x "BTP_Project/Backend/Scheduling Algorithm/build/timetable_solver"
```

---

## ✅ Step 2: Prepare Database (2 minutes)

### Ensure You Have Minimum Data:

**Check Configurations:**
1. Open application → Login as ADMIN
2. Go to **Configurations** tab
3. Verify you have:
   - ✅ At least 1 Batch (e.g., BTECHCSE2024)
   - ✅ At least 2 Rooms (1 regular, 1 lab)
   - ✅ At least 5 Time Slots (e.g., Mon-A, Tue-B, Wed-C, Thu-D, Fri-E)

If missing, add them through the UI.

**Check Faculty:**
```bash
cd Backend
npm run list-faculty
```

If faculty don't have employeeId:
1. Edit `Backend/scripts/migrateFacultyData.js`
2. Update FACULTY_DATA array
3. Run: `npm run migrate-faculty`

(See `FACULTY_DATA_MIGRATION_GUIDE.md` for details)

**Check Courses:**
Go to **Department Management** → Select a department
- Ensure at least 1 course exists
- Course should have semester (1-8) set
- Course should have faculty assigned
- Course should have batch assigned

---

## ✅ Step 3: Generate Your First Timetable! (1 minute)

1. **Login** as ADMIN or Faculty
2. Go to **Central Management** tab
3. Select a semester from dropdown (e.g., "Semester 1")
4. Click **Generate Timetable** button
5. Wait 5-30 seconds
6. **PDF opens in new tab** and downloads automatically! 🎉

---

## 🎯 What Happens Behind the Scenes?

```
User clicks button
    ↓
Frontend calls API: POST /api/timetable/generate
    ↓
Backend fetches data from MongoDB
    ↓
Backend generates 5 CSV files:
    - teachers.csv (faculty data)
    - courses.csv (course data)
    - batches.csv (batch data)
    - rooms.csv (room data)
    - slots.csv (time slot data)
    ↓
C++ Solver processes CSVs → schedule.csv
    ↓
Python script: schedule.csv → output.pdf
    ↓
PDF sent to browser
    ↓
Success! 🎉
```

---

## 🔧 Troubleshooting

### "No courses found for semester X"
**Fix**: Add courses for that semester through Department Management

### "No batches configured"
**Fix**: Go to Configurations → Batches → Add at least one batch

### "No feasible timetable solution found"
**Fix**: 
- Reduce faculty unavailable slots
- Add more time slots
- Add more rooms
- Try generating for fewer courses

### "Timetable generation timed out"
**Fix**: 
- Generate for one semester at a time (not all semesters)
- Simplify constraints

### Button stuck on "Generating..."
**Fix**: 
- Check backend console for errors
- Refresh page
- Check network tab in browser DevTools

---

## 📊 Test Scenarios

### Scenario 1: Simple Timetable
**Setup**: 3 courses, 1 faculty, 1 batch, 2 rooms, 5 slots
**Expected**: Completes in 5-10 seconds

### Scenario 2: Complex Timetable
**Setup**: 20 courses, 10 faculties, 5 batches, 10 rooms, 20 slots
**Expected**: Completes in 20-40 seconds

### Scenario 3: With Constraints
**Setup**: Add faculty unavailable slots
**Expected**: Generated schedule respects constraints

---

## 📚 Documentation Reference

Need more details? Check these files:

1. **TIMETABLE_GENERATION_IMPLEMENTATION.md**
   - Complete technical documentation
   - Data mapping details
   - Error handling reference

2. **TIMETABLE_TESTING_CHECKLIST.md**
   - 10 detailed test scenarios
   - Verification steps
   - Common issues

3. **FACULTY_DATA_MIGRATION_GUIDE.md**
   - Faculty data setup
   - Migration script usage
   - Field explanations

---

## 🎓 Advanced Features

### Generate for All Semesters
1. Go to Central Management
2. Leave semester dropdown at "Semester" (no selection)
3. Click Generate Timetable
4. All courses included in timetable

### Configure Faculty Unavailability
1. Go to Faculty Management
2. Click edit icon (✏️) next to Unavailable Slots
3. Check/uncheck time slots
4. Saved automatically

### Handle Horizontal Sharing
1. In Central Management, find course
2. Set Sharing Type to "Horizontal"
3. Assign multiple batches
4. Each batch gets separate time slot

### Handle Vertical Sharing
1. Set Sharing Type to "Vertical"
2. Assign multiple batches
3. All batches attend together (combined)

---

## 🚨 Important Notes

1. **Faculty must have employeeId set** for timetable generation
   - Run `npm run list-faculty` to check
   - Run `npm run migrate-faculty` to set

2. **Courses must have**:
   - Semester (1-8)
   - Faculty assignment
   - Batch assignment
   - L-T-P values

3. **Configurations must include**:
   - Batches (student groups)
   - Rooms (classrooms/labs)
   - Slots (time periods)

4. **Timeout is 2 minutes**
   - If solver takes longer, you'll get timeout error
   - Solution: Generate smaller subsets

---

## 📞 Need Help?

### Check Logs
**Backend Console**: Shows detailed progress and errors
```bash
cd Backend
npm start
# Look for messages starting with 📅, 📊, ✅, ❌
```

**Browser Console**: Shows frontend errors
- Open DevTools (F12)
- Check Console tab
- Look for red errors

### Manual Testing
Test solver directly:
```bash
cd "Backend/Scheduling Algorithm/build"
./timetable_solver
# Should create schedule.csv
python3 csv_to_pdf.py schedule.csv test.pdf
# Should create test.pdf
```

---

## ✅ Quick Checklist

Before generating timetable, ensure:

- [ ] Backend server running
- [ ] Frontend server running
- [ ] MongoDB connected
- [ ] Solver executable exists and is executable
- [ ] Python script exists
- [ ] Python dependencies installed
- [ ] At least 1 batch configured
- [ ] At least 2 rooms configured
- [ ] At least 5 slots configured
- [ ] At least 1 course with semester, faculty, and batch
- [ ] All faculty have employeeId set

If all checked, you're ready to generate! 🎉

---

## 🎉 Success Criteria

You'll know it's working when:

1. ✅ Button shows "Generating..."
2. ✅ Toast notification appears
3. ✅ After 5-30 seconds, PDF opens in new tab
4. ✅ PDF also downloads
5. ✅ Success toast: "Timetable generated successfully! 🎉"
6. ✅ PDF shows:
   - Course schedule grid
   - Time slots
   - Courses assigned to rooms
   - Faculty names
   - No obvious conflicts

---

## 🔄 Next Steps

After successfully generating your first timetable:

1. ✅ Test with different semesters
2. ✅ Add faculty constraints (unavailable slots)
3. ✅ Test horizontal vs vertical sharing
4. ✅ Generate for all semesters at once
5. ✅ Configure faculty max hours per day
6. ✅ Add more complex scenarios

---

**Ready? Go to Central Management → Select Semester → Click Generate Timetable! 🚀**

For detailed testing, see `TIMETABLE_TESTING_CHECKLIST.md`

