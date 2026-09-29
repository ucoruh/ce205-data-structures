---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Week 13 — File Organisation I: Sequential and Direct Files"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Week 13"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# File Organisation I: Sequential and Direct Files

**CEN207 Data Structures — Week 13**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!--
Speaker note: Every structure so far lived in RAM. This week moves to disk, where the unit that matters is not a comparison but a block read.
-->

---

# Today's plan (3 hours)

| Hour | Topic |
| --- | --- |
| 1 | Blocks, records/fields **Anim 1** · blocking factor **Anim 2** · sequential search **Anim 3** |
| 2 | Binary search of a sorted file **Anim 4** · sequential update / merge **Anim 5** |
| 3 | Relative access **Anim 6** · hashing to buckets **Anim 7** · progressive overflow **Anim 8** · tombstones **Anim 9** |

**Learning outcomes:** LO.1 (explain fundamental data structures) · LO.2 (analyze complexity) · LO.6 (implement in C and Java) · LO.7 (choose the right structure)

<!-- Speaker note: Nine short animations carry the whole lecture; each idea gets one normal run and one edge/hard run, right where it is introduced. -->

---

# This week's concepts — where

| Concept | Where |
| --- | --- |
| Records/fields, blocking factor | Sections 2–3 |
| Sequential search, binary search of a sorted file | Sections 4–5 |
| Sequential update (merge master + transactions) | Section 6 |
| Relative (direct) access | Section 7 |
| Hashing to buckets, progressive overflow, tombstones | Sections 8–10 |

<!-- Speaker note: Every term gets a full definition the first time it appears; this table just says where to find it again. -->

---

# How the code examples work

- Every idea has a complete **C** and **Java** program
- Both perform **real file I/O**: `fopen`/`fseek`/`fread`/`fwrite`, `RandomAccessFile`
- Each program creates its own **temporary lab folder**, then deletes it
- Sources: `code/week-13/c/` and `code/week-13/java/`
- Each program's expected output is in the week notes

<!-- Speaker note: Open a terminal now if you want to run these live; every program creates a scratch folder in the OS temp directory, never inside the repo. -->

---

# Recap — computed addresses (Week 1)

- `arr[i]` = `base_address + i * element_size`
- No **searching** needed to reach index `i` — just arithmetic
- Section 7's relative file is exactly this idea, moved to disk
- `block = rrn / bf`, `offset = rrn % bf` — computed, not searched

<!-- Speaker note: This week keeps returning to one theme — trading a search for a computation whenever the data's layout allows it. -->

---

# Recap — hashing and collisions (Week 6)

- `h(key) = key mod m` picks a slot in RAM
- Collisions resolved by **chaining** or **open addressing**
- Sections 8–10 reuse both ideas, unchanged in logic
- The only difference: every "slot" is now a disk position

<!-- Speaker note: If you understood Week 6's hash table, sections 8-10 are the same table, just one level removed from RAM. -->

---

# The one genuinely new idea

- Weeks 1–12: cost = **comparisons**, swaps, pointer hops
- This week: cost = **block reads and writes**
- A block read costs orders of magnitude more than any RAM op
- Comparing extra records *already in RAM* costs almost nothing

<!-- Speaker note: This single shift in what you count is the organizing idea of the entire week — everything else follows from it. -->

---

# Map of the week — at a glance

| Family | Sections |
| --- | --- |
| Foundations | Records/fields (2), blocking factor (3) |
| Sequential — process **in order** | Search (4), sorted search (5), update (6) |
| Direct — **compute** the location | Relative (7), hashing (8–10) |

<!-- Speaker note: Every box here gets its own full section below, each with an animation, a real program, and a complexity/mistakes discussion. -->

---

<!-- _class: bolum -->

# 1. Why Files Are Different: Block-Oriented I/O

<!-- Speaker note: Section 1 has no animation of its own — it sets up the drawing convention and cost model every later section reuses. -->

---

# A question to start

A file usually cannot fit in RAM at all. If a
program needs one 20-byte record, why does
the disk not just hand over 20 bytes?

<!-- Speaker note: The answer is a hardware and file-system fact, not a design choice any program can opt out of. -->

---

# The idea: a block is the smallest unit of I/O

- Disks are organized into fixed-size **blocks**
- Every read/write transfers **one whole block**, never less
- Even a 20-byte request loads the entire surrounding block
- This is *why* file organisation exists as a topic at all

<!-- Speaker note: Every technique this week is really a strategy for minimizing the number of block reads and writes. -->

---

# This week's drawing convention

- A **disk** row: named, numbered blocks, contents drawn inside
- A **RAM buffer** row: the one block currently loaded
- **Block reads** and **block writes**, counted on the right
- That count *is* this week's `O(...)` — watch it, not the keys

<!-- Speaker note: Every single animation this week uses exactly this layout — once you can read one, you can read all nine. -->

---

# Two families, one week

| Family | Locate a record |
| --- | --- |
| **Sequential** (sections 4–6) | Read blocks in order, or jump to a middle block |
| **Direct** (sections 7–10) | One calculation, then one block read |

Sequential wins when you process **every** record anyway; direct wins for **one** lookup among millions.

<!-- Speaker note: Real systems very often use both at once — a sequential file for batch jobs, a hashed file for interactive lookups. -->

---

# Mini-quiz

A sequential search reads 100 blocks, comparing
1 key per block. A second file reads 100 blocks,
comparing 1000 keys per block. Which is faster?

<!-- Speaker note: Think about what actually costs time here — the comparisons, or the disk accesses. -->

---

# Answer

**Neither — they cost about the same.** The disk
access dominates; comparing extra keys already
sitting in a loaded block is nearly free.

<!-- Speaker note: This is precisely why every section from here on counts block reads, not comparisons, as its complexity. -->

---

<!-- _class: bolum -->

# 2. Records and Fields

<!-- Speaker note: Section 2 is about packing several fields of a record into bytes — and unpacking them again on read. -->

---

# A question to start

A name field can hold "Al" or
"Christopherson". Should every record reserve
the same number of bytes for it regardless?

<!-- Speaker note: The three answers below trade wasted space against parsing cost, and none of them is free. -->

---

# Three layouts for the same field

| Layout | How | Cost |
| --- | --- | --- |
| Fixed-length | Pad or **truncate** to `NAME_FIXED` | Wasted space or lost data |
| Delimited | Write value, then a delimiter byte | Scan to find the delimiter |
| Length-prefixed | Write length byte, then that many bytes | O(1) read, max length 255 |

