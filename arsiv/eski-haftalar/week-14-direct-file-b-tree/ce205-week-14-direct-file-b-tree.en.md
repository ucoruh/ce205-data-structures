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
header: 'CE205 Data Structures Week-14'
footer: '![height:50px](http://erdogan.edu.tr/Images/Uploads/MyContents/L_379-20170718142719217230.jpg) RTEU CE205 Week-14'
title: "CE205 Data Structures Week-14"
author: "Author: Asst. Prof. Dr. Uğur CORUH"
date:
subtitle: "Direct File Organization Indexes Binary and B Tree Structures for File"
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
  - ce205
  - fileorg
  - binarytree
  - btree
  - seqfile
  - multilist
  - invfile
  - bloomfilter
  - signature
  - hashing
ref_link: na
---

<!-- _backgroundColor: aquq -->

<!-- _color: orange -->

<!-- paginate: false -->

# CE205 Data Structures

# Week-14

### Direct File Organization Indexes Binary and B Tree Structures for File

Download [PDF](pandoc_ce205-week-14-direct-file-b-tree.en_doc.pdf),[DOCX](pandoc_ce205-week-14-direct-file-b-tree.en_word.docx), [SLIDE](ce205-week-14-direct-file-b-tree.en_slide.pdf), [PPTX](ce205-week-14-direct-file-b-tree.en_slide.pptx)

<iframe width=700, height=500 frameBorder=0 src="../ce205-week-14-direct-file-b-tree.en_slide.html"></iframe>

---

<!-- paginate: true -->

### Outline

- Indexed Sequential File Organization
- Bits of Information
- Secondary Key Retrieval
  - Multilist File Organization
  - Inverted Files
  - Partial Match Retrieval with Signature Trees
  - Partial Match Retrieval with Page Signatures

---

### Outline

- Bits and Hashing
  - Signature Hashing
  - Bloom Filters
  - Classification Hashing
  - Check Hashing

---

### Outline

- Binary Tree Structures
  - Binary Search Trees
  - AVL Trees
  - Internal Path Reduction Trees

---

### Outline

- B-Trees and Derivatives
  - B-Trees
  - B#-Trees
  - B+ -Trees

---

### Indexed Sequential File Organization
- Bits of Information
- Secondary Key Retrieval
  - Multilist File Organization
  - Inverted Files
  - Partial Match Retrieval with Signature Trees
  - Partial Match Retrieval with Page Signatures

- https://www.amirajcollege.in/wp-content/uploads/2020/06/3130702-chapter-4-hashing-and-file-structure.pdf

---

### Bits and Hashing

- Signature Hashing
  - Unique File Hashing
- Bloom Filters
  - https://www.geeksforgeeks.org/bloom-filters-introduction-and-python-implementation/
- Classification Hashing
  - https://en.wikipedia.org/wiki/Feature_hashing
- Check Hashing

---

### Binary Tree Structures

- Binary Search Trees
- AVL Trees
- Internal Path Reduction Trees

---

### B-Trees and Derivatives

- B-Trees
  - https://www.geeksforgeeks.org/introduction-of-b-tree-2/
  - https://web.itu.edu.tr/~bkurt/Courses/blg341/lecture11.pdf
- B#-Trees
  - .
- B+ -Trees
  - https://www.geeksforgeeks.org/introduction-of-b-tree/?ref=gcse

---

$$
End-Of-Week-14
$$
