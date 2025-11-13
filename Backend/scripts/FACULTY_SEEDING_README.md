# Faculty Seeding Guide

## Quick Start

Generate 60 dummy faculty members instantly!

### Option 1: Fresh Start (Clear existing + Add new)
```bash
cd Backend
npm run seed-faculties -- --clear
```

### Option 2: Add to Existing
```bash
cd Backend
npm run seed-faculties -- --force
```

### Option 3: Check First (Safe)
```bash
cd Backend
npm run seed-faculties
# If faculties exist, it will ask you to choose --clear or --force
```

---

## What Gets Created?

### 60 Faculty Members with:
- ✅ **Realistic names** (Indian names with proper designations)
- ✅ **Unique emails** (firstname.lastname@lnmiit.ac.in)
- ✅ **Employee IDs** (Format: CSE001, ECE002, PHY003, etc.)
- ✅ **Departments** (Distributed across all 7 departments)
- ✅ **Role** (All set to "FACULTY")
- ✅ **Default password** (password123 for all)
- ✅ **Unavailable slots** (0-3 random slots per faculty)
- ✅ **Max hours/day** (3-6 hours, weighted towards 4-5)

### Department Distribution:
- CSE: ~9 faculties
- CCE: ~9 faculties
- ECE: ~9 faculties
- MME: ~9 faculties
- PHY: ~8 faculties
- HSC: ~8 faculties
- MAT: ~8 faculties

**Total: 60 faculties**

---

## Sample Generated Faculty

```javascript
{
  name: "Dr. Rajesh Sharma",
  email: "rajesh.sharma@lnmiit.ac.in",
  password: "password123",
  role: "FACULTY",
  department: "CSE",
  employeeId: "CSE001",
  unavailableSlots: ["Mon-A", "Wed-C"],
  maxHoursPerDay: 5
}

{
  name: "Prof. Priya Kumar",
  email: "priya.kumar@lnmiit.ac.in",
  password: "password123",
  role: "FACULTY",
  department: "ECE",
  employeeId: "ECE001",
  unavailableSlots: [],
  maxHoursPerDay: 4
}

// ... and 58 more faculties
```

---

## Commands

### Seed Faculties
```bash
npm run seed-faculties           # Check first, safe mode
npm run seed-faculties -- --clear    # Delete existing + add new
npm run seed-faculties -- --force    # Add to existing
```

### View Faculties
```bash
npm run list-faculty             # Show all faculties with status
```

### Migrate Existing Faculties
```bash
npm run migrate-faculty          # Update existing faculty data
```

---

## Use Cases

### 1. Initial Setup (No faculties yet)
```bash
npm run seed-faculties
# Creates 60 new faculties
```

### 2. Reset All Faculties
```bash
npm run seed-faculties -- --clear
# Deletes all existing faculties
# Creates 60 new faculties
```

### 3. Add More Faculties
```bash
npm run seed-faculties -- --force
# Keeps existing faculties
# Adds 60 more faculties
# Total = existing + 60
```

---

## Important Notes

### Default Password
🔑 **All seeded faculties have password: `password123`**

Users can login with:
- Email: `firstname.lastname@lnmiit.ac.in`
- Password: `password123`

### Employee ID Format
Employee IDs follow the pattern: `DEPT###`
- CSE: CSE001, CSE002, CSE003, ...
- ECE: ECE001, ECE002, ECE003, ...
- PHY: PHY001, PHY002, PHY003, ...

### Unavailable Slots
- Randomly generated (0-3 slots per faculty)
- Uses common slot IDs (Mon-A, Tue-B, etc.)
- Can be updated later through UI or migration script

### Max Hours Per Day
- Randomly set between 3-6 hours
- Weighted distribution: mostly 4-5 hours
- Senior faculty might have fewer hours (3)
- Junior faculty might have more hours (6)

---

## After Seeding

### Verify Seeding
```bash
npm run list-faculty
# Should show 60 faculties with ✅ status
```

### Test Login
1. Open application frontend
2. Try logging in with any seeded faculty:
   - Email: `rajesh.sharma@lnmiit.ac.in`
   - Password: `password123`

### Use in Timetable Generation
1. Go to Central Management
2. Assign seeded faculties to courses
3. Generate timetable
4. Faculties will be included with their constraints

---

## Customization

Want different data? Edit `Backend/scripts/seedFaculties.js`:

### Change Number of Faculties
```javascript
// Line ~85
for (let i = 0; i < 60; i++) {  // Change 60 to desired number
```

### Change Default Password
```javascript
// Line ~80
passwordHash: bcrypt.hashSync("password123", 10), // Change "password123"
```

### Change Name Lists
```javascript
// Lines 11-16
const FIRST_NAMES = [
  "Rajesh", "Priya", // Add your names here
];
```

### Change Slot IDs
```javascript
// Lines 32-37
const SAMPLE_SLOTS = [
  "Mon-A", "Mon-B", // Match your actual slot IDs
];
```

---

## Troubleshooting

### Error: "Faculty already exists"
**Solution**: Use `--clear` flag to delete existing faculties first
```bash
npm run seed-faculties -- --clear
```

### Error: "Cannot connect to MongoDB"
**Solution**: 
1. Check if MongoDB is running
2. Verify `.env` file has correct `MONGO_URI`
3. Test connection: `npm start`

### Want Fresh Start
```bash
# Delete all faculties and start over
npm run seed-faculties -- --clear
```

### Duplicate Emails
The script generates unique emails using indexes. If you run `--force` multiple times, you might get duplicates. Use `--clear` for fresh data.

---

## Integration with Timetable

After seeding, faculties are ready for timetable generation:

1. **Employee IDs**: Already set (CSE001, ECE002, etc.)
2. **Unavailable Slots**: Already configured (random)
3. **Max Hours**: Already set (3-6 hours)
4. **Department**: Properly distributed

Just assign them to courses and generate timetables!

---

## Quick Reference

```bash
# Seed 60 faculties (fresh start)
npm run seed-faculties -- --clear

# View all faculties
npm run list-faculty

# Generate timetable
# (After assigning faculties to courses)
```

---

## Summary

This script creates **60 realistic faculty members** with:
- ✅ Valid emails and employee IDs
- ✅ Proper department distribution
- ✅ Timetable generation ready
- ✅ Random but realistic constraints
- ✅ Default login credentials

**Ready to use immediately after seeding!** 🚀

