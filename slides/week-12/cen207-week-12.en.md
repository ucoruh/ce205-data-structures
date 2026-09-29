---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Week 12 — Strings: Structures and Algorithms"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Week 12"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Strings: Structures and Algorithms

**CEN207 Data Structures — Week 12**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!--
Speaker note: Every editor, compiler, and search engine you have ever used leans on the ideas in today's lecture — how a string sits in memory, and how to find one string inside another, fast.
-->

---

# Today's plan (3 hours)

| Hour | Topic |
| --- | --- |
| 1 | C strings, buffers, tries, compressed tries, suffix arrays |
| 2 | Naive search, KMP (failure fn + search), Rabin-Karp |
| 3 | Boyer-Moore, Z-algorithm, dynamic programming: edit distance, LCS |

**Learning outcomes:** LO.1 (explain data structures) · LO.2 (analyze complexity) · LO.6 (dynamic programming) · LO.7 (choose the right structure)

<!-- Speaker note: Thirteen short animations carry the whole lecture; each idea gets a normal run and an edge/hard run right where it is introduced. -->

---

# This week's concepts — where

| Concept | Where |
| --- | --- |
| C strings, buffers, tries, radix trees, suffix arrays | Sections 1–5 |
| Naive, KMP, Rabin-Karp, Boyer-Moore, Z-algorithm | Sections 6–11 |
| Dynamic programming: edit distance, LCS | Sections 13–14 |

<!-- Speaker note: Every term gets a full definition the first time it appears; this table just says where to find it again. -->

---

# How the code examples work

- Every idea has a complete **C** and **Java** program
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Sources: `code/week-12/c/` and `code/week-12/java/`
- Each program's expected output is in the week notes

<!-- Speaker note: Open a terminal now if you want to run these live; every snippet on today's slides compiles and runs exactly as shown. -->

---

# Recap — arrays and the char array (Week 1)

- **Array:** contiguous memory, O(1) access by index
- A C string is nothing but a `char` array
- Week 1's index arithmetic (`base + i`) still applies
- Today adds one convention on top: `'\0'` marks the end

<!-- Speaker note: Nothing about a C string's memory layout is new — only the "where does it end" convention is. -->

---

# Recap — trees and hashing (Weeks 4 and 6)

- **Trees:** recursive nodes with children (Week 4)
- A trie node is a tree node with one child per letter
- **Hashing:** a function computes a location, O(1) (Week 6)
- Rabin-Karp reuses hashing — but *rolls* it forward

<!-- Speaker note: A trie is "Week 4's tree, but the branching factor is the alphabet size." Rabin-Karp is "Week 6's hash, made incremental." -->

---

# A brand-new idea: dynamic programming

- No prior week broke a problem into **overlapping** sub-problems
- Solve each sub-problem **once**, store it in a table
- Sections 13–14 introduce this from first principles
- Two classic examples: edit distance and LCS

<!-- Speaker note: This is genuinely new machinery — worth flagging up front so today doesn't feel like "just more search algorithms." -->

---

# Map of the week — at a glance

| Structures | Search | Dynamic programming |
| --- | --- | --- |
| C strings, buffers | Naive, KMP, Rabin-Karp | Edit distance |
| Tries, radix trees | Boyer-Moore, Z-algorithm | LCS |
| Suffix arrays | | |

<!-- Speaker note: Every box on this map gets its own slides below, most with a short animation and a complete C/Java program. -->

---

<!-- _class: bolum -->

# 1. C Strings: Memory, `'\0'`, and `strlen`

<!-- Speaker note: Section 1 sets up the one convention every later section assumes: a C string is a char array plus a NUL terminator, nothing more. -->

---

# A question to start

Every structure so far stored its size
somewhere. A C string does not. So how
does any function know where it ends?

<!-- Speaker note: The answer — a single reserved byte — has shaped C programming (and C bugs) for over fifty years. -->

---

# A short history

- C designed at Bell Labs, early 1970s (Dennis Ritchie)
- No length field: just a `char` array + a convention
- `'\0'` (NUL, value 0) marks "the string ends here"
- This single choice enables the buffer overflow

<!-- Speaker note: Contrast with Pascal-style strings, which do store a length byte — a design choice with real consequences. -->

---

# Intuition — a row of mailboxes

- Each mailbox (byte) holds one letter
- No sign says "this is the last occupied box"
- Instead: the first **empty** mailbox marks the end
- Walking past it means walking into someone else's mail

<!-- Speaker note: "Someone else's mail" is a friendly way to say undefined behavior — corrupting memory you do not own. -->

---

# The idea: array + convention

- A C string = a `char` array, nothing more
- `'\0'` (NUL) is the end-of-string marker
- Every operation walks byte by byte to find it
- No shortcut exists — the length is never cached

<!-- Speaker note: "No shortcut exists" is the single fact that explains every complexity result in this section. -->

---

# The buffer overflow bug

- `strcpy`-style copying writes until it copies `'\0'` too
- If the destination is smaller than the source: trouble
- Writing past the last valid index is **undefined behavior**
- Today: we always **guard** every write with a bound check

<!-- Speaker note: We show the danger by FLAGGING it and stopping — never by actually executing an out-of-bounds write. -->

---

# C string memory, step by step

<iframe class="dsanim" src="anim/c-string-memory.html?yer=slayt&lang=en" title="C string memory"></iframe>

<!-- Speaker note: Normal example: cap=16, "HELLOWORLD" fits comfortably — watch the copy loop, the terminator, then strlen's second walk. -->

---

# Edge case — overflow, flagged, never executed

<iframe class="dsanim" src="anim/c-string-memory.html?yer=slayt&lang=en&example=overflow" title="C string memory: overflow"></iframe>

<!-- Speaker note: cap=8, a 10-letter source — watch the guard `if (i == cap) break;` stop the copy one write before it would go out of bounds. -->

---

# Code — the guarded copy loop

```c
int i = 0;
while (src[i] != '\0') {
    if (i == cap) break;
    buf[i] = src[i];
    i++;
}
int overflow = (src[i] != '\0');
if (!overflow) buf[i] = '\0';
```

<!-- Speaker note: The guard line is the ONE addition that turns a dangerous naive strcpy loop into a safe, teachable one. -->

---

# Code — strlen walks it a second time

```c
size_t len = 0;
if (!overflow)
    while (buf[len] != '\0') len++;
```

- No length is ever cached anywhere
- Calling `strlen` in a loop condition: O(n) becomes O(n^2)

