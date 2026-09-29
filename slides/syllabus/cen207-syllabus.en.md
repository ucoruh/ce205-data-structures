---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Data Structures — Syllabus"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Syllabus"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# CEN207 Data Structures

**Syllabus — Fall Semester, 2026-2027**

Asst. Prof. Dr. Uğur CORUH

<!-- Speaker note: This deck mirrors the syllabus page section by section, so the class can also read it as a document at any time. -->

---

# Course at a glance

- **CEN207 Data Structures** (formerly CE205)
- Compulsory course, 3rd semester
- Theory 3 h/week · Credit 3 · ECTS 5
- Language of instruction: **English**
- Prerequisite: **CEN108 Algorithms and Programming II** (former code CE100)

<!-- Speaker note: These five facts are the ones students ask about first; everything else in this deck expands on them. -->

---

<!-- _class: yogun -->

# Course information — contact & logistics

| | |
| --- | --- |
| **Instructor** | Asst. Prof. Dr. Uğur CORUH |
| **Contact** | ugur.coruh@erdogan.edu.tr — subject line must start with **[CEN207]** |
| **Office** | F-301 |
| **Office hours** | By appointment by e-mail; in the office or online with the university account |
| **Lecture day, time, room** | Friday 13:00–16:00 · İİBF & Faculty of Law Building, D-402 (ED-K4-2) |

<!-- Speaker note: The [CEN207] subject tag is not optional — it is how e-mail gets triaged and answered quickly. -->

---

<!-- _class: yogun -->

# Course information — course details

| | |
| --- | --- |
| **Course website** | https://ucoruh.github.io/ce205-data-structures/ |
| **Course class** | A new class is opened every term; the class code is announced in week 1 |
| **Type / semester** | Compulsory · 3rd semester |
| **Weekly hours / credit / ECTS** | Theory 3 h · Credit 3 · ECTS 5 |
| **Prerequisite** | CEN108 Algorithms and Programming II (former code CE100) |

<!-- Speaker note: Details on the prerequisite toolchain are on the separate Prerequisites page and deck. -->

---

<!-- _class: bolum -->

# A. Course Description

<!-- Speaker note: One paragraph, restated here as the ideas it is built from. -->

---

# What this course is about

- Fundamentals of **data structures** and **file organization**
- How data is mapped in programs: application run-time memory **and** long-term file storage
- Implementations, programming styles and run-time representations of these data objects
- Also covers **sorting**, **searching** and **graph algorithms**

<!-- Speaker note: The throughline is "how is data shaped and mapped to memory or storage" — every week answers that for one structure. -->

---

# How the course is taught

- Practice-oriented: programming practice in class **and** a term project
- Not theory alone — you build every structure yourself
- Goal: show how digital data structures solve real-world problems

<!-- Speaker note: This is why the term project exists — reading about a hash table and building one are different skills. -->

---

<!-- _class: bolum -->

# B. Course Learning Outcomes

<!-- Speaker note: Seven outcomes; every week's content and every rubric criterion maps back to one or more of these. -->

---

<!-- _class: yogun -->

# Learning outcomes (LO.1–LO.7)

| Code | Learning outcome |
| --- | --- |
| LO.1 | Explain definitions, representations and basic operations of linear and non-linear data structures |
| LO.2 | Analyze time/space complexity (Big-O); compare data structure performance |
| LO.3 | Implement fundamental sorting and searching algorithms; analyze and compare them |
| LO.4 | Implement balanced/unbalanced tree structures and hash tables |
| LO.5 | Implement the graph data structure and fundamental graph algorithms |
| LO.6 | Explain sequential, direct and indexed file organization; evaluate applications |
| LO.7 | Select the data structures/algorithms best suited to a problem and build an efficient solution |

<!-- Speaker note: LO.7 is the synthesis outcome — the term project is where it is actually exercised. -->

---

<!-- _class: yogun -->

# Contribution of LOs to program outcomes (0–5)

| | PO.1 | PO.2 | PO.3 | PO.4 | PO.5 | PO.6–12 |
| --- | --- | --- | --- | --- | --- | --- |
| LO.1 | 5 | – | – | – | – | – |
| LO.2 | 5 | – | – | – | – | – |
| LO.3 | – | – | – | 5 | – | – |
| LO.4 | – | 4 | 3 | 5 | – | – |
| LO.5 | – | 4 | 3 | 5 | – | – |
| LO.6 | – | – | – | 4 | 5 | – |
| LO.7 | 5 | 4 | – | 3 | – | – |

**PO.1** Basic knowledge · **PO.2** Problem solving · **PO.3** Design · **PO.4** Modern tools/techniques · **PO.5** Research and experimentation

<!-- Speaker note: This table exists for accreditation traceability; students mainly need the LO table on the previous slide. -->

---

<!-- _class: bolum -->

# C. Weekly Schedule

<!-- Speaker note: Sixteen weeks, two exam weeks, one project with two checkpoints inside it. -->

---

# The one rule for every assessment

**Project demonstrations** take place in the week just **before** the
midterm and final exam weeks.

**Quizzes** take place **inside** the midterm and final exam weeks —