<!-- Speaker note: Fixed-length pays with wasted or lost bytes; delimited pays with a scan; length-prefixed pays with a hard size cap. -->

---

# Why fixed-length matters most

- Every record is **exactly the same size**
- That is what makes computing an address from a position possible
- Section 3 (blocking) and section 7 (direct access) both need this
- Delimited/length-prefixed records cannot be located this way

<!-- Speaker note: This is the seed of the whole "compute instead of search" theme that runs through the rest of the week. -->

---

# Intuition — a form with a "name" box

- A paper form's name box is a **fixed** size on the page
- A spreadsheet cell **grows** to fit whatever you type — delimited
- A shipping label prints a length, then that many characters
- All three exist in real systems, for exactly these trade-offs

<!-- Speaker note: None of these three is "the right one" in general — the right choice depends entirely on whether records need a fixed, computable size. -->

---

# Records and fields, step by step

<iframe class="dsanim" src="anim/records-and-fields.html?yer=slayt&lang=en" title="Records and fields"></iframe>

<!-- Speaker note: Normal example: 11 records, `NAME_FIXED=8` — watch which names get padded and which get silently truncated. -->

---

# Edge case — every name longer than 8 characters

<iframe class="dsanim" src="anim/records-and-fields.html?yer=slayt&lang=en&example=edge-all-truncated" title="Records and fields: all truncated"></iframe>

<!-- Speaker note: Every single record loses data in the fixed layout here — the worst case for this technique, made maximal on purpose. -->

---

# Edge case — an empty name and a very long name

<iframe class="dsanim" src="anim/records-and-fields.html?yer=slayt&lang=en&example=edge-empty-and-long" title="Records and fields: empty and long"></iframe>

<!-- Speaker note: An empty name is fully padded in the fixed layout, costs zero bytes in the delimited layout — two very different ways to handle the same extreme. -->

---

# Code — fixed-length: pad or truncate

```c
#define NAME_FIXED 8

int n = (int) strlen(name);
if (n >= NAME_FIXED) {
    /* too long: truncate, data is LOST */
    memcpy(r.name, name, NAME_FIXED);
} else {
    memcpy(r.name, name, n);
    /* pad with filler bytes */
    memset(r.name + n, '_', NAME_FIXED - n);
}
```

<!-- Speaker note: Truncation is silent unless the program itself decides to report it — the code above prints a warning specifically for that reason. -->

---

# Code — length-prefixed: O(1) to read back

```c
unsigned char len =
    (unsigned char) strlen(name);
fwrite(&len, 1, 1, fp);   /* 1-byte prefix */
fwrite(name, 1, len, fp);

/* reading back: read len, then read
   exactly len more bytes — no scanning */
```

<!-- Speaker note: No delimiter character is needed at all, and no character has to be forbidden inside the name — the trade is a 255-byte length cap. -->

---

# Complexity

- Writing/reading one field: **O(field length)**, all three layouts
- The difference is **not** asymptotic
- It is wasted space (fixed) vs. parsing cost (delimited) vs. neither (capped, length-prefixed)

<!-- Speaker note: This is a rare case this semester where the interesting trade-off is not in the big-O at all. -->

---

# Common mistakes

- Forgetting a full/truncated fixed field has **no room for `'\0'`**
- Choosing a delimiter that can legally appear inside the data
- **Silently** truncating instead of reporting the data loss

<!-- Speaker note: A delimiter like a comma inside a name breaks the moment a real name contains a comma — length-prefixing sidesteps this class of bug entirely. -->

---

# Mini-quiz

Why is a length-prefixed field's read cost
O(1) plus its own length, while a delimited
field's read cost is a full scan?

<!-- Speaker note: Think about what information the reader has *before* it starts reading the field's content. -->

---

# Answer

**The length-prefixed reader is told the size
in advance** (one byte, then that many bytes).
A delimited reader must scan byte by byte,
comparing against the delimiter, to find the end.

<!-- Speaker note: The length-prefixed scheme's one byte of overhead buys it certainty a scan can never have in advance. -->

---

<!-- _class: bolum -->

# 3. Blocking Factor

<!-- Speaker note: Section 3 answers a question section 1 left open — how many records actually share one disk access? -->

---

# A question to start

A block is 100 bytes; one record is 20 bytes.
Does the disk waste 80 bytes on every read, or
can several records share one block?

<!-- Speaker note: The answer is the blocking factor — and it does not eliminate waste, it only relocates where the waste happens. -->

---

# The idea: pack `bf` records per block

- `bf = floor(blockSize / recSize)`
- Records fill a small **RAM buffer**, one at a time
- The moment the buffer reaches `bf` records: **one** `fwrite`
- Disk access happens **per block**, not per record

<!-- Speaker note: This is the entire payoff of blocking — bf records for the price of one disk access, not bf separate accesses. -->

---

# Two kinds of waste

| Kind | Where | Cause |
| --- | --- | --- |
| Internal fragmentation | Every **full** block | `bf * recSize` rarely equals `blockSize` exactly |
| Last-block waste | Only the **final** block | Record count is not an exact multiple of `bf` |

<!-- Speaker note: A partial last block still occupies a whole block on disk — block_flush writes it anyway, waste included. -->

---

# Intuition — a moving truck, not a courier bike

- A courier bike carries **one** package per trip: slow, one at a time
- A moving truck carries `bf` boxes per trip: fewer trips, same boxes
- A truck that leaves half-empty still burns a full trip's fuel
- That "half-empty trip" is exactly this section's last-block waste

<!-- Speaker note: The truck analogy makes both kinds of waste tangible: cargo space unused per trip, and a trip taken for very little cargo. -->

---

# Blocking factor, step by step

<iframe class="dsanim" src="anim/blocking-factor.html?yer=slayt&lang=en" title="Blocking factor"></iframe>

<!-- Speaker note: Watch the RAM buffer fill to bf, flush as one block write, then start over empty for the next block. -->

---

# Edge case — record bigger than the block

<iframe class="dsanim" src="anim/blocking-factor.html?yer=slayt&lang=en&example=edge-too-big" title="Blocking factor: bf=0 error"></iframe>

<!-- Speaker note: bf computes to 0 here — a real system must detect and reject this as a design error, never silently misbehave. -->

---