<!-- Speaker note: This one-line trap (strlen inside a loop condition) is one of the most common accidental-quadratic bugs in C. -->

---

# Complexity

- Copying a length-`L` string: `O(L)`
- `strlen`: `O(L)` — **every single call**, recomputed from scratch
- No caching, no shortcut, ever
- A cached length would break the moment the string changes

<!-- Speaker note: Emphasize "every single call" — this is the fact students most often forget in later courses. -->

---

# Common mistakes

- Forgetting the `+1` for the terminator when sizing a buffer
- Calling `strlen` inside a loop's condition
- Comparing strings with `==` instead of `strcmp`

<!-- Speaker note: `==` compares pointers in C, not characters — two identical-looking strings at different addresses compare unequal. -->

---

# Mini-quiz

A 10-character word needs a buffer of
what size? Why is `char buf[10]` one
byte too small?

<!-- Speaker note: Let a few hands go up before revealing the answer — this is a very common off-by-one in real code. -->

---

# Answer

**11 bytes.** Ten characters plus one
byte for `'\0'` — forgetting the
terminator is this section's classic bug.

<!-- Speaker note: Tie this back to the overflow animation: exactly this omission is what "cap=8, 10 letters" demonstrates. -->

---

<!-- _class: bolum -->

# 2. A Growable String Buffer

<!-- Speaker note: Section 2 answers "what if we don't know the final length in advance?" — the same question Week 1's dynamic array answered for numbers. -->

---

# A question to start

Section 1's buffer had a fixed capacity,
chosen before one character was written.
What if it could grow itself instead?

<!-- Speaker note: This is exactly what java.lang.StringBuilder, C++'s std::string, and Week 1's dynamic array all do internally. -->

---

# Intuition — outgrowing a drawer

- A drawer holds a fixed number of files
- Full drawer: buy a **bigger** one, move every file across
- Buying "one size bigger" every time: constant moving
- Buying **double** the size: moving becomes rare

<!-- Speaker note: The "double, not +1" choice is the whole content of this section's complexity argument. -->

---

# The idea: double when full

- Track `len` (used), `cap` (allocated), and storage
- `len == cap`: allocate a block **double** the size
- Copy every existing character across, then write the new one
- Doubling makes growth **exponentially rarer** as `n` grows

<!-- Speaker note: "Exponentially rarer" is the intuitive version of the amortized-analysis argument on the complexity slide. -->

---

# Growable buffer, step by step

<iframe class="dsanim" src="anim/string-builder.html?yer=slayt&lang=en" title="String builder"></iframe>

<!-- Speaker note: Normal example: initCap=4, "HELLOWORLD" — watch the buffer fill, hit capacity, and grow, with old characters visibly copied. -->

---

# Edge case — smallest possible start

<iframe class="dsanim" src="anim/string-builder.html?yer=slayt&lang=en&example=min-cap" title="String builder: initCap=1"></iframe>

<!-- Speaker note: initCap=1 forces the most growths for 10 letters — a good stress test of the doubling rule. -->

---

# Code — grow, then write

```c
void append(char c) {
    if (len == cap) {
        cap = cap * 2;
        buf = realloc(buf, cap);
    }
    buf[len] = c;
    len++;
}
```

<!-- Speaker note: In C, realloc may MOVE the block — every old pointer into buf becomes invalid the instant this line runs. -->

---

# Complexity

- One append: `O(1)` usually, `O(len)` on a growth
- `n` appends total: `O(n)` — **amortized O(1)** per append
- Growth copying forms a geometric series, bounded by `n`
- Same guarantee as Week 1's dynamic array

<!-- Speaker note: "Amortized" means: not every single operation is cheap, but the AVERAGE over a long sequence is. -->

---

# Common mistakes

- Growing by a fixed amount instead of doubling: `O(n^2)` total
- Forgetting to update the pointer after `realloc` (C)
- Allocating `len` bytes when a C string also needs `+1`

<!-- Speaker note: A fixed growth amount is a classic "looks fine on small inputs, falls over at scale" bug. -->

---

# Mini-quiz

Why does doubling give amortized O(1),
but growing by a fixed amount of 10
gives O(n) per append on average?

<!-- Speaker note: Ask students to think in terms of "how many growths happen, and how much does each one cost." -->

---

# Answer

**Doubling: `n/k` shrinks to `log n`
growths.** A fixed `+10`: `n/10`
growths, each copying up to `n` bytes.

<!-- Speaker note: log(n) growths costing up to n each (decreasing) sums to O(n); n/10 growths costing up to n each sums to O(n^2). -->

---

<!-- _class: bolum -->

# 3. Tries: One Edge Per Character

<!-- Speaker note: Section 3 introduces the trie — the structure behind every autocomplete box and spell checker you have ever used. -->

---

# A question to start

A hash table answers "is X a word?" in
O(1). It cannot answer "what words
start with X?" at all. What can?

<!-- Speaker note: Hashing deliberately scatters similar keys — that is exactly why it cannot answer a "starts with" question. -->

---

# A short history

- Edward Fredkin, "Trie Memory," 1960
- Name comes from "re**trie**val"
- Usually pronounced "try" to avoid confusion with "tree"
- Still the standard structure behind autocomplete today

<!-- Speaker note: Sixty-five years old and still the first idea any interviewer expects for "design an autocomplete feature." -->

---

# Intuition — a signpost tree

- Each fork in the path is labeled with one letter
- Follow a word's letters, one fork at a time
- Shared prefixes share the same early forks
- A small flag marks "a complete word ends here"

<!-- Speaker note: The flag matters — a fork can be mid-path for one word AND the end of a shorter word at the same time. -->

---

# The idea: shared prefixes share nodes

- `insert("CAT")`, then `insert("CAR")`: share `C`→`A`
- `insert("CARD")`: shares `C`→`A`→`R` with `"CAR"`
- `insert("DOG")`: shares nothing, new branch from root
- A node can be **both** "end of CAR" and "path to CARD"

<!-- Speaker note: This dual role — end-of-word AND has-children — is the single most common source of trie bugs. -->

---

# Trie operations

| Operation | Cost |
| --- | --- |
| `insert(word)` | `O(L)`, L = word length |
| `search(word)` | `O(L)` |
| prefix check | `O(L)` |

**Independent of how many other words are stored!**

<!-- Speaker note: A 10-word trie and a 10-million-word trie answer search("CAT") in exactly the same number of steps. -->

---

# Trie insert and search, step by step

