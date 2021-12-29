---
marp: true
theme: default
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
---

<!-- _backgroundColor: aquq -->

<!-- _color: orange -->

<!-- paginate: false -->

# CE205 Data Structures

# Week-3

---

<!-- paginate: true -->

## Stacks, Queue Structures, and Related Algorithms and Problems.



---



1. Stack ADT

2. Stack Using Array

3. Stack Using Linked List

---



1. Expressions

a. Infix

b. Postfix

c. Prefix

5. Infix to Postfix Conversion

6. Postfix Expression Evaluation
   
   ---
   
   

7. Queue ADT

a. First Come First Serve, FCFS, FIFO

8. Queue Data structure Using Array

9. Queue Using Linked List

10. Circular Queue Data structure

11. Double Ended Queue Data structure

---



1. Hanoi Tower

2. Multilevel Queue (MLQ)

Hanoi Tower

Recursive Version

[Program for Tower of Hanoi - GeeksforGeeks](https://www.geeksforgeeks.org/c-program-for-tower-of-hanoi/)

Iterative Version

[Iterative Tower of Hanoi - GeeksforGeeks](https://www.geeksforgeeks.org/iterative-tower-of-hanoi/)

---

Iterative Algorithm: 

Calculate the total number of moves required i.e.

"pow(2, n)- 1" here n is number of disks.

2. If number of disks (i.e. n) is even then interchange destination
   
   pole and auxiliary pole.

3. for i = 1 to total number of moves:

  if i%3 == 1:

legal movement of top disk between source pole and destination pole

  if i%3 == 2:

legal movement top disk between source pole and auxiliary pol

  if i%3 == 0:

  legal movement top disk between auxiliary pole and destination pole

---

S = Source

A = Aux

D = Dest

---

Multi Level Queue

[Multilevel Queue (MLQ) CPU Scheduling - GeeksforGeeks](https://www.geeksforgeeks.org/multilevel-queue-mlq-cpu-scheduling/)


