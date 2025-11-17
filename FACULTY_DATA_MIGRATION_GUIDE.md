# Faculty Data Migration Guide

## Overview

This guide helps you migrate faculty data to the database to support timetable generation. The new User model includes three additional fields required for timetable scheduling:

- `employeeId`: Unique employee identifier (used as teacher_id in solver)
- `unavailableSlots`: Array of time slot IDs when faculty is unavailable
- `maxHoursPerDay`: Maximum teaching hours per day (default: 4)

---

## Prerequisites

1. ✅ Backend server configured (MongoDB connection working)
2. ✅ Faculty members exist in database with role="FACULTY"
3. ✅ Time slots configured in database (needed for unavailableSlots)

---

## Step 1: List Current Faculty

First, see all faculty members and their current data:

```bash
cd Backend
npm run list-faculty
```

**Expected Output:**
```
📋 Found 5 faculty members

Current faculty members:
================================================================================
⚠️  Dr. Aisha Sharma (aisha@lnmiit.ac.in)
   Department: Computer Science and Engineering
   Employee ID: NOT SET
   Unavailable Slots: None
   Max Hours/Day: NOT SET (default: 4)

✅ Dr. Ramesh Gupta (ramesh@lnmiit.ac.in)
   Department: Physics
   Employee ID: F003
   Unavailable Slots: Mon-A, Tue-B
   Max Hours/Day: 4
...
```

**Legend:**
- ⚠️  = Data not set (needs migration)
- ✅ = Data already set (no action needed)

---

## Step 2: Prepare Faculty Data

### Option A: Update the Migration Script

Edit `Backend/scripts/migrateFacultyData.js` and update the `FACULTY_DATA` array:

```javascript
const FACULTY_DATA = [
  {
    email: "aisha@lnmiit.ac.in",          // Must match email in database
    employeeId: "F001",                    // Unique employee ID
    unavailableSlots: ["Mon-A", "Tue-B"],  // When faculty is unavailable (optional)
    maxHoursPerDay: 6                      // Maximum teaching hours per day
  },
  {
    email: "vikram@lnmiit.ac.in",
    employeeId: "F002",
    unavailableSlots: [],                  // Empty array = no constraints
    maxHoursPerDay: 4                      // Default value
  },
  // Add more faculty...
];
```

**Field Guidelines:**

1. **employeeId** (Required)
   - Format: "F001", "F002", etc. (or any unique identifier)
   - Must be unique across all faculty
   - Used as `teacher_id` in the timetable solver
   - Example: "F001", "EMP12345", "CSE_001"

2. **unavailableSlots** (Optional)
   - Array of slot IDs when faculty is not available
   - Must match `slotId` values from Configurations → Slots
   - Format: `["Mon-A", "Tue-B", "Wed-C"]`
   - Use empty array `[]` if no constraints
   - Example: `["Mon-A", "Tue-B"]` = unavailable on Monday slot A and Tuesday slot B

3. **maxHoursPerDay** (Optional)
   - Number between 1 and 12
   - Default: 4 (if not specified)
   - Constraint for timetable solver
   - Example: 6 = maximum 6 teaching hours per day

### Option B: Update Manually in MongoDB

If you prefer, you can update faculty records directly in MongoDB:

```javascript
db.users.updateOne(
  { email: "aisha@lnmiit.ac.in" },
  { 
    $set: { 
      employeeId: "F001",
      unavailableSlots: ["Mon-A", "Tue-B"],
      maxHoursPerDay: 6
    }
  }
)
```

---

## Step 3: Run Migration

After updating the `FACULTY_DATA` array, run the migration:

```bash
cd Backend
npm run migrate-faculty
```