<iframe class="dsanim" src="anim/trie-insert-search.html?yer=slayt&lang=en" title="Trie insert and search"></iframe>

<!-- Speaker note: Normal example: CAT, CAR, CARD, DOG — watch shared edges get reused, and the "end" flag appear at word boundaries. -->

---

# Edge case — a branchless chain

<iframe class="dsanim" src="anim/trie-insert-search.html?yer=slayt&lang=en&example=chain" title="Trie: a branchless chain"></iframe>

<!-- Speaker note: A, AB, ABC, ABCD — no branching at all, a plain linked-list-like chain. This is exactly what section 4 compresses. -->

---

# Code — insert

```c
void insert(TrieNode *root, const char *word) {
    TrieNode *cur = root;
    for (int i = 0; word[i]; i++) {
        int c = word[i] - 'A';
        if (cur->child[c] == NULL)
            cur->child[c] = new_node();
        cur = cur->child[c];
    }
    cur->isEnd = true;
}
```

<!-- Speaker note: C uses a fixed 26-slot array per node; the Java version (in the notes) uses a HashMap instead — a real trade-off. -->

---

# Code — search

```c
bool search(TrieNode *root, const char *word) {
    TrieNode *cur = root;
    for (int i = 0; word[i]; i++) {
        int c = word[i] - 'A';
        if (cur->child[c] == NULL) return false;
        cur = cur->child[c];
    }
    return cur->isEnd;
}
```

<!-- Speaker note: Reaching the end of the loop only proves "this is a prefix" — the return value also checks isEnd. -->

---

# Complexity

- Every operation: `O(L)`, `L` = word's length
- Independent of `n`, the trie's total word count
- Beats a sorted array or balanced tree: `O(L log n)`
- Price: memory — many mostly-empty child arrays

<!-- Speaker note: That memory price is exactly what section 4's compressed trie fixes. -->

---

# Common mistakes

- Confusing "found" with "is a prefix"
- Forgetting a node can be `isEnd` AND have children
- Never freeing the trie in C (a recursive leak, one node at a time)

<!-- Speaker note: search("CAR") and search("CARP") walk the same three edges in a trie holding "CARPET" — only one of them is a stored word. -->

---

# Mini-quiz

A trie holds "DOG". You call
`search("DO")`. Does it return true
or false — and why?

<!-- Speaker note: Give students 30 seconds; many will initially say true because the path exists. -->

---

# Answer

**False.** The path `D`→`O` exists, so
`"DO"` is a valid **prefix** — but the
`O` node is not marked `isEnd`.

<!-- Speaker note: This is precisely the found-vs-prefix distinction the "Common mistakes" slide just warned about. -->

---

<!-- _class: bolum -->

# 4. Compressed Tries (Radix Trees)

<!-- Speaker note: Section 4 fixes the memory waste a plain trie has on long, non-branching words. -->

---

# A question to start

Inserting "INTERNATIONAL" (13 letters)
into a plain trie makes 13 new nodes,
each with one child. Can we do better?

<!-- Speaker note: Thirteen nodes for something that could, in principle, be one string with no branching at all. -->

---

# A short history

- Donald R. Morrison, "PATRICIA," 1968
- Name: an acronym for a practical retrieval algorithm
- Also called a **radix tree** in general use
- Same idea underlies real-world IP routing tables

<!-- Speaker note: PATRICIA tries are still used today in networking — longest-prefix-match IP routing is a direct application. -->

---

# The idea: extend, create, or split

- Word matches an edge label completely: **descend**
- No edge starts with the next letter: **new leaf edge**
- Word shares only part of an edge label: **split it**
- A split creates a new branching node at the mismatch

<!-- Speaker note: Case 3 — the split — is the one genuinely new idea; the other two cases are exactly a plain trie's logic. -->

---

# Splitting an edge

- `"TEST"` alone: one leaf edge, labeled `"TEST"`
- Insert `"TEA"`: shares only `"TE"` before diverging
- The `"TEST"` edge splits at `"TE"`
- Two children now: `"ST"` (old) and `"A"` (new)

<!-- Speaker note: Walk this on the board before playing the animation — it is the one step students need to see by hand first. -->

---

# Link back — Week 4's Huffman coding

- Huffman: compresses by exploiting **skewed frequencies**
- Compressed trie: compresses by removing **structural** waste
- Huffman shape depends on how OFTEN symbols occur
- Trie shape depends only on the actual characters stored

<!-- Speaker note: Two completely different compression ideas from this course — worth naming the difference explicitly. -->

---

# Compressed trie, step by step

<iframe class="dsanim" src="anim/compressed-trie.html?yer=slayt&lang=en" title="Compressed trie"></iframe>

<!-- Speaker note: Normal example: TEST, TEA, TEAM — watch the TEST edge split into TE + ST, then TEAM extend past the A node. -->

---

# Edge case — splits nested inside splits

<iframe class="dsanim" src="anim/compressed-trie.html?yer=slayt&lang=en&example=nested-split" title="Compressed trie: nested splits"></iframe>

<!-- Speaker note: ANT, ARM, ART, AXE — a split inside a split, the hardest case this structure has to handle correctly. -->

---

# Code — insert (extend, create, or split)

```c
int j = common_prefix_len(word + i, child->label);
if (j == strlen(child->label)) {
    node = child; i += j;   /* descend */
} else {
    RNode *mid = split_edge(node, child, j);
    /* new leaf for the remaining suffix */
}
```

<!-- Speaker note: The full split_edge logic (shortening the old label, re-keying the child) is in the notes — this is the decision point. -->

---

# Complexity

- `insert`, `search`: still `O(L)`, exactly like a plain trie
- Savings are in **space**, not time
- Node count bounded by branch points + word endings
- Not by total character count

<!-- Speaker note: The time complexity is unchanged; only the constant factor on memory improves, sometimes dramatically. -->

---

# Common mistakes

- Splitting at the wrong length (must be the common prefix length)
- Forgetting to re-key the split child under its new first letter
- Treating "path exists" as "word found" (same trap as section 3)

<!-- Speaker note: The re-keying bug is subtle — the child's map/array key must change to match its shortened label's new first letter. -->

---

# Mini-quiz

A compressed trie holds only "APPLE"
and "BANANA". How many non-root nodes
does it have, and why so few?

<!-- Speaker note: Let students reason it out before revealing — the "no shared prefix" case is the simplest possible one. -->

---

# Answer

**Two.** No shared prefix at all, so
each word becomes one single leaf edge
straight from the root.

