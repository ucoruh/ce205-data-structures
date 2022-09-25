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
header: 'CE205 Data Structures Week-11'
footer: '![height:50px](http://erdogan.edu.tr/Images/Uploads/MyContents/L_379-20170718142719217230.jpg) RTEU CE205 Week-11'
title: "CE205 Data Structures Week-11"
author: "Author: Asst. Prof. Dr. Uğur CORUH"
date:
subtitle: "String Data Structure, Subsequence Search, Alignment and Comparison Algorithms."
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

## Week-11

### String Data Structures

Download [DOC](ce205-week-11-string-structures.md_doc.pdf), [SLIDE](ce205-week-11-string-structures.md_slide.pdf), [PPTX](ce205-week-11-string-structures.md_slide.pptx)

<iframe width=700, height=500 frameBorder=0 src="../ce205-week-11-string-structures.md_slide.html"></iframe>

---

<!-- paginate: true -->

### Outline 

- Strings
  -Longest common subsequence problem
    - Longest increasing subsequence
    - Hunt–Szymanski algorithm (Hunt Macllory)
    - Levenshtein distance
    - Wagner–Fischer algorithm
  - String Alignment
    - Needleman Wunsch
    - Smith Waterman
    - Hunt Macllory
  - String Tokenizer
  - String Comparison

---

### **Strings**

- https://www.geeksforgeeks.org/string-data-structure/

---

#### **Longest common subsequence problem**

- https://ucoruh.github.io/ce100-algorithms-and-programming-II/week-6/ce100-week-6-lcs/?h=lcs#problem-3-longest-common-subsequence

- https://www.geeksforgeeks.org/longest-common-subsequence-dp-4/
- https://www.programiz.com/dsa/longest-common-subsequence

---

#### Longest common subsequence problem
##### Longest increasing subsequence

- https://www.geeksforgeeks.org/longest-increasing-subsequence-dp-3/#:~:text=The%20Longest%20Increasing%20Subsequence%20(LIS)%20problem%20is%20to%20find%20the,50%2C%2060%2C%2080%7D.
- https://cp-algorithms.com/sequences/longest_increasing_subsequence.html

---

#### Longest common subsequence problem
##### Hunt–Szymanski algorithm (Hunt Macllory)

- https://en.wikipedia.org/wiki/Hunt%E2%80%93Szymanski_algorithm
- https://www.geeksforgeeks.org/python-program-for-longest-common-subsequence/?ref=gcse
- https://imada.sdu.dk/~rolf/Edu/DM823/E16/HuntSzymanski.pdf
- https://github.com/LetsTrie/Code-Library-Of-Others/blob/master/sgtlaugh/Hunt-Szymanski.cpp

---

#### Longest common subsequence problem
##### Levenshtein distance

- https://en.wikipedia.org/wiki/Levenshtein_distance
- https://www.geeksforgeeks.org/java-program-to-implement-levenshtein-distance-computing-algorithm/?ref=gcse
- https://medium.com/@ethannam/understanding-the-levenshtein-distance-equation-for-beginners-c4285a5604f0
- https://www.educative.io/answers/the-levenshtein-distance-algorithm

---

#### Longest common subsequence problem
##### Wagner–Fischer algorithm

- https://en.wikipedia.org/wiki/Wagner%E2%80%93Fischer_algorithm
- https://www.geeksforgeeks.org/java-program-to-implement-wagner-and-fisher-algorithm-for-online-string-matching/

---

#### **String Alignment**

- https://www.geeksforgeeks.org/sequence-alignment-problem/?ref=gcse

---

#### String Alignment
##### Needleman Wunsch

- https://en.wikipedia.org/wiki/Needleman%E2%80%93Wunsch_algorithm
- https://www.geeksforgeeks.org/sequence-alignment-problem/?ref=gcse
- https://berthub.eu/nwunsch/
- http://experiments.mostafa.io/public/needleman-wunsch/index.html
- https://zhanggroup.org/NW-align/

---

#### String Alignment
##### Smith Waterman

- https://en.wikipedia.org/wiki/Smith%E2%80%93Waterman_algorithm
- http://jaligner.sourceforge.net/
- http://baba.sourceforge.net/
- https://doc.ugene.net/wiki/display/UUOUM15/Smith-Waterman+Search
- https://www.ebi.ac.uk/Tools/sss/fasta/

---

#### String Alignment
##### Hunt Macllory

- https://en.wikipedia.org/wiki/Hunt%E2%80%93Szymanski_algorithm
- https://www.geeksforgeeks.org/python-program-for-longest-common-subsequence/?ref=gcse
- https://imada.sdu.dk/~rolf/Edu/DM823/E16/HuntSzymanski.pdf
- https://github.com/LetsTrie/Code-Library-Of-Others/blob/master/sgtlaugh/Hunt-Szymanski.cpp

---

#### String Tokenizer

- https://towardsdatascience.com/tokenization-algorithms-explained-e25d5f4322ac
- https://www.oreilly.com/library/view/applied-natural-language/9781492062561/ch04.html
- https://www.geeksforgeeks.org/nlp-how-tokenizing-text-sentence-words-works/?ref=gcse
- https://github.com/frohoff/jdk8u-dev-jdk/blob/master/src/share/classes/java/util/StringTokenizer.java

---

#### String Comparison

- https://en.wikipedia.org/wiki/String-searching_algorithm
- https://www.geeksforgeeks.org/compare-two-strings-in-java/
- https://www.geeksforgeeks.org/comparing-two-strings-cpp/

---

$$
End-Of-Week-11
$$