**Expected Output:**
```
📡 Connecting to MongoDB...
✅ Connected to MongoDB

🔄 Migrating faculty data...

✅ Updated: Dr. Aisha Sharma (aisha@lnmiit.ac.in)
   - Employee ID: F001
   - Unavailable Slots: Mon-A, Tue-B
   - Max Hours/Day: 6

✅ Updated: Prof. Vikram Singh (vikram@lnmiit.ac.in)
   - Employee ID: F002
   - Unavailable Slots: None
   - Max Hours/Day: 4

...

============================================================
📊 MIGRATION SUMMARY
============================================================
✅ Successfully updated: 5
❌ Not found: 0
⚠️  Errors: 0
============================================================

📋 All Faculty Members with Timetable Data:
============================================================

👤 Dr. Aisha Sharma (aisha@lnmiit.ac.in)
   Employee ID: F001
   Department: Computer Science and Engineering
   Unavailable Slots: Mon-A, Tue-B
   Max Hours/Day: 6

...

============================================================
✅ Migration completed successfully!
============================================================
```

---

## Step 4: Verify Migration

### Method 1: Using the Script
```bash
npm run list-faculty
```

All faculty should now show ✅ status.

### Method 2: Through Application UI
1. Login to the application
2. Go to **Faculty Management** tab
3. Check that:
   - Employee IDs are displayed
   - Unavailable slots can be edited (click edit icon)
   - All fields are properly set

### Method 3: MongoDB Query
```javascript
db.users.find({ role: "FACULTY" }, {
  name: 1,
  email: 1,
  employeeId: 1,
  unavailableSlots: 1,
  maxHoursPerDay: 1
})
```

---

## Step 5: Configure Unavailable Slots via UI (Optional)

Instead of setting unavailable slots in the migration script, you can set them through the UI:

1. Go to **Faculty Management** tab
2. Find the faculty member
3. Click the edit icon (✏️) next to "Unavailable Slots"
4. Check/uncheck time slots
5. Changes are saved automatically

This allows for easier ongoing management of faculty availability.

---

## Common Issues & Solutions

### Issue: "User not found: email@example.com"
**Cause**: Email in `FACULTY_DATA` doesn't match any user in database

**Solution**:
1. Run `npm run list-faculty` to see actual emails
2. Update `FACULTY_DATA` with correct email addresses
3. Ensure email matches exactly (case-sensitive)

### Issue: "User X is not a FACULTY"
**Cause**: User exists but role is not "FACULTY"

**Solution**:
Update user role in database:
```javascript
db.users.updateOne(
  { email: "email@lnmiit.ac.in" },
  { $set: { role: "FACULTY" } }
)
```

### Issue: Duplicate employeeId error
**Cause**: Two faculty members have the same employeeId

**Solution**:
Each faculty must have a unique employeeId. Update `FACULTY_DATA` with unique IDs:
- F001, F002, F003, etc.
- Or use actual employee IDs from HR system

### Issue: Invalid slot IDs in unavailableSlots
**Cause**: Slot IDs in `unavailableSlots` don't exist in Configurations

**Solution**:
1. Go to Configurations → Time Slots
2. Note the exact `slotId` values (e.g., "Mon-A", "Tue-B")
3. Update `unavailableSlots` to match these exact IDs

---

## Example: Complete Migration Flow

### Starting State
Faculty in database but missing timetable fields:
```javascript
{
  name: "Dr. Aisha Sharma",
  email: "aisha@lnmiit.ac.in",
  role: "FACULTY",
  department: "Computer Science and Engineering"
  // Missing: employeeId, unavailableSlots, maxHoursPerDay
}
```

### Step 1: List Faculty
```bash
npm run list-faculty
```
Output shows: ⚠️ Dr. Aisha Sharma - Employee ID: NOT SET

### Step 2: Update Migration Script
Edit `Backend/scripts/migrateFacultyData.js`:
```javascript
const FACULTY_DATA = [
  {
    email: "aisha@lnmiit.ac.in",
    employeeId: "CSE001",
    unavailableSlots: ["Mon-A", "Fri-E"],  // Not available Monday 9am and Friday 5pm
    maxHoursPerDay: 5
  }
];
```