so that every student can attend.

<!-- Speaker note: This is why week 7 is a demo week and week 8 is a quiz week, and likewise weeks 15/16. -->

---

<!-- _class: cok-yogun -->

# Weekly schedule (1–8)

| Wk | Date | Topic | LO |
| --- | --- | --- | --- |
| 1 | 18.09.2026 (make-up 23.09) | Introduction, Big-O, Pointers | 1, 2, 7 |
| 2 | 25.09.2026 | Linked Lists, Arrays, Matrices | 1, 7 |
| 3 | 02.10.2026 | Stacks and Queues | 1, 7 |
| 4 | 09.10.2026 | Trees, Heaps, Huffman | 1, 4, 7 |
| 5 | 16.10.2026 | Graphs and Traversals | 1, 5, 7 |
| 6 | 23.10.2026 | Search and Hashing | 3, 4, 7 |
| 7 | 30.10.2026 | **Midterm Project Demonstrations** | 1–5, 7 |
| 8 | 31.10–08.11.2026 | **Midterm Exam Week: Quiz-1** | 1, 2, 4, 5, 7 |

<!-- Speaker note: Full topic detail for each week is on that week's own page and deck — this is the map, not the territory. -->

---

<!-- _class: cok-yogun -->

# Weekly schedule (9–16)

| Wk | Date | Topic | LO |
| --- | --- | --- | --- |
| 9 | 13.11.2026 | Graph Algorithms | 3, 5, 7 |
| 10 | 20.11.2026 | Sorting | 2, 3, 7 |
| 11 | 27.11.2026 | Advanced Trees | 4, 7 |
| 12 | 04.12.2026 | Strings | 1, 3, 4, 7 |
| 13 | 11.12.2026 | File Organisation I | 6, 7 |
| 14 | 18.12.2026 | File Organisation II | 3, 4, 6, 7 |
| 15 | 25.12.2026 | **Final Project Demonstrations** | 1–7 |
| 16 | 04–17.01.2027 | **Final Exam Period: Quiz-2** | 2–7 |

<!-- Speaker note: Quiz-1 covers weeks 1–6, Quiz-2 covers weeks 9–14 — the two project weeks (7, 15) are not quiz material. -->

---

# Enrichment topics (optional reading)

Kept from previous years, covered in the course notes as **optional** reading:

alpha-beta pruning · Hasse diagrams · Petri nets · bipartite graphs ·
Bayesian networks · van Emde Boas trees · SimHash · trie hashing

<!-- Speaker note: These are not examined; they are there for students who want to go further. -->

---

<!-- _class: bolum -->

# D. Textbooks, Software and Equipment

<!-- Speaker note: The course notes are self-contained — the textbooks below are for students who want a second explanation. -->

---

# The main resource

**The course notes on the course website are self-contained** and are the
main resource for this course.

The books on the next slide are recommended for **further reading** only.

<!-- Speaker note: Nothing in the assessment requires a textbook purchase. -->

---

<!-- _class: yogun -->

# Recommended textbooks

- Deitel & Deitel. *C How to Program*, 7th ed. Prentice Hall, 2013.
- Y. Daniel Liang. *Introduction to Java Programming, Comprehensive Version*, 10th ed.
- T. H. Cormen, C. E. Leiserson, R. L. Rivest, C. Stein. *Introduction to Algorithms*, 3rd ed. MIT Press.
- J. R. Hanly, E. B. Koffman. *Problem Solving and Program Design in C*, 6th ed.
- A. L. Tharp. *File Organization and Processing*. Wiley, 1988.
- P. Brass. *Advanced Data Structures*. Cambridge University Press, 2008.
- R. Sedgewick, K. Wayne. *Algorithms*, 4th ed. Addison-Wesley, 2011.

<!-- Speaker note: Cormen et al. and Sedgewick & Wayne are the two most reused across the semester. -->

---

# Laptop and toolchain — required

You use your **own development environment** in class, assignments and the project:

- A C/C++ compiler: **GCC**, **Clang** or **MSVC**
- **CMake**, **GoogleTest**, **Doxygen**
- **JDK 21** with **Maven** and **JUnit 5**
- **Git** with a **GitHub** account

Installation steps: week 1 and the course notes. Exact checklist: the
course website's **Prerequisites** page.

<!-- Speaker note: Project templates are already set up for this exact toolchain — students do not configure it from scratch. -->

---

<!-- _class: bolum -->

# E. Assessment

<!-- Speaker note: One project, two checkpoints, two quizzes — that is the entire assessment structure. -->

---

# One term project, two checkpoints

- **One term project**, evaluated at **two checkpoints**, each with its own rubric
- **Midterm checkpoint:** C implementation
- **Final checkpoint:** Java implementation
- Plus **one quiz** in the midterm exam week, **one quiz** in the final exam period
- Topics, team rules, deliverables and detailed rubrics: the **project guide**

<!-- Speaker note: The project guide deck and page go into far more depth than this syllabus does — this is just the weight breakdown. -->

---

# Assessment components

