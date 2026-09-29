---
marp: true
theme: default
style: |
    img[alt~="center"] {
      display: block;
      margin: 0 auto;
    }
_class: lead
paginate: true
backgroundColor: #fff
backgroundImage: url('https://marp.app/assets/hero-background.svg')
header: 'CE205 Data Structures Week-12'
footer: '![height:50px](http://erdogan.edu.tr/Images/Uploads/MyContents/L_379-20170718142719217230.jpg) RTEU CE205 Week-12'
title: "CE205 Data Structures Week-12"
author: "Author: Asst. Prof. Dr. Uğur CORUH"
date:
subtitle: "String Search Algorithms, Tries, Data Structures for Disjoint Sets"
geometry: "left=2.54cm,right=2.54cm,top=1.91cm,bottom=1.91cm"
titlepage: true
titlepage-color: "FFFFFF"
titlepage-text-color: "000000"
titlepage-rule-color: "CCCCCC"
titlepage-rule-height: 4
logo:
logo-width:
page-background:
page-background-opacity:
links-as-notes: true
lot: true
lof: true
listings-disable-line-numbers: true
listings-no-page-break: false
disable-header-and-footer: false
header-left:
header-center:
header-right:
footer-left: "© Dr. Uğur CORUH"
footer-center: "License: CC BY-NC-ND 4.0"
footer-right:
subparagraph: true
lang: en-US 
math: mathjax
tags:
  - ce205-week-12
  - string-search-algorithms
  - tries
  - disjoint-sets
ref_link: na
---

<!-- _backgroundColor: aquq -->

<!-- _color: orange -->

<!-- paginate: false -->

# CE205 Data Structures

# Week-12

### String Search Algorithms, Tries, Data Structures for Disjoint Sets


Download [PDF](pandoc_ce205-week-12-string-algorithms.en_doc.pdf),[DOCX](pandoc_ce205-week-12-string-algorithms.en_word.docx), [SLIDE](ce205-week-12-string-algorithms.en_slide.pdf), [PPTX](ce205-week-12-string-algorithms.en_slide.pptx)

<iframe width=700, height=500 frameBorder=0 src="../ce205-week-12-string-algorithms.en_slide.html"></iframe>

---

<!-- paginate: true -->

### Outline

- Strings
  - Reverse Factor Algorithm (String Search)
    - Knuth-Morris-Pratt Algorithm
    - Horspool Algorithm
    - Boyer-Moore Algorithm
    - Brute-Force / Linear Text Search
    - DFA Text Search
  - Tries
    - Patricia Tree (Radix Tree)
  - Data Structures for Disjoint Sets
    - Disjoint-set operations 
    - Linked-list representation of disjoint sets 
    - Disjoint-set forests 
    - Analysis of union by rank with path compression

---

### Strings - Reverse Factor Algorithm (String Search)
#### Knuth-Morris-Pratt Algorithm

- https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm
- https://www.geeksforgeeks.org/kmp-algorithm-for-pattern-searching/
- https://www.javatpoint.com/daa-knuth-morris-pratt-algorithm
- https://www.educative.io/answers/what-is-the-knuth-morris-pratt-algorithm
- http://www.btechsmartclass.com/data_structures/knuth-morris-pratt-algorithm.html
- https://www-igm.univ-mlv.fr/~lecroq/string/node32.html#SECTION00320
- https://algs4.cs.princeton.edu/lectures/keynote/53SubstringSearch.pdf

---

### Strings - Reverse Factor Algorithm (String Search)
#### Horspool Algorithm

- https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore%E2%80%93Horspool_algorithm
- https://www.inf.hs-flensburg.de/lang/algorithmen/pattern/horsen.htm
- https://www-igm.univ-mlv.fr/~lecroq/string/node18.html

---

### Strings - Reverse Factor Algorithm (String Search)
#### Boyer-Moore Algorithm

- https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore_string-search_algorithm
- https://www.geeksforgeeks.org/boyer-moore-algorithm-for-pattern-searching/?ref=gcse

---

### Strings - Reverse Factor Algorithm (String Search)
#### Brute-Force / Linear Text Search

- https://algs4.cs.princeton.edu/lectures/keynote/53SubstringSearch.pdf

---

### Strings - Reverse Factor Algorithm (String Search)
#### DFA (deterministic finite automaton) Text Search

- https://www.geeksforgeeks.org/finite-automata-algorithm-for-pattern-searching/

---

### Tries
#### Patricia Tree (Radix Tree)

- https://en.wikipedia.org/wiki/Radix_tree
- http://www.btechsmartclass.com/data_structures/tries.html
- https://www.geeksforgeeks.org/implementing-patricia-trie-in-java/


---

### Data Structures for Disjoint Sets

- https://ucoruh.github.io/ce100-algorithms-and-programming-II/week-10/ce100-week-10-graphs/?h=disjoint#disjoint-set-operations

- Disjoint-set operations 
- Linked-list representation of disjoint sets 
- Disjoint-set forests 
- Analysis of union by rank with path compression

- https://www.geeksforgeeks.org/disjoint-set-data-structures/
- https://www.javatpoint.com/disjoint-set-data-structure


---
$$
End-Of-Week-12
$$