# Edge case — 12 keys divide bf=3 exactly

<iframe class="dsanim" src="anim/blocking-factor.html?yer=slayt&lang=en&example=edge-exact" title="Blocking factor: no last-block waste"></iframe>

<!-- Speaker note: No last-block waste here — but internal fragmentation still happens inside every full block, since the two kinds of waste are independent. -->

---

# Code — capacity, fill, and flush

```c
#define BLOCK_SIZE 100

int block_capacity(int rec_size) {
    return BLOCK_SIZE / rec_size;
}

/* block_put: append a key; flush when full */
/* block_flush: write a PARTIAL last block */
/*   anyway — a whole block, however few keys */
```

<!-- Speaker note: block_flush is only ever called once, after the main loop — it is what pays the last-block waste. -->

---

# Complexity

- Blocking itself changes no algorithm's **asymptotic** cost
- It changes the **constant**: block reads/writes, not record count
- Larger `bf` → fewer, bigger disk accesses → faster in practice
- Up to the point a block becomes too large to buffer in RAM

<!-- Speaker note: Sections 4 and 5's O(numBlocks) and O(log numBlocks) both shrink directly as bf grows, because numBlocks = n / bf. -->

---

# Common mistakes

- Forgetting the **last block** still costs a full block write
- Picking `blockSize` smaller than one record (`bf = 0`)
- Confusing internal fragmentation with last-block waste — they are independent

<!-- Speaker note: These two kinds of waste have different causes and different fixes — conflating them leads to the wrong optimization. -->

---

# Mini-quiz

`recSize = 24`, `blockSize = 100`. What is
`bf`, and how many bytes of internal
fragmentation does **one full block** waste?

<!-- Speaker note: bf = floor(100/24) = 4; the wasted bytes are what is left over after bf*recSize. -->

---

# Answer

**`bf = 4`.** `4 * 24 = 96` bytes used,
**4 bytes** wasted per full block — small here,
but multiplied by every block in a huge file.

<!-- Speaker note: 4 bytes looks trivial for one block — the "hard" scenario in the animation shows it compounding across many blocks. -->

---

<!-- _class: bolum -->

# 4. Sequential Search of a File

<!-- Speaker note: Section 4 is Week 1's linear search, adapted to the fact that records arrive bf at a time, not one at a time. -->

---

# A question to start

A file's records are not sorted. To find one
key, is there any option other than reading
every block until it turns up, or the file ends?

<!-- Speaker note: With no sort order to exploit, the answer this section gives is: no — every block must be checked. -->

---

# The idea: read blocks in order, compare inside

- Read block 0 into the RAM buffer
- Compare **every** record inside it against the target
- Not found? Read block 1 — and so on
- Cost that matters: **block reads**, not comparisons

<!-- Speaker note: Comparing a few extra records already sitting in RAM costs almost nothing next to the disk access that loaded them. -->

---

# Intuition — reading a shelf of unsorted boxes

- Looking for one file in an **unsorted** shelf of boxes
- You must open **every** box, one by one, until you find it
- Or open every box and find nothing — you still opened them all
- A "box" here is one block; opening it is one disk read

<!-- Speaker note: This is Week 1's linear search, retold with disk-sized units — the box, not the paper inside it, is what costs time to open. -->

---

# Sequential search, step by step

<iframe class="dsanim" src="anim/sequential-search-file.html?yer=slayt&lang=en" title="Sequential search of a file"></iframe>

<!-- Speaker note: Normal example: bf=4 — watch the block-read counter, not the comparison counter, as the true cost. -->

---

# Edge case — target absent, whole file scanned

<iframe class="dsanim" src="anim/sequential-search-file.html?yer=slayt&lang=en&example=edge-not-found" title="Sequential search: not found"></iframe>

<!-- Speaker note: An absent target costs exactly the same as finding the very last record — every block must be read either way. -->

---

# Edge case — target is the first record (best case)

<iframe class="dsanim" src="anim/sequential-search-file.html?yer=slayt&lang=en&example=edge-first" title="Sequential search: best case"></iframe>

<!-- Speaker note: One block read, one comparison — the best case, exactly as far from the worst case as this technique's variance ever gets. -->

---

# Code — scan one block, then the next

```c
for (int b = 0; b < nblocks; b++) {
    load_block(f, b, buf, &cnt);
    (*block_reads)++;
    for (int i = 0; i < cnt; i++) {
        (*comparisons)++;
        if (buf[i] == target)
            return b * bf + i;
    }
}
return -1;   /* exhausted every block */
```

<!-- Speaker note: block_reads increments once per block; comparisons increments once per record — only the first is this week's real cost. -->

---

# Complexity

- Worst case: **`ceil(n / bf)`** block reads — every block
- Average case: about **half** that
- The exact file analogue of Week 1's `O(n)` linear search
- Unit counted is **blocks**, not records — `O(n / bf)`

<!-- Speaker note: A larger blocking factor from section 3 directly speeds up sequential search, since numBlocks shrinks as bf grows. -->

---

# Common mistakes

- Counting comparisons instead of **block reads** as the real cost
- Assuming a key is absent before reading **every** remaining block
- Returning the **last** match of a duplicate instead of the first

<!-- Speaker note: Unlike section 5's sorted file, an unsorted sequential file offers no shortcut at all for the not-found case. -->

---

# Mini-quiz

Why is sequential search's worst case exactly
the same whether the target is absent, or is
the very last record in the file?

<!-- Speaker note: Think about what the algorithm can conclude before it has read the final block. -->

---

# Answer

**Both require reading every block.** For the
last record, the match is not found until the
final block; for an absent key, nothing rules
out any block early — every one must be checked.

<!-- Speaker note: This is the same shape of answer section 5 will contrast against a moment from now, once the file is sorted. -->

---

<!-- _class: bolum -->

# 5. Binary Search of a Sorted File

<!-- Speaker note: Section 5 asks what section 4 never used — the fact that the file could be sorted at all. -->

---

# A question to start

If section 4's file is kept **sorted**, can it be
searched the way Week 1's binary search
searches a sorted array — but block by block?

<!-- Speaker note: The answer is yes, with one twist: an entire block is ruled out per comparison, not one element. -->

---

# The idea: binary search over BLOCKS

- Block `b`'s records are a sorted, non-overlapping **range**
- Compare target to a block's **first** and **last** key
- Too small? Discard the right half of the block range
- Too big? Discard the left half — otherwise, it is **in** this block