| Assessment | Code | Weight | When |
| --- | --- | --- | --- |
| Project checkpoint 1 — C, report, demo | RAP1 | 60% of midterm | Week 7 (30.10.2026) |
| Quiz-1 (weeks 1–6) | QUIZ1 | 40% of midterm | Week 8 (31.10–08.11.2026) |
| Project checkpoint 2 — Java, report, demo | RAP2 | 70% of final | Week 15 (25.12.2026) |
| Quiz-2 (weeks 9–14) | QUIZ2 | 30% of final | Week 16 (04–17.01.2027) |

<!-- Speaker note: RAP1/RAP2 are the project checkpoints; QUIZ1/QUIZ2 are the written quizzes — same codes used in the project guide. -->

---

# How the final grade is computed

$$
Grade_{Midterm} = 0.6 \cdot RAP1 + 0.4 \cdot QUIZ1
$$

$$
Grade_{Final} = 0.7 \cdot RAP2 + 0.3 \cdot QUIZ2
$$

$$
Passing\ Grade = 0.4 \cdot Grade_{Midterm} + 0.6 \cdot Grade_{Final}
$$

<!-- Speaker note: Final checkpoint and final quiz together carry more weight than the midterm side — the course leans toward the Java/second half. -->

---

<!-- _class: yogun -->

# Workload (ECTS 5 = 125 hours)

| Activity | Count | Hours | Total |
| --- | --- | --- | --- |
| Class attendance | 14 | 3 | 42 |
| Individual study (weekly notes/examples) | 14 | 1 | 14 |
| Quiz (midterm week, final period) | 2 | 2 | 4 |
| Individual study for quizzes | 2 | 10 | 20 |
| Project preparation (C and Java) | 2 | 16 | 32 |
| Report preparation | 2 | 5 | 10 |
| Project presentation (demo, questions) | 2 | 1.5 | 3 |
| **Total** | | | **125** |

<!-- Speaker note: 125 hours over roughly 14 weeks is close to 9 hours a week — plan the project preparation hours early, not the week before. -->

---

<!-- _class: bolum -->

# F–K. Policies

<!-- Speaker note: Six short sections — instructional method, late work, communication, integrity, expectations, updates. -->

---

# F. Instructional strategies and methods

- Lectures are **face-to-face**: explanation, question–answer, hands-on programming
- Each content week: course notes, slides, worked examples, self-check questions
- Announcements, resources and submissions: the course class
- **Attendance is taken**

<!-- Speaker note: The self-check questions at the end of each week's notes are the fastest way to know if that week landed. -->

---

# G. Late homework

- Assignments must be submitted by the **announced deadline**
- **Overdue assignments will not be accepted**
- Unexpected situations must be reported to the instructor **by the student**

<!-- Speaker note: "Unexpected situations" means contact the instructor before the deadline, not after. -->

---

# H. Course platform and communication

- All announcements, resources and submissions: the **course class**
- A **new class** opens every term; the code is announced in week 1
- Course notes, slides and downloadable documents: the **course website**
- Check the class and your **university e-mail every day**

<!-- Speaker note: Two channels, checked daily — the class for logistics, e-mail for anything personal. -->

---

# I. Academic integrity, plagiarism & cheating

Academic integrity is one of RTEÜ's most important principles.

Anyone who breaches it is **severely punished**.

"Studying together" is natural and encouraged — the question is where it
crosses into "academic dishonesty." The next two slides draw that line.

<!-- Speaker note: If a situation is not covered by the next two slides, the rule is simple: ask the instructor first. -->

---

# I.a What is acceptable

- Discussing the assignment with classmates to understand it better
- Using ideas/quotes/snippets found online **with citation**, not as the whole solution
- Asking for help with the **English** of your assignment
- Discussing solutions with diagrams or summaries, **not actual text or code**
- Working with a tutor, provided the tutor does not do the assignment for you

<!-- Speaker note: The common thread: understanding help is fine, receiving the answer itself is not. -->

---

# I.b What is not acceptable

- Asking to see a classmate's solution before submitting your own
- Failing to cite the origin of outside text or code used in your work
- Giving or showing your own solution to a struggling classmate

<!-- Speaker note: All three are about the DIRECTION help flows — receiving or handing over a finished solution, not discussing it. -->

---

# J. Expectations

- Attend classes **on time**; complete weekly requirements (readings, project milestones)
- Main channel: **e-mail**, from your **university address**
- **Include the course code** in the subject line and **your name** in the message
- The instructor also reaches you by e-mail — check it **every day**

<!-- Speaker note: The subject-line rule is the same one from the contact information slide — it is enforced consistently. -->

---

# K. Lecture content and syllabus updates

If deemed necessary, the lecture content or course schedule **may change**.

Any change within the scope of this document will be **announced by the
instructor**.

<!-- Speaker note: Changes are the exception, not the rule — but this is the clause that allows the course to adapt if it needs to. -->

---

<!-- _class: baslik -->

# Questions?

**Course website:** ucoruh.github.io/ce205-data-structures

**Contact:** ugur.coruh@erdogan.edu.tr — subject **[CEN207]**

<!-- Speaker note: Prerequisites and the project guide are the two pages every student should read next. -->
