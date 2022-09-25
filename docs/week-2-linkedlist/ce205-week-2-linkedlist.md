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
header: 'CE205 Data Structures Week-2'
footer: '![height:50px](http://erdogan.edu.tr/Images/Uploads/MyContents/L_379-20170718142719217230.jpg) RTEU CE205 Week-2'
title: "CE205 Data Structures Week-2"
author: "Author: Asst. Prof. Dr. Uğur CORUH"
date:
subtitle: "Linked Lists and Related Algorithms, Arrays and Matrices"
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
footer-center: "License: WTFPL"
footer-right:
subparagraph: true
lang: en-US 
math: katex
tags:
  - ce205
ref_link: na
---

<!-- _backgroundColor: aquq -->

<!-- _color: orange -->

<!-- paginate: false -->

# CE205 Data Structures

# Week-2

### Linked Lists and Related Algorithms Arrays and Matrices

Download [DOC](ce205-week-2-linkedlist.md_doc.pdf), [SLIDE](ce205-week-2-linkedlist.md_slide.pdf), [PPTX](ce205-week-2-linkedlist.md_slide.pptx)

<iframe width=700, height=500 frameBorder=0 src="../ce205-week-2-linkedlist.md_slide.html"></iframe>

---

<!-- paginate: true -->

### Outline-1 

- Resources 
- ASN.1 C Workshop
- Single Linked List
- Circular Linked List
- Double Linked List
- XOR Linked List
- Skip List
- Strand Sort

---

### Outline-2

- Arrays
  - Array Rotations
  - Arrangement Rearrangement
  - Array Searching and Sorting
- Matrix
- Sparse Matrix

---

### Resources

- WilliamFiset 
  - [WilliamFiset - YouTube](https://www.youtube.com/c/WilliamFiset-videos/playlists)
  - [GitHub - williamfiset/Algorithms: A collection of algorithms and data structures](https://github.com/williamfiset/Algorithms)
- Btech Smart Class
  - [Data Structures Tutorials - Introduction to Algorithms](http://www.btechsmartclass.com/data_structures/introduction-to-algorithms.html)
- Programiz
  - [Data Structure and Types](https://www.programiz.com/dsa/data-structure-types)
- GeeksforGeeks
  - [Array Data Structure - GeeksforGeeks](https://www.geeksforgeeks.org/array-data-structure/?ref=ghm)
- Visual Algo
  - https://visualgo.net/en

---

### Workshop 
- https://github.com/ucoruh/asn1c-wsl-sample 

---

### Single Linked List

- Btech Smart Class
  - [Data Structures Tutorials - Single Linked List with an example](http://www.btechsmartclass.com/data_structures/single-linked-list.html)
- Visual Algo
  - https://visualgo.net/en/list

---

### Circular Linked List

- Btech Smart Class
  - [Data Structures Tutorials - Circular Linked List with an example | Implementation](http://www.btechsmartclass.com/data_structures/circular-linked-list.html)
- Geeks for Geeks
  - [Circular Linked List | Set 1 (Introduction and Applications) - GeeksforGeeks](https://www.geeksforgeeks.org/circular-linked-list/)
- Geeks for Geeks
  - [Circular Linked List | Set 2 (Traversal) - GeeksforGeeks](https://www.geeksforgeeks.org/circular-linked-list-set-2-traversal/)

---

### Double Linked List

- Btech Smart Class
  - [Data Structures Tutorials - Double Linked List with an example program](http://www.btechsmartclass.com/data_structures/double-linked-list.html)
- Geeks for Geeks
  - [Doubly Linked List | Set 1 (Introduction and Insertion) - GeeksforGeeks](https://www.geeksforgeeks.org/doubly-linked-list/)
- Visual Algo
  - [Linked List (Single, Doubly), Stack, Queue, Deque - VisuAlgo](https://visualgo.net/en/list)

---

### XOR Linked List

- Wikipedia
  - [XOR linked list - Wikipedia](https://en.wikipedia.org/wiki/XOR_linked_list)
- Geeks for Geeks
  - [XOR Linked List - A Memory Efficient Doubly Linked List | Set 1 - GeeksforGeeks](https://www.geeksforgeeks.org/xor-linked-list-a-memory-efficient-doubly-linked-list-set-1/)
- Geeks for Geeks
  - [XOR Linked List – A Memory Efficient Doubly Linked List | Set 2 - GeeksforGeeks](https://www.geeksforgeeks.org/xor-linked-list-a-memory-efficient-doubly-linked-list-set-2/)

---

### Skip List

- Wikipedia
  - [Skip list - Wikipedia](https://en.wikipedia.org/wiki/Skip_list)

- Geeks for Geeks 
  - [Skip List | Set 1 (Introduction) - GeeksforGeeks](https://www.geeksforgeeks.org/skip-list/)

  - [Skip List | Set 2 (Insertion) - GeeksforGeeks](https://www.geeksforgeeks.org/skip-list-set-2-insertion/)

  - [Skip List | Set 3 (Searching and Deletion) - GeeksforGeeks](https://www.geeksforgeeks.org/skip-list-set-3-searching-deletion/)

---

### Strand Sort

- Geeks for Geeks
  - [Strand Sort - GeeksforGeeks](https://www.geeksforgeeks.org/strand-sort/)

---

### Arrays

- Geeks for Geeks 
  - [Array Data Structure - GeeksforGeeks](https://www.geeksforgeeks.org/array-data-structure/)
  - [Data structures Tutorials - Arrays](http://www.btechsmartclass.com/data_structures/arrays.html)
  - [Circular array - GeeksforGeeks](https://www.geeksforgeeks.org/circular-array/)

---

#### Array Rotations

- Geeks for Geeks
  - [Program for array rotation - GeeksforGeeks](https://www.geeksforgeeks.org/array-rotation/)

---

#### Arrangement Rearrangement

- Geeks for Geeks
  - [Array Rearrangement - GeeksforGeeks](https://www.geeksforgeeks.org/array-data-structure/array-rearrangement/)

---

#### Array Searching and Sorting

- Geeks for Geeks 
  - [Difference between Searching and Sorting Algorithms - GeeksforGeeks](https://www.geeksforgeeks.org/difference-between-searching-and-sorting-algorithms/)

---

### Matrix

- Geeks for Geeks
  - [Matrix Archives - GeeksforGeeks](https://www.geeksforgeeks.org/matrix/?ref=ghm)

---

#### Sparse Matrix

- Geeks for Geeks
  - [Data Structures Tutorials - Sparse Matrix with an example](http://www.btechsmartclass.com/data_structures/sparse-matrix.html)

--- 

$$
End-Of-Week-2
$$