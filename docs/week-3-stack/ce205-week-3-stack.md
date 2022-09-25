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
header: 'CE205 Data Structures Week-3'
footer: '![height:50px](http://erdogan.edu.tr/Images/Uploads/MyContents/L_379-20170718142719217230.jpg) RTEU CE205 Week-3'
title: "CE205 Data Structures Week-3"
author: "Author: Asst. Prof. Dr. Uğur CORUH"
date:
subtitle: "Stacks, Queue Structures and Related Algorithms and Problems."
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
math: mathjax
tags:
  - ce205
ref_link: na
---

<!-- _backgroundColor: aquq -->

<!-- _color: orange -->

<!-- paginate: false -->

# CE205 Data Structures
### Week-3
#### Stacks, Queue Structures, and Related Algorithms and Problems.

Download [DOC](ce205-week-3-stack.md_doc.pdf), [SLIDE](ce205-week-3-stack.md_slide.pdf), [PPTX](ce205-week-3-stack.md_slide.pptx)

<iframe width=700, height=500 frameBorder=0 src="../ce205-week-3-stack.md_slide.html"></iframe>

---

<!-- paginate: true -->

### Outline-1

- Stack ADT
  - Stack Using Array
  - Stack Using Linked List
- Expressions
  - Infix
  - Postfix
  - Prefix
  - Infix to Postfix Conversion
  - Postfix Expression Evaluation

---

### Outline-2

- Queue ADT
  - First Come First Serve, FCFS, FIFO
  - Queue Data structure Using Array
  - Queue Using Linked List
  - Circular Queue Data structure
  - Double Ended Queue Data structure
  - Multilevel Queue (MLQ)
- Hanoi Tower

---

### Stack ADT

- BTech Smart Class
  - http://www.btechsmartclass.com/data_structures/stack-adt.html

---

### Stack Using Array

- BTech Smart Class
  - http://www.btechsmartclass.com/data_structures/stack-using-array.html

---

### Stack Using Linked List

- BTech Smart Class
  - http://www.btechsmartclass.com/data_structures/stack-using-linked-list.html


---

### Expressions

- BTech Smart Class
  - http://www.btechsmartclass.com/data_structures/expressions.html
    - Infix
    - Postfix
    - Prefix

---

### Infix to Postfix Conversion

- BTech Smart Class
  - http://www.btechsmartclass.com/data_structures/infix-to-postfix.html

---

### Postfix Expression Evaluation

- BTech Smart Class
  - http://www.btechsmartclass.com/data_structures/postfix-evaluation.html

---
   
### Queue ADT

- BTech Smart Class
  - http://www.btechsmartclass.com/data_structures/queue-adt.html

---

### First Come First Serve, FCFS, FIFO

- BTech Smart Class
  - http://www.btechsmartclass.com/downloads/lab-manuals/Operating-System-Lab-Manual-R18-JNTUH.pdf

---

### Queue Data structure Using Array

- BTech Smart Class
  - http://www.btechsmartclass.com/data_structures/queue-using-array.html

---

### Queue Using Linked List

- BTech Smart Class
  - http://www.btechsmartclass.com/data_structures/queue-using-linked-list.html

---

### Circular Queue Data structure

- BTech Smart Class
  - http://www.btechsmartclass.com/data_structures/circular-queue.html

---

### Double Ended Queue Data structure

- BTech Smart Class
  - http://www.btechsmartclass.com/data_structures/double-ended-queue.html

---

### Multilevel Queue (MLQ)

- Geeks for Geeks
  - https://www.geeksforgeeks.org/multilevel-queue-mlq-cpu-scheduling/

---

### Hanoi Tower

- Geeks for Geeks
  - Recursive Version
    - [Program for Tower of Hanoi - GeeksforGeeks](https://www.geeksforgeeks.org/c-program-for-tower-of-hanoi/)
  - Iterative Version
    - [Iterative Tower of Hanoi - GeeksforGeeks](https://www.geeksforgeeks.org/iterative-tower-of-hanoi/)

---

### Hanoi Tower Iterative Algorithm: 

S = Source

A = Aux

D = Dest

Calculate the total number of moves required i.e.

$pow(2, n)- 1$ here n is number of disks.

---

### Hanoi Tower Iterative Algorithm:

- If number of disks (i.e. n) is even then interchange destination 
  pole and auxiliary pole.
- for i = 1 to total number of moves:
  - if i%3 == 1:
    - legal movement of top disk between source pole and destination pole
  - if i%3 == 2:
    - legal movement top disk between source pole and auxiliary pole
  - if i%3 == 0:
    - legal movement top disk between auxiliary pole and destination pole

---

$$
End-Of-Week-3
$$