<!-- Speaker note: Contrast with a plain trie, which would need 5 + 6 = 11 nodes for the same two words. -->

---

<!-- _class: bolum -->

# 5. Suffix Arrays

<!-- Speaker note: Section 5 answers a different question: not "is X a word?" but "does pattern P occur anywhere in text T?" -->

---

# A question to start

A trie answers "is X a stored word?"
What about "does P occur anywhere
inside one long text T?"

<!-- Speaker note: This is the question a text editor's "find" feature, or a genome browser, asks constantly. -->

---

# The idea: every suffix, sorted

- List **every** suffix of `T`, starting position by position
- Sort those `n` suffixes lexicographically
- A pattern search becomes a **binary search**: `O(m log n)`
- No sentinel needed — two suffixes always differ in length

<!-- Speaker note: "Always differ in length" is why a shorter suffix that is a prefix of a longer one just sorts first, automatically. -->

---

# Suffix array, step by step

<iframe class="dsanim" src="anim/suffix-array.html?yer=slayt&lang=en" title="Suffix array"></iframe>

<!-- Speaker note: Normal example: MISSISSIPPI — watch each suffix, as its own row, slide into sorted position via insertion sort. -->

---

# Edge case — every character identical

<iframe class="dsanim" src="anim/suffix-array.html?yer=slayt&lang=en&example=all-same" title="Suffix array: AAAAAAAAAA"></iframe>

<!-- Speaker note: AAAAAAAAAA — every comparison runs all the way to the shorter suffix's end; the length rule alone decides every tie. -->

---

# Code — insertion sort over suffixes

```c
int compare_suffix(const char *text, int a, int b) {
    return strcmp(text + a, text + b);
}
```

- Each suffix is a **pointer** into the same buffer
- No character is ever copied during the sort

<!-- Speaker note: This is a nice, concrete example of "clever pointer use avoids O(n) extra memory and copying." -->

---

# Complexity

- Insertion sort here: `O(n^2)` comparisons, worst case
- Each comparison: up to `O(n)` characters
- Real libraries build it in `O(n log n)` or `O(n)`
- Once built: pattern search is `O(m log n)`

<!-- Speaker note: The construction cost is paid ONCE; every subsequent search against the same text is fast. -->

---

# Common mistakes

- Adding an unneeded sentinel character "just in case"
- Comparing suffixes by copying substrings (wastes memory)
- Confusing the array's indices with the suffixes' characters

<!-- Speaker note: `sa[i]` is a starting POSITION, not a copy of the suffix — printing the suffix needs `text + sa[i]`. -->

---

# Mini-quiz

Why can two suffixes of the same text
never be byte-for-byte identical?

<!-- Speaker note: This is the key fact that makes a sentinel character unnecessary for the comparison rule. -->

---

# Answer

**They always have different lengths.**
Suffixes start at different positions
in a finite string, so lengths differ.

<!-- Speaker note: Different lengths mean plain lexicographic comparison already handles every possible tie correctly. -->

---

<!-- _class: bolum -->

# 6. The String-Matching Problem, and Naive Search

<!-- Speaker note: Section 6 opens the search family — five algorithms, five different tricks, all answering the same question. -->

---

# A question to start

Given one text and one pattern, where
does the pattern occur? What is the
simplest possible way to answer this?

<!-- Speaker note: "Simplest possible" is naive search — exactly where you would start with no cleverer idea taught yet. -->

---

# The idea: try every shift

- Slide the pattern across the text, one position at a time
- At each shift: compare left to right
- Stop at the first mismatch, or record a full match
- **Keep going after a match** — occurrences can overlap

<!-- Speaker note: "Keep going after a match" is the single most-forgotten rule — a common bug jumps m positions after a hit. -->

---

# Naive search, step by step

<iframe class="dsanim" src="anim/naive-search.html?yer=slayt&lang=en" title="Naive search"></iframe>

<!-- Speaker note: Normal example: text="ABABAABABC", pattern="ABABC" — watch a few false starts before the real match at shift 5. -->

---

# Edge case — the worst case

<iframe class="dsanim" src="anim/naive-search.html?yer=slayt&lang=en&example=hard" title="Naive search: worst case"></iframe>

<!-- Speaker note: text="AAAAAAAAAA", pattern="AAAB" — every shift compares nearly the whole pattern before failing on the LAST character. -->

---

# Code — the double loop

```c
for (int s = 0; s <= n - m; s++) {
    int j = 0;
    while (j < m && text[s+j] == pattern[j])
        j++;
    if (j == m) occ[c++] = s;
}
```

<!-- Speaker note: Every algorithm from here to Section 11 is, in some sense, a smarter way to avoid this double loop's worst case. -->

---

# Complexity

- Best case: `O(n)` — mismatches happen immediately
- Worst case: **`O(n*m)`**
- `"AAAA...AB"` vs `"AAAB"`: nearly every shift, near-full compare
- This worst case is exactly what Sections 7–11 each fix

<!-- Speaker note: Frame naive search's worst case as the villain of the rest of the lecture — every later algorithm is "the fix." -->

---

# Common mistakes

- Forgetting matches can overlap (skipping `m` positions after a hit)
- Looping `s` up to `n` instead of `n - m`
- Assuming naive search is always "bad" — it often wins for short input

<!-- Speaker note: Worst-case complexity is not the only consideration — small inputs favor naive search's tiny constant factor. -->

---

# Mini-quiz

Construct a 2-letter-alphabet text and
pattern that forces EVERY comparison to
reach the pattern's last character.

<!-- Speaker note: Give 60 seconds — many will independently rediscover the "AAAA...B" pattern shown in the hard example. -->

---

# Answer

**`text="AAAAAAAAAA"`, `pattern="AAAB"`.**
The first 3 letters always match; only
the last, `'B'`, ever fails.

<!-- Speaker note: This is exactly the hard-scenario animation shown two slides ago. -->

---

<!-- _class: bolum -->

# 7. Knuth-Morris-Pratt: the Failure Function

<!-- Speaker note: Section 7 builds the table Section 8 uses — a KMP lecture needs both halves to make sense. -->

---

# A question to start

Naive search throws away everything it
learned after a mismatch. What if the
pattern's own structure told us more?

<!-- Speaker note: The key insight: the pattern can be studied ONCE, in advance, independent of the text it will search. -->

---

# A short history

- Knuth, Morris, and Pratt, 1977 (SIAM J. Computing)
- Independently developed by Morris & Pratt, ~1970
- The table: `lps[]` — "longest proper prefix, also a suffix"
- Built by comparing the pattern **to itself**

