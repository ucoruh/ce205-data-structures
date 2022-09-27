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
Follow the link below and complete steps.
- https://github.com/ucoruh/asn1c-wsl-sample 

There are quick start and reference guides
- http://lionet.info/asn1c/asn1c-quick.pdf
- http://lionet.info/asn1c/asn1c-usage.pdf
- https://www.itu.int/ITU-T/studygroups/com17/languages/
---

### Workshop 
Visit TÜBİTAK KAMU SM MA3API Web Page
- https://yazilim.kamusm.gov.tr/?q=tr/node/19&language=en
- https://yazilim.kamusm.gov.tr/?q=/node/14

---

### Workshop 

Check out ASN.1 encoded standards. 

  - ETSI TS 101 733 CADES digital signature (ASN data structure)
    - https://www.etsi.org/deliver/etsi_ts/101700_101799/101733/02.02.01_60/ts_101733v020201p.pdf
  - ETSI TS 102 778 PADES digital signature (PDF data structure)
    - https://www.etsi.org/deliver/etsi_ts/102700_102799/10277803/01.02.01_60/ts_10277803v010201p.pdf
  - ETSI TS 101 903 XADES digital signature (XML data structure)
    - https://www.etsi.org/deliver/etsi_ts/101900_101999/101903/01.04.02_60/ts_101903v010402p.pdf
  - ETSI TS 102 918 ASiC digital signature
    - https://www.etsi.org/deliver/etsi_ts/102900_102999/102918/01.03.01_60/ts_102918v010301p.pdf

---

### Workshop 

Check out ASN.1 encoded standards. 

- Also there is An Implementation of CAdES, XAdES, PAdES and ASiC for Windows in C++
  - https://github.com/WindowsNT/AdES

---

## Workshop

Telecom Standard Example for ASN.1 

- https://www.etsi.org/deliver/etsi_ts/125400_125499/125413/04.09.00_60/ts_125413v040900p.pdf

---

## Workshop

### Industrial Data Standards - Payment

- TLV Utilities
  - https://paymentcardtools.com/
  - https://emvlab.org/dumpasn1/
- Sample EMV ASN.1 
  - https://github.com/mmattice/emv-asn1
  
---

## Workshop
### Industrial Data Standards - Telco
#### ASN.1 Standartları
- ETSI
  - https://portal.etsi.org/Services/Centre-for-Testing-Interoperability/ETSI-Approach/Specification-Languages/ASN1
- ITU-T
  - https://www.itu.int/ITU-T/recommendations/fl.aspx?lang=1
- ASN.1 Book
  - https://www.oss.com/asn1/resources/books-whitepapers-pubs/dubuisson-asn1-book.PDF

---

## Workshop

### Network Measurement Results Data

- NMR   
  - https://www.etsi.org/deliver/etsi_ts/101500_101599/101503/08.27.00_60/ts_101503v082700p.pdf
- GSM API
  - https://www.etsi.org/deliver/etsi_ts/101400_101499/101476/08.04.01_60/ts_101476v080401p.pdf
- UTRAN
  - https://www.etsi.org/deliver/etsi_ts/125300_125399/125331/13.01.00_60/ts_125331v130100p.pdf
- E-UTRAN
  - https://www.etsi.org/deliver/etsi_ts/136300_136399/136331/15.03.00_60/ts_136331v150300p.pdf

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