<!-- Speaker note: Once binary search narrows down to one block, a short linear scan inside it (section 4's idea, bounded to bf) finds it or confirms a gap. -->

---

# What "gap" means

- "In range" does **not** mean "present"
- A target between a block's first and last key might still be **absent**
- The linear scan inside that one block confirms or denies it
- This never happens in section 4 — an unsorted file has no ranges

<!-- Speaker note: This is the edge case worth its own animation run — binary search narrows down WHICH block, not whether the key exists. -->

---

# Intuition — a labeled shelf of sorted boxes

- Now the shelf's boxes are **labeled** with their contents' range
- Check one box's label: your file is before it, inside it, or after
- Skip straight past every box that cannot possibly hold it
- Only open the **one** box whose label range matches

<!-- Speaker note: The label is exactly a block's first/last key — reading it costs one glance, ruling out everything on the wrong side. -->

---

# Binary search of a sorted file, step by step

<iframe class="dsanim" src="anim/binary-search-sorted-file.html?yer=slayt&lang=en" title="Binary search of a sorted file"></iframe>

<!-- Speaker note: Normal example: watch each comparison rule out an entire block's worth of records at once. -->

---

# Edge case — a gap inside a block's range

<iframe class="dsanim" src="anim/binary-search-sorted-file.html?yer=slayt&lang=en&example=edge-gap" title="Binary search: a gap"></iframe>

<!-- Speaker note: The target falls between two real keys in the same block — the short scan inside it correctly reports "not found". -->

---

# Edge case — target below the file's minimum key

<iframe class="dsanim" src="anim/binary-search-sorted-file.html?yer=slayt&lang=en&example=edge-outrange" title="Binary search: out of range"></iframe>

<!-- Speaker note: The very first comparison against block 0's first key already rules out the whole file — no further reads needed. -->

---

# Code — narrow to one block, then scan

```c
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    block_reads++;
    if (target < first_key(mid)) hi = mid-1;
    else if (target > last_key(mid)) lo = mid+1;
    else {
        /* target's range: short scan inside */
        return scan_block(mid, target);
    }
}
```

<!-- Speaker note: Every iteration reads exactly one block, exactly like array binary search examines exactly one element. -->

---

# Complexity

- **`O(log2 numBlocks)`** block reads, plus a scan of ≤ `bf` records
- Compare to section 4's **`O(numBlocks)`**
- 24 keys, 6 blocks: **3** reads here vs. **6** for sequential
- Gap widens dramatically as the file grows

<!-- Speaker note: Exactly like Week 1's binary vs. linear search on an array — same shape of speedup, one level up. -->

---

# Common mistakes

- Forgetting "in range" does not mean "present" (the gap case)
- Comparing against the block's **middle** key instead of first/last
- Applying this to an **unsorted** file — silently wrong, not just slow

<!-- Speaker note: This algorithm must compare against a whole block's range, because a block of several records, not one record, is ruled in or out at each step. -->

---

# Mini-quiz

Array binary search (Week 1) needs `O(log n)`
comparisons. File binary search needs
`O(log numBlocks)` reads. Is one better?

<!-- Speaker note: Recall numBlocks = n / bf — think about whether this is a fundamentally different algorithm or the same one, one level up. -->

---

# Answer

**Neither — same idea, different unit.** Array
search halves *elements*; file search halves
*blocks*, and `numBlocks` is already `bf`
times smaller than `n` to start with.

<!-- Speaker note: File binary search is binary search performed over groups of bf records, because block-oriented I/O forces that grouping. -->

---

<!-- _class: bolum -->

# 6. Sequential Update: Merging Master and Transactions

<!-- Speaker note: Section 6 is the classical algorithm this whole topic is named for — updating a huge file without touching it record by record. -->

---

# A question to start

A bank's account file changes daily. Rewriting
the **entire** file for every change is absurd
at millions of records. What is the alternative?

<!-- Speaker note: The alternative predates modern databases by decades — it comes straight from early batch-processing systems. -->

---

# A short history

- The **sorted master + transaction file** merge is a classical
  batch-processing pattern, older than random-access disks
- Tharp's *File Organization and Processing* treats it as the
  canonical sequential-file update algorithm
- Still used today for huge, periodic batch jobs (billing runs)

<!-- Speaker note: This pattern is one of the oldest ideas in file processing — it long predates the databases most students think of first. -->

---

# The idea: merge two SORTED files, one pass

- **Transaction file**: sorted, same key, each with an **op**
- `'A'` add, `'C'` change, `'D'` delete
- Two "read heads", one per file — exactly Week 10's merge step
- Compare `master.key` to `txn.key` at every step

<!-- Speaker note: This is literally the merge step of merge sort from Week 10, applied to two files instead of two arrays. -->

---

# The three cases

| Compare | Meaning | Action |
| --- | --- | --- |
| `master.key < txn.key` | No transaction for this record | Copy unchanged |
| `master.key > txn.key` | Key not yet in master | `'A'`: insert; else **error** |
| `master.key == txn.key` | Transaction applies here | See next slide |

<!-- Speaker note: Whichever pointer is "behind" advances — this is exactly the same comparison logic as merging two sorted arrays. -->

---

# The equal-key case, in detail

- `'A'` on an existing key: **duplicate-add error**
- The original record is **still copied through** unchanged
- `'C'`: value replaced, updated record written
- `'D'`: record simply **not written** — that is the delete

<!-- Speaker note: A rejected transaction must never delete data nobody asked to delete — this is the single most important rule in this algorithm. -->

---

# Intuition — two people reading two sorted lists

- One person reads the master list aloud, in order
- A second person reads the transaction list aloud, in order
- At every step, they compare their current word out loud
- Whoever is "behind" alphabetically reads their next word

<!-- Speaker note: This two-reader picture is exactly Week 10's merge step, and it is the cleanest way to visualize why the algorithm never backtracks. -->

---

# Sequential update, step by step

<iframe class="dsanim" src="anim/sequential-update-master-transaction.html?yer=slayt&lang=en" title="Sequential update"></iframe>

<!-- Speaker note: Normal example: 10 master records, 6 transactions mixing add/change/delete — watch both pointers advance together. -->

---

# Edge case — duplicate add + missing key

<iframe class="dsanim" src="anim/sequential-update-master-transaction.html?yer=slayt&lang=en&example=edge-duplicate" title="Sequential update: errors"></iframe>

<!-- Speaker note: Two error types in one run: adding a key that exists, and changing/deleting a key that does not. -->

---

# Edge case — master runs out, trailing transactions

<iframe class="dsanim" src="anim/sequential-update-master-transaction.html?yer=slayt&lang=en&example=edge-trailing" title="Sequential update: trailing transactions"></iframe>

<!-- Speaker note: This is exactly the "leftover transactions" loop — some trailing adds succeed, some trailing changes/deletes are rejected. -->

---

# Code — the merge loop's core comparison

```c
while (i < nm && j < nt) {
    if (master[i].key < txn[j].key) {
        write(master[i]); i++;
    } else if (master[i].key > txn[j].key) {
        if (txn[j].op == 'A') write(new);
        else errors++;      /* C/D: missing */
        j++;
    } else { /* equal key: next slide */ }
}
```

<!-- Speaker note: This is exactly the merge-sort comparison structure from Week 10 — the only new part is the equal-key branch. -->

---

# Code — the equal-key branch, and leftovers

```c
else {
    if (txn[j].op == 'A') {
        write(master[i]);   /* KEEP it */
        errors++;
    } else if (txn[j].op == 'C') write(new);
    else deleted++;         /* 'D': skip write */
    i++; j++;
}
/* + two leftover loops when one file ends */
```

<!-- Speaker note: Forgetting the leftover loops after the main merge ends is the single most common bug in this algorithm. -->

---

# Complexity

- **`O(nm + nt)`** — one pass, every record read exactly once
- Compare to searching the master once per transaction: `O(nt * nm)`
- Section 4 or 5's search, applied `nt` times, would cost exactly that
- The merge is dramatically cheaper at any real scale

<!-- Speaker note: This complexity gap is precisely why batch systems merge sorted files instead of searching for each transaction individually. -->

---

# Common mistakes

- **Silently dropping** the master record on a duplicate-add error
- Forgetting the **two leftover loops** after the main merge ends
- Assuming both files are sorted, without checking or guaranteeing it

<!-- Speaker note: A single out-of-order record anywhere silently produces a wrong merge — not a crash, not an error message. -->

---

# Mini-quiz

Why is a delete, in this algorithm, done by
**not writing** a record, rather than writing
a special "deleted" record?

<!-- Speaker note: Think about what the new master file actually contains when the merge finishes. -->

---

# Answer

**The new file is built from scratch, record
by record.** A deleted record should not
exist in it at all — skipping the write *is*
the deletion, with no extra bookkeeping.

<!-- Speaker note: Contrast this with section 10's tombstones, which need an explicit marker precisely because a probed file cannot be rewritten from scratch. -->

---

<!-- _class: bolum -->

# 7. Relative (Direct) File Access

<!-- Speaker note: Section 7 is Week 1's array-indexing idea, moved to disk — no searching at all, just arithmetic. -->

---

# A question to start

A program already knows it wants "record
number 7." Sections 4 and 5 both *search*.
Does finding record 7 need any searching?

<!-- Speaker note: The answer is no — and this is the fastest technique in the entire week, by a wide margin. -->

---

# The idea: compute, do not search

- Every record gets a **relative record number (RRN)**: `0, 1, 2, ...`
- `block = rrn / bf`, `offset = rrn % bf`
- One division, one modulo — **no comparisons at all**
- One `fseek`, one block read — genuine **O(1)**

<!-- Speaker note: This costs exactly the same one block read whether the file holds a hundred records or a hundred million. -->

---

# What must still be validated

- Negative `rrn`, or `rrn >= total`: reject **before** any read
- A valid-looking `rrn` can still land in a **partial last block**
- Must check against the **total record count**, not block bounds alone

<!-- Speaker note: Computing a location instead of searching for it does not mean skipping validation — quite the opposite. -->

---

# Intuition — a numbered parking garage

- Every parking space has a **number**, painted on the floor
- "Space 37" needs no searching — go straight to floor 37/bf
- A parking attendant never walks every floor looking for space 37
- Exactly section 7's `block = rrn / bf`, `offset = rrn % bf`

<!-- Speaker note: A numbered space is the cleanest possible picture of a computed address — nobody would search a garage floor by floor for a known number. -->

---

# Relative file access, step by step

<iframe class="dsanim" src="anim/relative-file-direct-access.html?yer=slayt&lang=en" title="Relative file direct access"></iframe>

<!-- Speaker note: Normal example: bf=5, 13 records — watch every request cost exactly one block read, valid or invalid. -->

---

# Edge case — negative and out-of-range requests

<iframe class="dsanim" src="anim/relative-file-direct-access.html?yer=slayt&lang=en&example=edge-invalid" title="Relative file access: invalid rrn"></iframe>

<!-- Speaker note: A negative rrn is rejected cleanly here — an unchecked one would compute a negative block and a corrupt fseek. -->

---

# Edge case — the single record in a partial last block

<iframe class="dsanim" src="anim/relative-file-direct-access.html?yer=slayt&lang=en&example=edge-last-partial" title="Relative file access: partial last block"></iframe>

<!-- Speaker note: One valid rrn lands correctly in a block that is otherwise mostly empty; the very next rrn must still be rejected as out of range. -->

---

# Code — the entire algorithm, in two lines

```c
int direct_read(FILE *f, int bf,
                 int total, int rrn) {
    if (rrn < 0 || rrn >= total)
        return -1;             /* reject */
    int block = rrn / bf;
    int offset = rrn % bf;
    /* one fseek, one fread, done */
}
```

<!-- Speaker note: No loop, no comparison against stored data at all — this is genuinely the simplest algorithm of the entire week. -->

---

# Complexity

- **O(1)** — exactly one block read, for every valid request
- Sections 4 and 5's costs both still **grow** as the file grows
- Direct access does **not** grow at all, ever
- The upper bound this whole chapter of techniques aims toward

<!-- Speaker note: This is the theoretical ceiling every other technique this week is trying to approximate with a computed or hashed location. -->

---

# Common mistakes

- Checking `rrn >= total` but forgetting `rrn < 0`
- Not accounting for a **partial last block**
- Assuming "direct" means "no validation needed" — it still does

<!-- Speaker note: An unvalidated rrn computed into an out-of-bounds fseek is exactly the kind of bug that corrupts a file, not just fails cleanly. -->

---

# Mini-quiz

Why does relative access's O(1) cost not
depend on `bf` at all, while sections 4 and
5's search costs both do?

<!-- Speaker note: Think about how many blocks each technique must visit to find an answer, versus how many it must compute. -->

---

# Answer

**Direct access always does exactly one seek
and one read**, regardless of `bf` — only
*which* block changes. Searching must visit
blocks one at a time until it finds the answer.

<!-- Speaker note: numBlocks = n / bf appears explicitly in both search techniques' complexity — never in direct access's. -->

---

<!-- _class: bolum -->

# 8. Hashing to Buckets

<!-- Speaker note: Section 8 takes Week 6's hash table and moves it to disk, where "one slot" becomes "one block", not one cell. -->

---

# A question to start

Real keys are rarely a convenient `0, 1, 2, ...`.
Week 6 solved this in RAM with a hash
function. Can the same idea work for a file?

<!-- Speaker note: Yes — and the key change is that one hash "slot" here is an entire block, which can already hold bf keys. -->

---

# The idea: hash to a BUCKET, chain overflow

- `h(key) = key mod m` picks one of `m` **buckets**
- A bucket is a **block**, holding up to `bf` keys, not one
- Two keys, same bucket: fine, **until** the bucket is full
- Only then: allocate an **overflow block**, chain it on

<!-- Speaker note: This is exactly Week 6's separate chaining, except the "linked list nodes" are now whole disk blocks, not individual records. -->

---

# Intuition — a row of mailboxes, each holding several letters

- Each mailbox (bucket) already holds up to `bf` letters (keys)
- Two letters for the same box: fine, until the box is full
- A full mailbox gets an **extra tray** clipped on beside it
- The extra tray is exactly one overflow block, chained on

<!-- Speaker note: A mailbox that can already hold bf letters is the key difference from Week 6's RAM table, where every "mailbox" held exactly one letter. -->

---

# Hashing to buckets, step by step

<iframe class="dsanim" src="anim/hashing-to-buckets.html?yer=slayt&lang=en" title="Hashing to buckets"></iframe>

<!-- Speaker note: Watch how many keys accumulate in one bucket before an overflow block is finally allocated. -->

---

# Edge case — m=1, everything chains

<iframe class="dsanim" src="anim/hashing-to-buckets.html?yer=slayt&lang=en&example=edge-one-bucket" title="Hashing to buckets: m=1"></iframe>

<!-- Speaker note: With only one bucket, every key beyond the first bf collides — a long overflow chain, the worst case made maximal. -->

---

# Edge case — all 10 keys hash to the same bucket

<iframe class="dsanim" src="anim/hashing-to-buckets.html?yer=slayt&lang=en&example=edge-all-same" title="Hashing to buckets: all same bucket"></iframe>

<!-- Speaker note: With m greater than 1 but every key still colliding, this isolates a bad hash outcome from a badly chosen m. -->

---

# Code — hash, then chain on overflow

```c
int h = key % m, cur = h;
while (bucket[cur].count == bf) {
    if (bucket[cur].next < 0)
        bucket[cur].next = new_block();
    cur = bucket[cur].next;    /* follow chain */
}
bucket[cur].keys[bucket[cur].count++] = key;
```

<!-- Speaker note: A new overflow block must chain onto the LAST block in the chain, never back onto the home bucket directly. -->

---

# Complexity

- Average case: **O(1)** block accesses, same as Week 6's chaining
- Plus one more access per overflow block that must be followed
- Stays small while the **load factor** `n / (m * bf)` is reasonable
- Worst case ("m=1" above): degrades toward `O(n / bf)`

<!-- Speaker note: This is exactly Week 6's chaining degradation, now measured in block accesses instead of comparisons. -->

---

# Common mistakes

- Chaining a new overflow block onto the **wrong** block
- Choosing `m` too small for the expected key count
- Forgetting a bucket's capacity is `bf`, not 1 — unlike Week 6

<!-- Speaker note: A collision here means "the bf-th key competing for one already-full block" — materially rarer than Week 6's one-key-per-slot. -->

---

# Mini-quiz

Is bucket chaining here closer to Week 6's
separate chaining, or Week 6's open
addressing? Why?

<!-- Speaker note: Think about whether a colliding key stays inside the same table structure, or grows something separate. -->

---

# Answer

**Separate chaining.** A full bucket grows a
chain of **additional blocks**, off to the side
— never touching any other bucket, exactly
like Week 6's per-slot linked list.

<!-- Speaker note: Section 9's progressive overflow is the other family — claiming a different slot inside the same table, like Week 6's open addressing. -->

---

<!-- _class: bolum -->

# 9. Progressive Overflow: Linear Probing on Disk

<!-- Speaker note: Section 9 is Week 6's open addressing, moved to disk — no separate structure at all, just keep probing. -->

---

# A question to start

Section 8's overflow blocks cost a whole extra
block per overflow, however few keys it holds.
Can probing avoid that extra block entirely?

<!-- Speaker note: Week 6's open addressing solved exactly this waste in RAM by keeping every key inside the original table. -->

---

# The idea: probe the next slot, wrap around

- Home slot: `h(key) = key mod m`
- Occupied by a different key? Try `(h+1) mod m`, then next
- `mod m` makes the sequence **wrap around** past the last slot
- Stop: empty slot (insert), duplicate, or all `m` slots tried (full)

<!-- Speaker note: Every slot probed, empty or not, costs one real disk access — this is why the technique's cost is measured in probes. -->

---

# Intuition — parking in the nearest free spot

- Your assigned spot is taken? Take the **next** spot over
- Still taken? The next one — wrapping to spot 0 at the end
- No separate overflow lot at all — everyone parks in the same lot
- Exactly Week 6's open addressing, one level down, on disk

<!-- Speaker note: Unlike section 8's mailbox trays, there is no separate structure here at all — every key genuinely lives inside the one table. -->

---

# Progressive overflow, step by step

<iframe class="dsanim" src="anim/collision-progressive-overflow.html?yer=slayt&lang=en" title="Progressive overflow"></iframe>

<!-- Speaker note: Watch the probe sequence wrap around from the last slot back to slot 0 when a home slot is near the end. -->

---

# Edge case — every key shares one home slot

<iframe class="dsanim" src="anim/collision-progressive-overflow.html?yer=slayt&lang=en&example=edge-same-home" title="Progressive overflow: same home"></iframe>

<!-- Speaker note: Probe counts grow 1, 2, 3, ... in lock-step with insertion order — the textbook signature of primary clustering. -->

---

# Edge case — the table is completely full

<iframe class="dsanim" src="anim/collision-progressive-overflow.html?yer=slayt&lang=en&example=edge-full" title="Progressive overflow: table full"></iframe>

<!-- Speaker note: The last insert tries every one of the m slots and finds none free — a clean "file full" report, never an infinite loop. -->

---

# Code — probe until room, duplicate, or full

```c
int h = key % m, i = h, tries = 0;
while (tries < m) {
    if (table[i] == EMPTY) {
        table[i] = key; return i;
    }
    if (table[i] == key) return -2; /* dup */
    i = (i + 1) % m; tries++;
}
return -1;   /* file genuinely full */
```

<!-- Speaker note: Without the `tries < m` guard, a full table with no matching key would loop forever — this bound is not optional. -->

---

# Complexity

- Close to **O(1)** probes at a **low** load factor `n / m`
- Degrades sharply as load factor rises
- "Hard" scenario (91% loaded): up to **5** probes for one insert
- Worst case, nearly full: **O(m)** probes

<!-- Speaker note: This is exactly Week 6's open-addressing degradation, now paid for in real disk accesses instead of RAM comparisons. -->

---

# Common mistakes

- Not bounding the probe loop (`tries < m`): risks an infinite loop
- Treating "file full" as a crash instead of a normal outcome
- Forgetting `key % m` needs a guard for negative keys

<!-- Speaker note: A well-designed program must detect and report a full file gracefully, exactly as the sample program above does. -->

---

# Mini-quiz

What is "primary clustering", and why does
the "same home slot" edge case demonstrate
it at its most extreme?

<!-- Speaker note: Recall the Week 6 term — think about why an occupied run of slots keeps growing once it starts. -->

---

# Answer

**A growing occupied run that keeps attracting
more collisions.** Here, every key shares one
home slot, so probe counts grow `1, 2, 3, ...`
in lock-step — clustering at its most extreme.

<!-- Speaker note: Any new key whose probe sequence reaches an existing run is forced to extend it by one more slot, making the next collision more likely too. -->

---

<!-- _class: bolum -->

# 10. Deletion with Tombstones

<!-- Speaker note: Section 10 asks what happens to section 9's probing when a key in the MIDDLE of a probe chain is deleted. -->

---

# A question to start

If a deleted slot is simply cleared to `EMPTY`,
what happens to a later search for a *different*
key whose probe chain passed through it?

<!-- Speaker note: EMPTY is exactly the signal a search uses to give up — clearing a mid-chain slot breaks every key that comes after it. -->

---

# The idea: a tombstone means "keep looking"

- **Tombstone**: distinct from both `EMPTY` and any real key
- A search **skips over** a tombstone, exactly like any occupied slot
- Only a genuine `EMPTY` slot is allowed to **end** a search
- An **insert**, though, is free to treat a tombstone as reusable

<!-- Speaker note: Search and insert ask genuinely different questions here, which is exactly why they treat a tombstone differently. -->

---

# Intuition — a "gone, but do not stop here" sign

- A parking spot's occupant left: put up a **temporary sign**
- The sign is not "empty" (keep circling) or "occupied" (keep out)
- It means: someone parked here once, your car might be further on
- A new car may still park here; the sign then comes down

<!-- Speaker note: The sign is the tombstone, in one image — it changes what a passing search does, without changing what a passing insert may do. -->

---

# Deletion with tombstones, step by step

<iframe class="dsanim" src="anim/deletion-with-tombstones.html?yer=slayt&lang=en" title="Deletion with tombstones"></iframe>

<!-- Speaker note: Watch a delete turn a slot into TOMB, then a later find() correctly skip past it to reach a key further along the chain. -->

---

# Edge case — a fully-tombstoned table

<iframe class="dsanim" src="anim/deletion-with-tombstones.html?yer=slayt&lang=en&example=edge-all-tombstones" title="Deletion with tombstones: no empty slot"></iframe>

<!-- Speaker note: No true-empty slot remains at all — only the tries < m bound from section 9 stops find() from probing forever. -->

---

# Edge case — delete a key, then reinsert the same key

<iframe class="dsanim" src="anim/deletion-with-tombstones.html?yer=slayt&lang=en&example=edge-reinsert-same" title="Deletion with tombstones: reinsert"></iframe>

<!-- Speaker note: The reinserted key lands back at its own home slot, reusing its own tombstone — a satisfying, and correct, round trip. -->

---

# Code — find must skip tombstones, not stop

```c
int i = key % m, tries = 0;
while (tries < m) {
    if (table[i] == EMPTY) return -1;
    if (table[i] == key) return i;
    /* TOMB: fall through, keep probing */
    i = (i + 1) % m; tries++;
}
return -1;
```

<!-- Speaker note: TOMB is neither "found" nor "safe to stop at" — it must be skipped exactly like any other occupied-but-different slot. -->

---

# Code — insert may reuse a tombstone

```c
int i = key % m, tries = 0;
while (tries < m) {
    if (table[i] == EMPTY ||
        table[i] == TOMB) {
        table[i] = key; return i; /* reused! */
    }
    if (table[i] == key) return -2;
    i = (i + 1) % m; tries++;
}
```

<!-- Speaker note: Reusing a tombstone reclaims deleted space without ever breaking any other key's probe chain. -->

---

# Complexity

- `ts_find`/`ts_delete`: same **O(probe chain length)** as section 9
- Tombstones add **no new asymptotic cost**
- `ts_insert`: often **less** in practice — may reuse a tombstone early
- Only *which* slots a search is willing to pass through changes

<!-- Speaker note: A search was always going to walk past occupied slots anyway — tombstones just widen what counts as "occupied but passable". -->

---

# Common mistakes

- Deleting by simply clearing the slot to `EMPTY`
- Making `ts_find` stop at, or match, a tombstone
- Forgetting a fully-tombstoned table has **no** `EMPTY` to rely on

<!-- Speaker note: The last case is exactly why the tries < m bound from section 9 is load-bearing, not a defensive nicety. -->

---

# Mini-quiz

After `ts_insert` reuses a tombstone for a new
key, why does a search for some other key
that also probes past that slot still work?

<!-- Speaker note: Think about what the slot looks like to a search, once it holds a real key again. -->

---

# Answer

**Once reused, the slot holds a real key
again** — indistinguishable from any other
occupied slot. Other keys' searches behave
exactly as if the deletion never happened.

<!-- Speaker note: From any other key's point of view, an occupied slot is an occupied slot, whether original or reclaimed. -->

---

<!-- _class: bolum -->

# 11–12. Comparing and Choosing

<!-- Speaker note: We now step back from individual algorithms to compare all five organisations side by side, and when to pick each. -->

---

# Comparison table

| Organisation | Locate | Insert / Delete | Best for |
| --- | --- | --- | --- |
| Sequential (unsorted) | O(numBlocks) | O(1) / O(numBlocks) | Process every record anyway |
| Sequential (sorted) | O(log numBlocks) | O(numBlocks) both | Batch updates (section 6) |
| Relative (direct) | O(1) | O(1) / O(1), leaves a hole | RRN is naturally known |
| Hashing (buckets or probing) | O(1) avg | O(1) avg | Arbitrary keys, fast lookup |

<!-- Speaker note: The one column every row shares is the unit being counted — block reads and writes, from section 1, never comparisons. -->

---

# Choosing a technique (1/2)

| Situation | Best choice |
| --- | --- |
| Process every record anyway | Sequential, any order |
| Batch of changes, periodically | Sequential (sorted) + transactions |
| Occasional lookups, rarely changes | Sequential (sorted), binary search |
| Records numbered 0, 1, 2, ... | Relative (direct) file |

<!-- Speaker note: No technique beats reading every block once when every record must be visited anyway — sorting buys nothing there. -->

---

# Choosing a technique (2/2)

| Situation | Best choice |
| --- | --- |
| Arbitrary key, simplicity over compactness | Hashing, bucket chaining |
| Arbitrary key, compactness, rare deletes | Hashing, progressive overflow |
| Arbitrary key, frequent deletes | Progressive overflow + tombstones |

<!-- Speaker note: The single biggest decision, as in Week 6, is: does this file need efficient exact-match lookup, or will it always be processed whole? -->

---

<!-- _class: bolum -->

# Wrap-Up

<!-- Speaker note: One question drove every section this week: how many block reads and writes does each technique need? -->

---

# Summary

- **Records/fields**: fixed, delimited, or length-prefixed
- **Blocking factor**: `bf` records share one disk access
- **Sequential**: search every block, or binary-search a sorted one
- **Sequential update**: merge master + transactions in one pass
- **Relative access**: `block = rrn/bf` — true O(1)
- **Hashing**: chain overflow blocks, or probe with tombstones

<!-- Speaker note: Every idea from Weeks 1, 6, and 10 reappears here, unchanged in logic, now paid for in block reads instead of RAM operations. -->

---

# 1. Why does this week count block reads, not comparisons?

<!-- Speaker note: Recall section 1 — a block read costs orders of magnitude more than any in-memory operation on its contents. -->

---

# A disk access costs vastly more than any RAM operation, and always transfers a WHOLE block — so block count, not comparison count, predicts real speed.

<!-- Speaker note: This is the organizing idea of the entire week, stated once more as a review question. -->

---

# 2. Why must a sorted file's binary search compare against a block's first/last key, not its middle key?

<!-- Speaker note: Recall section 5 — an entire block, not one record, is ruled in or out at each step. -->

---

# A whole BLOCK of records is being ruled in or out per comparison, and only the first/last key defines that block's range.

<!-- Speaker note: This is exactly the difference between array binary search (Week 1) and file binary search (section 5). -->

---

# 3. Why must a duplicate-add error still copy the original master record forward?

<!-- Speaker note: Recall section 6 — an unrelated rejected transaction must never delete valid data as a side effect. -->

---

# The master record did nothing wrong — only the transaction is rejected; not copying it forward would silently lose valid data.

<!-- Speaker note: This was a real bug found and fixed in this week's own reference programs while building them — a genuine, not hypothetical, mistake. -->

---

# 4. Why can insert safely reuse a tombstone, when search must not stop at one?

<!-- Speaker note: Recall section 10 — insert and search are answering fundamentally different questions. -->

---

# Search must preserve every OTHER key's ability to be found; reuse by insert does not interfere, because the slot then just holds a new, real key.

<!-- Speaker note: This is the single most commonly mis-implemented detail of open addressing with deletion, in any language. -->

---

# 5. Why does a relative file's O(1) cost not depend on the file's total size at all?

<!-- Speaker note: Recall section 7 — the arithmetic is the same one division and one modulo, no matter how many records exist. -->

---

# One fseek, computed from rrn and bf alone, then one block read — nothing about that computation depends on how many OTHER records the file holds.

<!-- Speaker note: Contrast this with every searching technique this week, whose cost is expressed directly in terms of numBlocks = n / bf. -->

---

# 6. Why is chaining overflow blocks (section 8) a closer match to separate chaining than to open addressing?

<!-- Speaker note: Recall Week 6 — think about whether a collision grows a side structure, or claims a slot inside the same table. -->

---

# A full bucket grows a chain of ADDITIONAL blocks off to the side, never touching any other bucket — exactly Week 6's separate chaining, one level down.

<!-- Speaker note: Section 9's progressive overflow is the other Week 6 family instead — claiming a different slot inside the very same table. -->

---

<!-- _class: baslik -->

# Next week

**Week 14 — File Organisation II**

Indexed sequential files · B-trees · extendible
hashing · external sorting — extending this
week's block-read cost model to bigger tools.

<!-- Speaker note: Week 14 answers exactly the question sections 8-10 left open: what happens when a hashed file outgrows its m? -->

---

# References (1/2)

- Course syllabus, Week 13: `docs/syllabus/syllabus.en.md`
- A. L. Tharp. *File Organization and Processing*.
  John Wiley & Sons, 1988 — the primary textbook
- Cormen, Leiserson, Rivest, Stein. *Introduction
  to Algorithms*. MIT Press — hash table chapter

<!-- Speaker note: These are the same references listed at the end of the week's written notes. -->

---

# References (2/2)

- Knuth. *The Art of Computer Programming, Vol. 3:
  Sorting and Searching*, 2nd ed — file processing,
  hashing, and linear probing's historical analysis
- williamfiset/Algorithms · Programiz DSA

<!-- Speaker note: Knuth's analysis of linear probing is the historical root of this week's "progressive overflow" terminology. -->
