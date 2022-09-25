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
header: 'CE205 Data Structures Week-6'
footer: '![height:50px](http://erdogan.edu.tr/Images/Uploads/MyContents/L_379-20170718142719217230.jpg) RTEU CE205 Week-6'
title: "CE205 Data Structures Week-6"
author: "Author: Asst. Prof. Dr. Uğur CORUH"
date:
subtitle: "Graph MST, Backtracking, Topological Sorting, Shortest Paths, Connectivity,Max Flow and Cycle Detection Algorithms. Graph Isomorphism and canonization,Graph Cuts"
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

# Week-6

### Graph MST, Backtracking, Topological Sorting, Shortest Paths, Connectivity,Max Flow and Cycle Detection Algorithms.
### Graph Isomorphism and canonization
### Graph Cuts


Download [DOC](ce205-week-6-graph-algorithms.md_doc.pdf), [SLIDE](ce205-week-6-graph-algorithms.md_slide.pdf), [PPTX](ce205-week-6-graph-algorithms.md_slide.pptx)

<iframe width=700, height=500 frameBorder=0 src="../ce205-week-6-graph-algorithms.md_slide.html"></iframe>

---

<!-- paginate: true -->

### Outline-1

- Graph Topological Sorting 
- Graph MST 
- Graph Backtracking
  - Tug of War 
  - n-Queen's Problem
  - m Coloring Problem
  - Euler & Hamiltonian Path

---

### Outline-2

- Graph Sortest Paths 
- Graph Connectivity - SCC
- Graph Max Flow 
- Graph Isomorphism
- Graph canonization
- Graph Cuts
  - Min Cut
  - Max Cut

---

### Outline-3

- Alpha-Beta Pruning
- Hasse Diagrams
- Petri Nets
- Bipartite Graphs
- Cycle Detection
  - Brent’s Algorithm
  - Hare and Tortoise Algorithm
- Bayesian Network

---

### Graph Topological Sorting 

- CE100
  - https://ucoruh.github.io/ce100-algorithms-and-programming-II/week-10/ce100-week-10-graphs/?h=topolo#directed-acyclic-graphs-dag
- Geeks for Geeks
  - https://www.geeksforgeeks.org/topological-sorting/ 

---

### Graph MST 

- CE100
  - https://ucoruh.github.io/ce100-algorithms-and-programming-II/week-10/ce100-week-10-graphs/?h=mst#minimum-spanning-tree-mst
- Geeks for Geeks
  - https://www.geeksforgeeks.org/prims-minimum-spanning-tree-mst-greedy-algo-5/ 

---

### Graph Backtracking 

- Tug of War  
  - Geeks for Geeks
    - https://www.geeksforgeeks.org/tug-of-war/

---

### Graph Backtracking 

- n-Queen's Problem
  - Geeks for Geeks
    - https://www.geeksforgeeks.org/n-queen-problem-backtracking-3/?ref=lbp 

---

### Graph Backtracking 

- m Coloring Problem 
  - Geeks for Geeks
    - https://www.geeksforgeeks.org/m-coloring-problem-backtracking-5/ 
  - Tutorials Point
    - https://www.tutorialspoint.com/M-Coloring-Problem#:~:text=The%20problem%20is%20to%20find,is%20assigned%20on%20which%20vertex.

---

### Graph Backtracking 

- Euler & Hamiltonian Path
  - https://www.geeksforgeeks.org/mathematics-euler-hamiltonian-paths/

---

### Graph Sortest Paths

- Single-Source Shortest Paths (SSSP)
  - https://ucoruh.github.io/ce100-algorithms-and-programming-II/week-11/ce100-week-11-shortestpath/
  - https://visualgo.net/en/sssp?slide=1

---

### Graph Connectivity

- Strongly Connected Components
  - https://ucoruh.github.io/ce100-algorithms-and-programming-II/tr/week-10/ce100-week-10-graphs/?h=scc#strongly-connected-components-scc


---

### Graph Max Flow 

- Geeks for Geeks
  - https://www.geeksforgeeks.org/max-flow-problem-introduction/

---

### Graph Isomorphism

- https://www.sciencedirect.com/science/article/pii/S0747717113001193
- https://www3.cs.stonybrook.edu/~algorith/implement/nauty/implement.shtml 
- https://github.com/Mith13/Graphs-isomorphism 

---

### Graph Cuts

1. Min Cuts
2. Max Cuts

- Wikipedia
  - https://en.wikipedia.org/wiki/Cut_(graph_theory)#:~:text=In%20graph%20theory%2C%20a%20cut,said%20to%20cross%20the%20cut.


---

### Graph canonization

- Wikipedia
  - https://en.wikipedia.org/wiki/  Graph_canonization

---

### Cycle Detection

- https://ucoruh.github.io/ce100-algorithms-and-programming-II/week-10/ce100-week-10-graphs/#cycle-detection

---

### Graph Coloring

- https://ucoruh.github.io/ce100-algorithms-and-programming-II/week-10/ce100-week-10-graphs/#graph-coloring

---

### Alpha-Beta Pruning

- Geeks for Geeks
  - https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-4-alpha-beta-pruning/ 

---

### Hasse Diagrams

- Geeks for Geeks
  - https://www.geeksforgeeks.org/discrete-mathematics-hasse-diagrams/ 

---

### Petri Nets

- Wikipedia
  - https://en.wikipedia.org/wiki/Petri_net 

---

### Bipartite Graphs

- CE100
  - https://ucoruh.github.io/ce100-algorithms-and-programming-II/week-10/ce100-week-10-graphs/?h=bipartite#biparitite-checker
- Geeks for Geeks
  - https://www.geeksforgeeks.org/bipartite-graph/ 

---

### Cycle Detection

- Brent’s Algorithm
  - Geeks for Geeks
    - https://www.geeksforgeeks.org/brents-cycle-detection-algorithm/ 
- Hare and Tortoise Algorithm
  - Geeks for Geeks
    - https://www.geeksforgeeks.org/tag/tortoise-hare-approach/ 

---

### Cycle Detection

- CE100
  - https://ucoruh.github.io/ce100-algorithms-and-programming-II/week-10/ce100-week-10-graphs/?h=bipartite#cycle-detection
  
---

### Bayesian Network

- https://towardsdatascience.com/introduction-to-bayesian-networks-81031eeed94e

--- 

$$
End-Of-Week-6
$$