### Step 3: Run Migration
```bash
npm run migrate-faculty
```

### Step 4: Verify
```bash
npm run list-faculty
```
Output shows: ✅ Dr. Aisha Sharma - Employee ID: CSE001

### Final State
Faculty now has all required fields:
```javascript
{
  name: "Dr. Aisha Sharma",
  email: "aisha@lnmiit.ac.in",
  role: "FACULTY",
  department: "Computer Science and Engineering",
  employeeId: "CSE001",
  unavailableSlots: ["Mon-A", "Fri-E"],
  maxHoursPerDay: 5
}
```

---

## Best Practices

### 1. Employee ID Naming Convention
Choose a consistent format:
- **Option A**: Sequential (F001, F002, F003...)
- **Option B**: Department-based (CSE001, ECE001, PHY001...)
- **Option C**: Actual HR IDs (EMP12345, EMP12346...)

### 2. Unavailable Slots Management
- Start with empty arrays `[]` during migration
- Let faculty update their own availability through UI
- Or gather availability data before migration

### 3. Max Hours Per Day
- Default (4 hours) works for most cases
- Senior faculty might prefer fewer hours (3)
- Junior faculty might be willing to teach more (6)
- Consider workload and other responsibilities

### 4. Incremental Migration
Don't need to migrate all faculty at once:
1. Start with active faculty teaching this semester
2. Add new faculty as needed
3. Migration script can be run multiple times safely

---

## Automation Options

### Option 1: CSV Import
Create a CSV with faculty data and import:
```csv
email,employeeId,maxHoursPerDay
aisha@lnmiit.ac.in,F001,5
vikram@lnmiit.ac.in,F002,4
```

Then modify the migration script to read from CSV.

### Option 2: Bulk Update
If all faculty should have similar settings:
```javascript
// Update all faculty with default values
await User.updateMany(
  { role: "FACULTY", employeeId: null },
  { 
    $set: { 
      maxHoursPerDay: 4,
      unavailableSlots: []
    }
  }
);

// Then set employeeId individually (must be unique)
```

---

## Rollback

If you need to undo the migration:

```javascript
// Remove timetable fields from all faculty
db.users.updateMany(
  { role: "FACULTY" },
  { 
    $unset: { 
      employeeId: "",
      unavailableSlots: "",
      maxHoursPerDay: ""
    }
  }
)
```

---

## Post-Migration Checklist

- [ ] All faculty have unique employeeId set
- [ ] No duplicate employeeId values
- [ ] All unavailableSlots reference valid slot IDs
- [ ] maxHoursPerDay values are reasonable (1-12)
- [ ] Run `npm run list-faculty` shows all ✅
- [ ] Faculty can edit unavailable slots through UI
- [ ] Timetable generation works correctly
- [ ] Generated timetables respect faculty constraints

---

## Integration with Timetable Generation

After migration, the timetable generation will use this data:

1. **employeeId** → `teacher_id` in `teachers.csv`
2. **unavailableSlots** → `unavailable_slots` in `teachers.csv` (semicolon-separated)
3. **maxHoursPerDay** → `max_hours_per_day` in `teachers.csv`

Example `teachers.csv` entry after migration:
```csv
teacher_id,name,unavailable_slots,max_hours_per_day
CSE001,Dr. Aisha Sharma,Mon-A;Fri-E,5
```

The C++ solver will:
- ✅ Not schedule Dr. Aisha on Monday slot A or Friday slot E
- ✅ Ensure Dr. Aisha teaches maximum 5 hours per day
- ✅ Use "CSE001" as the teacher identifier in the schedule

---

## Support

If you encounter issues:
1. Check migration script logs
2. Verify MongoDB connection
3. Ensure faculty records exist with role="FACULTY"
4. Check slot IDs match Configurations
5. Refer to `TIMETABLE_GENERATION_IMPLEMENTATION.md` for full details

---

**Ready to migrate? Run `npm run list-faculty` to get started! 🚀**