<!-- Speaker note: One of the most-cited papers in string algorithms — still the first thing taught after naive search in most courses. -->

---

# The idea: lps[i]

- For every prefix `pattern[0..i]`...
- ...the longest proper prefix that is ALSO a suffix
- `"ABAB"`: longest such match is `"AB"` — `lps[3] = 2`
- Tells a future search: "this much can be reused"

<!-- Speaker note: Work through "ABAB" -> lps=2 on the board; it is short enough to do by hand in under a minute. -->

---

# KMP failure function, step by step

<iframe class="dsanim" src="anim/kmp-failure-function.html?yer=slayt&lang=en" title="KMP failure function"></iframe>

<!-- Speaker note: Normal example: ABABCABABA — watch len grow on a match, and fall back through lps[len-1] (never straight to 0) on a mismatch. -->

---

# Edge case — the fallback chases a chain

<iframe class="dsanim" src="anim/kmp-failure-function.html?yer=slayt&lang=en&example=multilevel-fallback" title="KMP lps: fallback chain"></iframe>

<!-- Speaker note: AABAACAABAA — a mismatch falls back through more than one level of lps, not straight to 0. -->

---

# Code — building lps[]

```c
int len = 0, i = 1;
while (i < m) {
    if (pattern[i] == pattern[len]) {
        lps[i++] = ++len;
    } else if (len != 0) {
        len = lps[len - 1];
    } else {
        lps[i++] = 0;
    }
}
```

<!-- Speaker note: The "else if (len != 0)" branch — falling back instead of resetting — is THE line students get wrong first. -->

---

# Complexity

- `O(m)` to build the whole table
- `len` decreases at most as many times as it increases
- Total work bounded by `O(m)`, never `O(m^2)`
- Same amortized argument reused in Sections 8 and 11

<!-- Speaker note: This amortized argument (a value that only decreases as much as it increased) recurs constantly in string algorithms. -->

---

# Common mistakes

