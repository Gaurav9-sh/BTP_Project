 #include "ortools/sat/cp_model.h"  // CP‑SAT API
 #include <fstream>
 #include <sstream>
 #include <string>
 #include <vector>
 #include <unordered_map>
 #include <iostream>
 #include <algorithm>
 
 using namespace operations_research;
 using namespace sat;
 
 // ──────────────── helpers ───────────────────
 
 // Split a CSV line on commas (no quoted fields)
 std::vector<std::string> split(const std::string& line, char delim = ',') {
   std::vector<std::string> out;
   std::stringstream ss(line);
   std::string tok;
   while (std::getline(ss, tok, delim)) out.push_back(tok);
   return out;
 }
 
 // Map string IDs ("T02","B23","Mon-A") → dense ints 0…N-1
 template <class Map>
 int index_of(Map& m, const std::string& key) {
   auto it = m.find(key);
   if (it != m.end()) return it->second;
   int nxt = static_cast<int>(m.size());
   return m[key] = nxt;
 }
 
 // Flat index helper for day(0–4) & col(0–4) → 0–24
 inline int flat(int day, int col) { return day * 5 + col; }
 
 // ───────────── data structs ───────────────────
 
 struct Course {
   std::string id;
   int hours_per_week;
   int teacher;      // dense index
   int batch;        // dense index
   bool needs_lab;
   int batch_size;   // filled from batches.csv
 };
 
 struct Teacher {
   std::string id;
   std::vector<int> unavailable_slots;  // flat slot indices
   int max_hours_per_day;
 };
 
 struct Room { std::string id; int cap; bool is_lab; };
 struct Slot { std::string id; int day; int col; };
 
 // ───────────── CSV loader ───────────────────
 
 void load_csvs(std::vector<Course>& courses,
                std::vector<Teacher>& teachers,
                std::vector<Room>&    rooms,
                std::vector<Slot>&    slots) {
 
   std::unordered_map<std::string,int> teacher_map, batch_map, slot_map;
 
   // 1) slots.csv → 25 entries Mon-A…Fri-E
   {
     std::ifstream f("slots.csv");
     std::string line;
     std::getline(f, line);  // header
     int row = 0;
     while (std::getline(f, line)) {
       auto t = split(line);
       slot_map[t[0]] = row;
       slots.push_back({t[0], row / 5, row % 5});
       ++row;
     }
   }
 
   // 2) rooms.csv
   {
     std::ifstream f("rooms.csv");
     std::string line;
     std::getline(f, line);
     while (std::getline(f, line)) {
       auto t = split(line);
       rooms.push_back({t[0], std::stoi(t[1]), t[2]=="true"});
     }
   }
 
   // 3) batches.csv → capture batch sizes
   std::vector<int> batch_sizes;
   {
     std::ifstream f("batches.csv");
     std::string line;
     std::getline(f, line);
     while (std::getline(f, line)) {
       auto t = split(line);
       int b = index_of(batch_map, t[0]);
       if (b >= (int)batch_sizes.size()) batch_sizes.resize(b+1);
       batch_sizes[b] = std::stoi(t[2]);
     }
   }
 
   // 4) teachers.csv
   {
     std::ifstream f("teachers.csv");
     std::string line;
     std::getline(f, line);
     while (std::getline(f, line)) {
       auto t = split(line);
       int p = index_of(teacher_map, t[0]);
       if (p >= (int)teachers.size()) teachers.resize(p+1);
       std::vector<int> unav;
       for (auto& token : split(t[2], ';'))
         if (!token.empty()) unav.push_back(slot_map[token]);
       teachers[p] = {t[0], unav, std::stoi(t[3])};
     }
   }
 
   // 5) courses.csv
   {
     std::ifstream f("courses.csv");
     std::string line;
     std::getline(f, line);
     while (std::getline(f, line)) {
       auto t = split(line);
       int p = index_of(teacher_map, t[3]);
       int b = index_of(batch_map, t[4]);
       courses.push_back({
         t[0],
         std::stoi(t[2]),
         p, b,
         t[5]=="true",
         0  // batch_size, fill below
       });
     }
   }
 
   // Attach batch_size to each course
   for (auto& c : courses) c.batch_size = batch_sizes[c.batch];
 }
 
 // ────────────── solver ───────────────────────
 
 int main() {
   // Load all CSV data
   std::vector<Course>  C;
   std::vector<Teacher> P;
   std::vector<Room>    R;
   std::vector<Slot>    S;
   load_csvs(C, P, R, S);
 
   const int nC = C.size();
   const int nT = S.size();      // should be 25
   const int nR = R.size();
   const int nTeach = P.size();
   // Derive batch count
   int nBatch = 0;
   for (auto& c : C) nBatch = std::max(nBatch, c.batch+1);
 
   // Build model
   CpModelBuilder model;
 
   // --- 1A) Decision vars X[c][t][r] as BoolVar ---
   std::vector<std::vector<std::vector<BoolVar>>> X(
     nC,
     std::vector<std::vector<BoolVar>>(nT, std::vector<BoolVar>(nR))
   );
   for (int c = 0; c < nC; ++c)
     for (int t = 0; t < nT; ++t)
       for (int r = 0; r < nR; ++r) {
         X[c][t][r] = model.NewBoolVar();
         // Hard‐filter impossible placements
         if (R[r].cap < C[c].batch_size)     model.AddEquality(X[c][t][r], 0);
         if (C[c].needs_lab && !R[r].is_lab)  model.AddEquality(X[c][t][r], 0);
       }
 
   // --- 1B) Hard constraints ---
   // H‑1 Room clash
   for (int t = 0; t < nT; ++t)
     for (int r = 0; r < nR; ++r) {
       LinearExpr load;
       for (int c = 0; c < nC; ++c) load += X[c][t][r];
       model.AddLessOrEqual(load, 1);
     }
   // H‑2 Teacher clash
   for (int t = 0; t < nT; ++t)
     for (int p = 0; p < nTeach; ++p) {
       LinearExpr load;
       for (int c = 0; c < nC; ++c)
         if (C[c].teacher == p)
           for (int r = 0; r < nR; ++r) load += X[c][t][r];
       model.AddLessOrEqual(load, 1);
     }
   // H‑3 Batch clash
   for (int t = 0; t < nT; ++t)
     for (int b = 0; b < nBatch; ++b) {
       LinearExpr load;
       for (int c = 0; c < nC; ++c)
         if (C[c].batch == b)
           for (int r = 0; r < nR; ++r) load += X[c][t][r];
       model.AddLessOrEqual(load, 1);
     }
   // H‑4 Weekly hours
   for (int c = 0; c < nC; ++c) {
     LinearExpr taught;
     for (int t = 0; t < nT; ++t)
       for (int r = 0; r < nR; ++r) taught += X[c][t][r];
     model.AddEquality(taught, C[c].hours_per_week);
   }
   // B‑6 Teacher unavailable (hard)
   for (int c = 0; c < nC; ++c)
     for (int ban : P[C[c].teacher].unavailable_slots)
       for (int r = 0; r < nR; ++r)
         model.AddEquality(X[c][ban][r], 0);
   // B‑7 Max hours/day per teacher
   for (int p = 0; p < nTeach; ++p)
     for (int d = 0; d < 5; ++d) {
       LinearExpr daily;
       for (int col = 0; col < 5; ++col) {
         int t = flat(d, col);
         for (int c = 0; c < nC; ++c)
           if (C[c].teacher == p)
             for (int r = 0; r < nR; ++r) daily += X[c][t][r];
       }
       model.AddLessOrEqual(daily, P[p].max_hours_per_day);
     }
   // B‑8 Max 3 consec slots per batch
   const int MAX_SEQ = 3;
   for (int b = 0; b < nBatch; ++b)
     for (int d = 0; d < 5; ++d)
       for (int start = 0; start <= 5 - MAX_SEQ; ++start) {
         LinearExpr window;
         for (int off = 0; off < MAX_SEQ; ++off) {
           int t = flat(d, start + off);
           for (int c = 0; c < nC; ++c)
             if (C[c].batch == b)
               for (int r = 0; r < nR; ++r) window += X[c][t][r];
         }
         model.AddLessOrEqual(window, MAX_SEQ);
       }
   // B‑9 Lab double‑periods
   for (int c = 0; c < nC; ++c) if (C[c].needs_lab)
     for (int d = 0; d < 5; ++d)
       for (int col = 0; col < 4; ++col) {
         int t1 = flat(d, col), t2 = flat(d, col+1);
         for (int r = 0; r < nR; ++r)
           model.AddEquality(X[c][t1][r], X[c][t2][r]);
       }
 
   // --- 2) Soft constraints = objective ---
   LinearExpr objective;
 
   // S‑1 Compact teacher day (gaps)
   const int GAP_PEN = 2;
   for (int p = 0; p < nTeach; ++p)
     for (int d = 0; d < 5; ++d)
       for (int col = 0; col < 4; ++col) {
         int t1 = flat(d,col), t2 = flat(d,col+1);
         // BoolVar for gap
         BoolVar gap = model.NewBoolVar();
         LinearExpr pres1, pres2;
         for (int c = 0; c < nC; ++c) if (C[c].teacher == p)
           for (int r = 0; r < nR; ++r) {
             pres1 += X[c][t1][r];
             pres2 += X[c][t2][r];
           }
         // |pres1 - pres2| ≤ gap*2  etc.
         model.AddGreaterOrEqual(gap, pres1 - pres2);
         model.AddGreaterOrEqual(gap, pres2 - pres1);
         model.AddLessOrEqual(gap, pres1 + pres2);
         objective += GAP_PEN * gap;
       }
 
   // S‑3 Early‑morning penalty
   const int EARLY_PEN = 1;
   for (int t = 0; t < nT; ++t) if (S[t].col == 0)
     for (int c = 0; c < nC; ++c)
       for (int r = 0; r < nR; ++r)
         objective += EARLY_PEN * X[c][t][r];
 
   // S‑4 Right‑sized rooms (waste)
   for (int c = 0; c < nC; ++c)
     for (int t = 0; t < nT; ++t)
       for (int r = 0; r < nR; ++r)
         objective += (R[r].cap - C[c].batch_size) * X[c][t][r];
 
   // S‑5 Minimise rooms per course
   const int ROOM_PEN = 2;
   for (int c = 0; c < nC; ++c)
     for (int r = 0; r < nR; ++r) {
       BoolVar used = model.NewBoolVar();
       LinearExpr sum;
       for (int t = 0; t < nT; ++t) sum += X[c][t][r];
       model.AddGreaterOrEqual(sum, used);
       model.AddLessOrEqual(sum, C[c].hours_per_week * used);
       objective += ROOM_PEN * used;
     }
 
   // S‑6 Example preference: teacher 0 dislikes cols 3,4
   const int PREF_PEN = 1;
   for (int c = 0; c < nC; ++c) if (C[c].teacher == 0)
     for (int t = 0; t < nT; ++t) if (S[t].col >= 3)
       for (int r = 0; r < nR; ++r)
         objective += PREF_PEN * X[c][t][r];
 
   // S‑7 Balance room usage (minimise max load)
   std::vector<IntVar> room_hours(nR);
   for (int r = 0; r < nR; ++r) {
     LinearExpr tot;
     for (int c = 0; c < nC; ++c)
       for (int t = 0; t < nT; ++t) tot += X[c][t][r];
     room_hours[r] = model.NewIntVar(Domain(0,nC*5)).WithName("load");
     model.AddEquality(room_hours[r], tot);
   }
   IntVar maxLoad = model.NewIntVar(Domain(0,nC*5)).WithName("maxLoad");
   for (auto& lh : room_hours) model.AddLessOrEqual(lh, maxLoad);
   objective += maxLoad;  // weight = 1
 
   model.Minimize(objective);
 
   // ──────── solve ─────────
   Model m;
   m.Add(NewSatParameters(R"pb(
    num_search_workers: 8
    max_time_in_seconds: 60.0    
    log_search_progress: true    
  )pb"));
   // <-- use SolveCpModel, not Solve(...)
   CpSolverResponse resp = SolveCpModel(model.Build(), &m);
 
   // ──────── output ────────
   std::ofstream csv("schedule.csv");
    csv << "Course,Slot,Room\n";            // header row

    if (resp.status() == CpSolverStatus::OPTIMAL ||
    resp.status() == CpSolverStatus::FEASIBLE) {

        for (int c = 0; c < nC; ++c)
            for (int t = 0; t < nT; ++t)
                for (int r = 0; r < nR; ++r)
                    if (SolutionIntegerValue(resp, X[c][t][r])) {
                        csv << C[c].id << ','          // Course
                            << S[t].id << ','          // Slot
                            << R[r].id << '\n';        // Room
                    }

        csv.close();
        std::cerr << "✔ Wrote schedule.csv with feasible timetable (obj="
            << resp.objective_value() << ")\n";
    } else {
        csv.close();
        std::cerr << "No feasible schedule; CSV left empty.\n";
    }
   return 0;
 } 