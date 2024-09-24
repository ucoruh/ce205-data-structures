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
header: 'CE205 Data Structures Week-10'
footer: '![height:50px](http://erdogan.edu.tr/Images/Uploads/MyContents/L_379-20170718142719217230.jpg) RTEU CE205 Week-10'
title: "CE205 Data Structures Week-10"
author: "Author: Asst. Prof. Dr. Uğur CORUH"
date:
subtitle: "Sorting Algorithms, Taxonomy and Comparisons"
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
  - ce205-week-10
  - advanced-tree-structures
  - binary-search-tree
  - avl-tree
  - red-black-tree
ref_link: na
---

<!-- _backgroundColor: aquq -->

<!-- _color: orange -->

<!-- paginate: false -->

# CE205 Data Structures

# Week-10

### Advaced Tree Data Structures (Binary Search Tree, AVL Tree, B Trees and derivations,Red-Black trees, Splay Trees and Augmented Data Structures, van Emde Boas Trees, Binomial and Minimax Trees ) and Comparisons.

Download [PDF](pandoc_ce205-week-10-advanced-tree-structures.tr_doc.pdf),[DOCX](pandoc_ce205-week-10-advanced-tree-structures.tr_word.docx), [SLIDE](ce205-week-10-advanced-tree-structures.tr_slide.pdf), [PPTX](ce205-week-10-advanced-tree-structures.tr_slide.pptx)

<iframe width=700, height=500 frameBorder=0 src="../ce205-week-10-advanced-tree-structures.tr_slide.html"></iframe>

---

<!-- paginate: true -->

### Outline

- Trees
  - Binary Search Tree
    - Search and Insertion
    - Delete
    - BST over Hash Table
    - Construction and Conversions
    - Check Smallest/Largest Element

---

### Outline

- Trees
  - Red Black Tree and Threaded Binary Tree
  - AVL Trees
  - B Trees
    - Defitinion of B Trees
    - Basic operations on B tree
    - Deleting a key from a B tree
  - 2 3 4 Trees
  - 2 3 Trees
  - B+ Trees

---

### Outline

- Trees
  - R Trees
  - Red - Black Tree Datastructure
  - Splay Tree Datastructure
  - Augmenting Data Structures 
    - Dynamic order statistics 
    -  How to augment a data structure 

---

### Outline

- Trees

  - Interval trees
  - van Emde Boas Trees
    - Preliminary approaches
    - A recursive structure 
    - The van Emde Boas tree
  - Binomial Trees
  - Comparison of Search Trees
  - Minimax Tree

---

### Binary Search Tree

- http://www.btechsmartclass.com/data_structures/binary-search-tree.html 
- https://visualgo.net/en/bst?slide=1 (Select BINARY SEARCH TREE)
- https://www.cs.usfca.edu/~galles/visualization/BST.html 

- Search and Insertion
- Delete

---

### BST over Hash Table

- https://www.geeksforgeeks.org/advantages-of-bst-over-hash-table/?ref=lbp 

- Construction and Conversions
- Check Smallest/Largest Element

---

### Red Black Tree and Threaded Binary Tree

- https://www.geeksforgeeks.org/threaded-binary-tree/ 

---

### AVL Trees

- http://www.btechsmartclass.com/data_structures/avl-trees.html 
- https://visualgo.net/en/bst (Select AVL)
- https://www.cs.usfca.edu/~galles/visualization/AVLtree.html 

---

### B Trees

- http://www.btechsmartclass.com/data_structures/b-trees.html 
- https://www.cs.usfca.edu/~galles/visualization/BTree.html 

---

### Defitinion of B Trees

- https://www.geeksforgeeks.org/introduction-of-b-tree-2/ 

---

#### Basic operations on B tree

- https://www.geeksforgeeks.org/insert-operation-in-b-tree/ 
- https://www.guru99.com/b-tree-example.html 

---

#### Deleting a key from a B tree

- https://www.geeksforgeeks.org/delete-operation-in-b-tree/ 

---

### 2 3 4 Trees

- https://en.wikipedia.org/wiki/2%E2%80%933%E2%80%934_tree 

---

### 2 3 Trees

- https://en.wikipedia.org/wiki/2%E2%80%933_tree

---

### B+ Trees

- https://www.geeksforgeeks.org/introduction-of-b-tree/ 
- https://www.cs.usfca.edu/~galles/visualization/BPlusTree.html 
- https://www.geeksforgeeks.org/difference-between-b-tree-and-b-tree/?ref=rp 

---

### R Trees

- https://www.geeksforgeeks.org/introduction-to-r-tree/?ref=rp 

---

### Red - Black Tree Datastructure

- http://www.btechsmartclass.com/data_structures/red-black-trees.html 
- https://www.geeksforgeeks.org/red-black-tree-set-1-introduction-2/?ref=rp 
- https://www.geeksforgeeks.org/red-black-tree-set-2-insert/ 
- https://www.geeksforgeeks.org/red-black-tree-set-3-delete-2/ 

---

### Splay Tree Datastructure

- http://www.btechsmartclass.com/data_structures/splay-trees.html 
- https://www.geeksforgeeks.org/splay-tree-set-1-insert/?ref=rp 
- https://www.geeksforgeeks.org/splay-tree-set-2-insert-delete/ 
- https://www.geeksforgeeks.org/splay-tree-set-3-delete/?ref=rp 

---

### Augmenting Data Structures 

- http://cs.bilkent.edu.tr/~ugur/teaching/cs502/material/cs502_2_ADS.pdf 

- https://iq.opengenus.org/augmented-data-structures/
- http://staff.ustc.edu.cn/~csli/graduate/algorithms/book6/chap15.htm

- http://www.facweb.iitkgp.ac.in/~sourav/Lecture-11.pdf

---

### Dynamic order statistics 

- http://www.facweb.iitkgp.ac.in/~sourav/Lecture-11.pdf

---

### How to augment a data structure 

- http://www.facweb.iitkgp.ac.in/~sourav/Lecture-11.pdf

---

### Interval trees

- https://www.geeksforgeeks.org/interval-tree/ 

---

### van Emde Boas Trees

- https://www.geeksforgeeks.org/van-emde-boas-tree-set-1-basics-and-construction/ 
- https://web.stanford.edu/class/archive/cs/cs166/cs166.1146/lectures/14/Small14.pdf

- Preliminary approaches
- A recursive structure 

---

### Binomial Trees

- https://www.geeksforgeeks.org/binomial-heap-2/#:~:text=What%20is%20a%20Binomial%20Tree,as%20leftmost%20child%20or%20other. 

---

### Comparison of Search Trees

- http://www.btechsmartclass.com/data_structures/comparison-of-search-trees.html 

---

### Minimax Tree

- https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-1-introduction/ 

---

$$
End-Of-Week-10
$$