- Resetting `len` to 0 on every mismatch (the #1 KMP bug)
- Off-by-one: comparing `pattern[len]`, not `pattern[len+1]`
- Forgetting `lps[0] = 0` is a fixed base case, not computed

<!-- Speaker note: Resetting to 0 still produces A table — just the WRONG one, one that under-reports safe skip distance. -->

---

# Mini-quiz

What does `lps[m-1]` — the very last
entry — tell you about the whole
pattern?

<!-- Speaker note: This connects the table's last entry to the pattern's own self-overlap as a whole, not just a prefix. -->

---

# Answer

**The pattern's longest "border"** — its
longest proper prefix that is also its
own suffix, as a whole.

<!-- Speaker note: "AAAAAAAAAA" has lps[m-1] = m-1, the maximum possible self-overlap. -->

---

<!-- _class: bolum -->

# 8. Knuth-Morris-Pratt: the Search

<!-- Speaker note: Section 8 is where the lps table earns its keep — this is the payoff slide sequence for section 7's setup. -->

---

# A question to start

With `lps[]` in hand, can we search
the text with a pointer that
**never moves backward**?

<!-- Speaker note: "Never moves backward" is the single guarantee that gives KMP its O(n+m) bound — say it more than once. -->

---

# The idea: i never rewinds

- Two pointers: `i` (text), `j` (pattern)
- Match: both advance
- Mismatch, `j > 0`: `j` falls back to `lps[j-1]` — `i` stays put
- Mismatch, `j == 0`: only `i` advances

<!-- Speaker note: "i stays put" on a fallback is the key line — the text character is never re-examined. -->

---

# KMP search, step by step

<iframe class="dsanim" src="anim/kmp-search.html?yer=slayt&lang=en" title="KMP search"></iframe>

<!-- Speaker note: Normal example: the classic CLRS-style text/pattern pair — watch i march forward while j jumps around using lps. -->

---

# Edge case — many lps fallbacks

<iframe class="dsanim" src="anim/kmp-search.html?yer=slayt&lang=en&example=hard" title="KMP search: many fallbacks"></iframe>

<!-- Speaker note: text="AAAAAAAAAAAAAAAB", pattern="AAAAB" — a dense sequence of fallbacks, but i still only ever moves forward. -->

---

# Code — the main loop

```c
while (i < n) {
    if (text[i] == pattern[j]) {
        i++; j++;
        if (j == m) { occ[c++] = i-m; j = lps[j-1]; }
    } else if (j > 0) {
        j = lps[j - 1];
    } else { i++; }
}
```

<!-- Speaker note: Three branches, one for each case on the "idea" slide — map them 1:1 with students before moving on. -->

---

# Complexity

- `O(n + m)`: `O(m)` to build `lps`, `O(n)` for the search
- `i` advances at most `n` times, total, ever
- Holds for **any** text or pattern — no bad input exists
- Compare to naive search's `O(n*m)` worst case

<!-- Speaker note: "No bad input exists" is worth repeating — KMP has no configuration or input that degrades it. -->

---

# Common mistakes

- Advancing `i` on a fallback (defeats the whole guarantee)
- Forgetting to fall back again after recording a match
- Reusing a stale `lps[]` table built for a different pattern

<!-- Speaker note: Forgetting the post-match fallback silently misses overlapping occurrences — a quiet, hard-to-spot bug. -->

---

# Mini-quiz

Why is O(n+m) achievable for KMP but
not for naive search, in one sentence?

<!-- Speaker note: The answer should connect directly back to naive search's "re-examines text characters" root cause. -->

---

# Answer

**No text character is ever
re-examined** — naive search's O(n*m)
comes exactly from re-examining them.

<!-- Speaker note: This slide is the payoff of the whole KMP arc — say it slowly, it is the one sentence worth remembering. -->

---

<!-- _class: bolum -->

# 9. Rabin-Karp: Rolling Hash and Spurious Hits

<!-- Speaker note: Section 9 brings hashing (Week 6) back, in a genuinely new, incremental form. -->

---

# A question to start

What if, instead of comparing
characters at all, we compared a
cheap HASH of each window?

<!-- Speaker note: This is a completely different strategy from KMP's — comparison-avoidance instead of comparison-optimization. -->

---

# A short history

- Rabin and Karp, 1987 (IBM J. Research & Development)
- Reuses Week 6's hashing — but **rolls** it forward
- A hash match is only a **candidate**, never a certainty
- Must always verify before reporting a match

<!-- Speaker note: "Candidate, never a certainty" is the single most important sentence in this section. -->

---

# The idea: roll, don't recompute

- Treat each character as a digit in a fixed base
- Sliding the window: remove outgoing char, add incoming
- One `O(1)` update — the middle characters are never re-read
- A hash **match** must still be **verified** character by character

<!-- Speaker note: "Verified" — say it again. Two different substrings CAN hash to the same value; that is not a bug, it is math. -->

---

# Rabin-Karp, step by step

<iframe class="dsanim" src="anim/rabin-karp.html?yer=slayt&lang=en" title="Rabin-Karp"></iframe>

<!-- Speaker note: Normal example: mod=101, no spurious hits — watch the rolling hash update, O(1), skipping most windows entirely. -->

---

# Edge case — spurious hits

<iframe class="dsanim" src="anim/rabin-karp.html?yer=slayt&lang=en&example=hard" title="Rabin-Karp: spurious hits"></iframe>

<!-- Speaker note: mod=7 (deliberately small) — a hash match that FAILS verification: a spurious hit, correctly rejected. -->

---

# A real bug caught while building this note

- First C draft used `long` for the hash — not `long long`
- On this course's toolchain, `long` is only **32 bits**
- `mod = 1e9+7` overflowed it — silent wrong answer
- Comparing C vs Java output caught it immediately

<!-- Speaker note: A genuine teaching moment — never assume `long` means 64 bits in C; its width is platform-defined. -->

---

# Code — the rolling update

```c
if (s > 0)
    tHash = ((tHash - text[s-1]*hPow % mod + mod)
              * base + text[s+m-1]) % mod;
if (tHash == pHash && strncmp(...) == 0)
    occ[c++] = s;   /* VERIFY, always */
```

<!-- Speaker note: Point at `strncmp` — that call is not optional; skipping it silently reports spurious hits as real matches. -->

---

# Complexity

- Average case: `O(n + m)` — `O(1)` per window
- `O(m)` extra, only for windows whose hash actually matches
- Worst case: `O(n*m)` if the modulus is small/poorly chosen
- A large prime modulus makes that worst case vanishingly rare

<!-- Speaker note: The "hard" example deliberately used mod=7 to make this worst-case behavior visible on purpose. -->

---

# Common mistakes

- Skipping verification (correctness bug, not just speed)
- Using too small a modulus "for simplicity"
- Using a type too narrow for the arithmetic (the `long` bug above)

<!-- Speaker note: These three map exactly to the three things this section's animation and program deliberately demonstrate. -->

---

# Mini-quiz

Why must every Rabin-Karp hash match
still be verified character by
character?

<!-- Speaker note: The pigeonhole principle is the precise mathematical answer, worth naming explicitly. -->

---

# Answer

**Pigeonhole principle** — more possible
substrings than hash values means some
MUST collide. Not a bug; math.

<!-- Speaker note: This is a nice callback to any discrete-math course students may have also taken. -->

---

<!-- _class: bolum -->

# 10. Boyer-Moore: the Bad-Character Rule

<!-- Speaker note: Section 10 introduces the algorithm that is, in practice, often the fastest for natural-language text. -->

---

# A question to start

Every algorithm so far compares left
to right. What if comparing RIGHT to
LEFT let us jump further?

<!-- Speaker note: This sounds backward at first — that is exactly why it is worth pausing on before revealing the idea. -->

---

# A short history

- Boyer and Moore, 1977 (Communications of the ACM)
- This course covers only the **bad-character** rule
- The full algorithm adds a second "good suffix" rule
- Often the fastest string search in practice today

<!-- Speaker note: Mention the good-suffix rule exists, but is out of scope — students should know the name for later reading. -->

---

# The idea: scan backward, jump using what you saw

- Compare `pattern[m-1]` first, then `m-2`, ... right to left
- Mismatch: look up that character's LAST occurrence in the pattern
- Character absent from pattern: jump the **whole pattern length**
- Shift never less than 1 (never backward, never stationary)

<!-- Speaker note: "Never less than 1" is a real implementation trap — repeated characters can make the naive shift formula go to 0. -->

---

# Boyer-Moore, step by step

<iframe class="dsanim" src="anim/boyer-moore-bad-character.html?yer=slayt&lang=en" title="Boyer-Moore bad character"></iframe>

<!-- Speaker note: Normal example: text="ABAAABCDAB", pattern="ABC" — watch the right-to-left scan and the resulting jump size. -->

---

# Edge case — the biggest possible jump

<iframe class="dsanim" src="anim/boyer-moore-bad-character.html?yer=slayt&lang=en&example=max-jump" title="Boyer-Moore: max jump"></iframe>

<!-- Speaker note: text="ZZZZZZZZZZ", pattern="ABC" — Z never appears in the pattern, so every window jumps the full pattern length. -->

---

# Code — the bad-character table and shift

```c
for (int c = 0; c < 256; c++) last[c] = -1;
for (int j = 0; j < m; j++) last[pattern[j]] = j;
/* ... */
int shift = j - last[text[s + j]];
s += shift > 1 ? shift : 1;
```

<!-- Speaker note: The table is built ONCE from the pattern alone — exactly like KMP's lps table, reused unchanged across every window. -->

---

# Complexity

- Best case: `O(n/m)` — large jumps, rich alphabet
- Worst case: `O(n*m)` — low-diversity text (bad-character rule alone)
- Often fastest in practice on natural-language text
- The good-suffix rule (not covered) fixes the worst case

<!-- Speaker note: Emphasize "in practice" — the average case on real text is what makes this algorithm's reputation. -->

---

# Common mistakes

- Forgetting the `shift >= 1` guard (can loop forever without it)
- Building the bad-character table from the TEXT, not the pattern
- Comparing left to right out of habit — loses the whole advantage

<!-- Speaker note: Comparing left-to-right by mistake still finds correct matches — it just throws away Boyer-Moore's entire point. -->

---

# Mini-quiz

Why can Boyer-Moore skip text
characters naive search is forced
to examine?

<!-- Speaker note: The answer is about PROVING a range of positions cannot match, without ever looking at the characters there. -->

---

# Answer

**One comparison proves several
shifts impossible** — no match can
exist there, so they are never checked.

<!-- Speaker note: This "prove, don't check" idea is the conceptual heart of every algorithm faster than naive search this week. -->

---

<!-- _class: bolum -->

# 11. The Z-Algorithm

<!-- Speaker note: Section 11 closes the search family with the most conceptually elegant of the five algorithms. -->

---

# A question to start

Every algorithm so far built its own
bespoke table. Can ONE self-comparison
answer the whole search?

<!-- Speaker note: Frame this as "the elegant one" — students often find the Z-algorithm the most satisfying of the five. -->

---

# The idea: Z[i] and a combined string

- `Z[i]`: how much does `S[i..]` match `S`'s own start?
- Let `S = pattern + '#' + text` (a separator, unused elsewhere)
- `Z[i] >= |pattern|` in the text part: an occurrence
- A `[l, r)` window reuses known values — `O(n + m)` total

<!-- Speaker note: The window [l, r) plays the exact same role as KMP's lps table — "remember what you already know." -->

---

# Z-algorithm, step by step

<iframe class="dsanim" src="anim/z-algorithm.html?yer=slayt&lang=en" title="Z-algorithm"></iframe>

<!-- Speaker note: Normal example: pattern="AB", text="ABABABABAB" — watch the [l,r) window grow and get reused for later positions. -->

---

# Edge case — the window is reused constantly

<iframe class="dsanim" src="anim/z-algorithm.html?yer=slayt&lang=en&example=hard" title="Z-algorithm: window reuse"></iframe>

<!-- Speaker note: pattern="AAA" against "AAAAAAAAAA" — the window keeps growing to the string's very end, reuse at almost every step. -->

---

# Code — the Z-array construction

```c
if (i < r)
    z[i] = min(r - i, z[i - l]);
while (i + z[i] < n && s[z[i]] == s[i + z[i]])
    z[i]++;
if (i + z[i] > r) { l = i; r = i + z[i]; }
```

<!-- Speaker note: Three lines, one per idea: reuse the window, extend it if possible, remember the new window if it grew. -->

---

# Complexity

- `O(n + m)` for the whole combined-string Z-array
- Same amortized argument as KMP's lps: window only grows
- `O(1)` per position to check for an occurrence
- Conceptually the simplest of all five search algorithms

<!-- Speaker note: Worth reminding students this is the third time this lecture has used the same "only grows" amortized argument. -->

---

# Common mistakes

- Forgetting the separator, or picking one that appears in the text
- Using `Z[i] == m` instead of `Z[i] >= m`
- Treating `Z[0]` as meaningful (it is conventionally unused)

<!-- Speaker note: A Z value CAN legitimately exceed m if the text itself repeats — >= is the correct match test, not ==. -->

---

# Mini-quiz

How does the Z-algorithm avoid
building a SEPARATE table like KMP's
lps, in one sentence?

<!-- Speaker note: The honest answer is "it doesn't avoid a table" — Z[] IS the table, playing an analogous role. -->

---

# Answer

**It doesn't avoid one** — `Z[]` IS
the table, just describing overlap
with the WHOLE combined string.

<!-- Speaker note: lps[i] describes overlap within the pattern alone; Z[i] describes overlap with the whole glued-together string. -->

---

<!-- _class: bolum -->

# 12. Comparing the Five Search Algorithms

<!-- Speaker note: A short pause-and-compare section before the lecture pivots to dynamic programming. -->

---

# Comparison table

| Algorithm | Worst case | Typical case | Extra idea |
| --- | --- | --- | --- |
| Naive | O(n·m) | O(n) | Baseline |
| KMP | O(n+m) | O(n+m) | lps[], i never rewinds |
| Rabin-Karp | O(n·m) | O(n+m) avg | Rolling hash, verify |
| Boyer-Moore | O(n·m) | O(n/m) | Right-to-left, big jumps |
| Z-algorithm | O(n+m) | O(n+m) | One self-comparison array |

<!-- Speaker note: KMP is the only one with a GUARANTEED worst case — the safe default whenever adversarial input is a concern. -->

---

<!-- _class: bolum -->

# 13. A New Strategy: Dynamic Programming

<!-- Speaker note: Section 13 introduces dynamic programming from scratch — no prior week in this course has covered it. -->

---

# A question to start

How "different" are two strings? Spell
checkers, `git diff`, and DNA tools all
ask a version of this question.

<!-- Speaker note: These three real-world examples ground an otherwise abstract question in things students already know. -->

---

# Why brute force is too slow

- Recursive definition: match, substitute, delete, or insert
- Correct — but branches into 3 calls at nearly every step
- The SAME sub-problem gets recomputed, exponentially often
- Overlapping sub-problems: the wasted work is fixable

<!-- Speaker note: Write the naive recursive call tree on the board — the repeated sub-trees are visually obvious even for small inputs. -->

---

# The idea: solve each sub-problem once

- **Optimal substructure:** best answer built from best sub-answers
- **Overlapping sub-problems:** the same one recurs many times
- Solve each sub-problem exactly ONCE, store it in a table
- This is dynamic programming — genuinely new this week

<!-- Speaker note: Both properties are required — optimal substructure makes the recursion correct; overlap makes memoizing worthwhile. -->

---

# Edit distance: the question

- Fewest single-character edits to turn `a` into `b`
- Insert, delete, or substitute — each costs 1
- Also called **Levenshtein distance** (1965)
- `dp[i][j]` = edit distance between `a`'s first `i`, `b`'s first `j`

<!-- Speaker note: Levenshtein's original paper predates the "dynamic programming" name becoming standard in this exact context. -->

---

# The recurrence

- Base case: `dp[i][0] = i`, `dp[0][j] = j`
- Characters match: `dp[i][j] = dp[i-1][j-1]` (free)
- Otherwise: `1 + min(diagonal, up, left)`
- Fill row by row — every dependency is already computed

<!-- Speaker note: "Every dependency is already computed" is why no recursion is needed at all — a single pass suffices. -->

---

# Edit distance, step by step

<iframe class="dsanim" src="anim/edit-distance.html?yer=slayt&lang=en" title="Edit distance"></iframe>

<!-- Speaker note: Normal example: KITTEN -> SITTING, distance 3 — watch the table fill, then the traceback reconstruct one edit sequence. -->

---

# Edge case — pure insertion

<iframe class="dsanim" src="anim/edit-distance.html?yer=slayt&lang=en&example=insertion-only" title="Edit distance: pure insertion"></iframe>

<!-- Speaker note: CAT -> CATERPILLAR — a is a prefix of b, so every non-matching step is a pure insert, never a substitute or delete. -->

---

# Code — filling the table

```c
if (a[i-1] == b[j-1])
    dp[i][j] = dp[i-1][j-1];
else {
    int best = min(dp[i-1][j-1],
                    min(dp[i-1][j], dp[i][j-1]));
    dp[i][j] = 1 + best;
}
```

<!-- Speaker note: This is the entire algorithm's core — everything else (base cases, traceback) is bookkeeping around this recurrence. -->

---

# Complexity

- `O(n*m)` time — every cell computed once, in `O(1)`
- `O(n*m)` space for the full table (needed for traceback)
- Dramatic improvement over the naive recursion's exponential time
- A row-only optimization gets space down to `O(m)` (length only)

<!-- Speaker note: Mention the space optimization exists but note it sacrifices the ability to run the traceback afterward. -->

---

# Common mistakes

- Off-by-one: `dp[i][j]` compares `a[i-1]`, not `a[i]`
- Forgetting base cases are `i` and `j`, not zero
- Filling the table in an inconsistent or wrong order

<!-- Speaker note: The base-case bug is sneaky — it silently makes "compare against an empty prefix" look free when it should cost. -->

---

# Mini-quiz

Why does dynamic programming need
BOTH optimal substructure AND
overlapping sub-problems?

<!-- Speaker note: This connects directly back to the "the idea" slide a few slides ago — a good comprehension check. -->

---

# Answer

**Substructure makes it CORRECT.
Overlap makes memoizing WORTH IT** —
without overlap, nothing is recomputed.

<!-- Speaker note: Both halves of this answer matter — many students only remember one of the two properties. -->

---

<!-- _class: bolum -->

# 14. Longest Common Subsequence

<!-- Speaker note: Section 14 reuses section 13's exact table shape with one changed recurrence — a nice "same shape, different meaning" close. -->

---

# A question to start

Not "how different" — but "what
stayed the SAME, in order, even if
not contiguous"?

<!-- Speaker note: This is exactly what a diff tool highlights as unchanged — the connection to git diff pays off here. -->

---

# Subsequence vs substring

- Substring: **contiguous** — `"ACE"` is NOT a substring of `"ABCDE"`
- Subsequence: order preserved, gaps allowed
- `"ACE"` **IS** a subsequence of `"ABCDE"`
- LCS: the longest sequence common to BOTH strings

<!-- Speaker note: This distinction is the single most common conceptual error with LCS — spend real time on this slide. -->

---

# The recurrence — almost the same table

- Base case: `dp[i][0] = dp[0][j] = 0`
- Characters match: `dp[i][j] = dp[i-1][j-1] + 1` (extend)
- Otherwise: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`
- No penalty for a mismatch — only matches ever add anything

<!-- Speaker note: Contrast explicitly with edit distance's min+1 — that contrast is this section's core teaching point. -->

---

# LCS, step by step

<iframe class="dsanim" src="anim/longest-common-subsequence.html?yer=slayt&lang=en" title="Longest common subsequence"></iframe>

<!-- Speaker note: Normal example: ABCBDAB / BDCABA, length 4 — watch the diagonal grow on matches, max carried forward otherwise. -->

---

# Edge case — no shared letters at all

<iframe class="dsanim" src="anim/longest-common-subsequence.html?yer=slayt&lang=en&example=no-common" title="LCS: no common letters"></iframe>

<!-- Speaker note: ABCDE vs FGHIJ — every cell stays 0, the whole table fills with the "no match, carry max" branch only. -->

---

# Code — the recurrence

```c
if (a[i-1] == b[j-1])
    dp[i][j] = dp[i-1][j-1] + 1;
else
    dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
```

<!-- Speaker note: Compare this side by side with edit distance's code slide — the visual similarity is deliberate and instructive. -->

---

# Complexity

- `O(n*m)` time and space — identical to edit distance
- Same table shape, filled the same way
- Only the recurrence at each cell differs
- A template you will recognize again in later algorithm design

<!-- Speaker note: This is the moment to say explicitly: "you now know the DP table shape, not just two isolated algorithms." -->

---

# Common mistakes

- Confusing subsequence with substring (see two slides back)
- Accidentally reusing edit distance's min+1 recurrence
- Reporting only the length when the actual subsequence is wanted

<!-- Speaker note: The traceback is required to recover the actual characters — dp[n][m] alone only answers "how long?" -->

---

# Mini-quiz

Why does LCS use max, while edit
distance uses min+1, even though
both fill the same table shape?

<!-- Speaker note: The closing conceptual question of the lecture — tying together sections 13 and 14 explicitly. -->

---

# Answer

**Edit distance counts a COST** (min
the cheapest). **LCS counts a LENGTH**
of matches (max what is already best).

<!-- Speaker note: This is the cleanest one-sentence summary of the whole DP half of today's lecture. -->

---

# Summary

- **Structures:** char array + `'\0'`, growable buffers, tries,
  compressed tries, suffix arrays
- **Search:** naive, KMP, Rabin-Karp, Boyer-Moore, Z-algorithm
- **New this week:** dynamic programming — edit distance, LCS
- Same DP table shape, two different recurrences

<!-- Speaker note: Five structures, five search algorithms, two DP algorithms — thirteen animations, one lecture. -->

---

# Exercises and self-check

- 10 exercises in the week notes — trace tables and code by hand
- 10 self-check questions with full worked answers
- Try every "edge" preset in the picker, not just "normal"
- Run every program yourself — outputs are all real, captured output

<!-- Speaker note: Encourage students to actually run the programs — every output shown all lecture has been real, not invented. -->

---

# Looking ahead

- Weeks 13–14: more new material before project weeks 15–16
- The DP table shape (`dp[i][j]`, filled once, read via traceback)
- ...reappears throughout algorithm design, not just for strings
- Keep this week's table shape in mind as a template

<!-- Speaker note: Dynamic programming is the one idea this week that will keep resurfacing for the rest of your studies. -->

---

# References

- Cormen, Leiserson, Rivest, Stein — *Introduction to Algorithms*
- Knuth, Morris, Pratt (1977) · Boyer, Moore (1977) · Karp, Rabin (1987)
- Fredkin (1960) · Morrison (1968) · Levenshtein (1965)
- Sedgewick & Wayne — *Algorithms*, 4th ed. (Strings chapter)
- Full list with details in the week notes

<!-- Speaker note: Full citations with journal names, volumes, and years are all in the printed notes' References section. -->

---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Questions?

**CEN207 Data Structures — Week 12**

Next week: continuing new material before Weeks 15–16's project demonstrations

<!-- Speaker note: Thank the class, remind them where the code and notes live, and open the floor. -->
