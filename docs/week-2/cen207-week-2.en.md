---
template: main.html
---

# Week 2 — Linked Lists, Arrays, Matrices

*CEN207 Data Structures (formerly CE205) · Fall 2026–2027*

!!! abstract "This week"
    **Learning outcomes.** By the end of this week, you will be able to explain, design, and implement fundamental linear data structures: **Arrays**, **Matrices**, and **Linked Lists**. You will understand how arrays are laid out in contiguous memory and the mathematical formulas required to map multi-dimensional arrays (2D, 3D matrices) into 1D memory space. You will also learn about **Sparse Matrices** and how to store them efficiently. Finally, you will break free from contiguous memory limitations by mastering **Linked Lists** (Singly, Doubly, and Circular), learning how to dynamically allocate nodes and manipulate pointers to insert, delete, and traverse data in $O(1)$ or $O(n)$ time. These outcomes map to **LO.1** (explain fundamental data structures), **LO.2** (analyze algorithmic complexity), and **LO.7** (choose the right structure for a problem) of the course syllabus.

    **What you need already.** Week 1 gave you the foundation of Big-O notation, memory architecture, and crucially, **pointers**. You must be comfortable with dereferencing pointers and understanding memory addresses, as linked lists are built entirely upon these concepts.

<!-- materials:start -->

<div class="materials" markdown>

[:material-file-pdf-box: Lecture notes (PDF)](cen207-week-2-notes.pdf){ .md-button download="cen207-week-2-notes.pdf" }
[:material-file-word-box: Lecture notes (DOCX)](cen207-week-2-notes.docx){ .md-button download="cen207-week-2-notes.docx" }
[:material-presentation: Slides (PDF)](cen207-week-2-slides.pdf){ .md-button download="cen207-week-2-slides.pdf" }
[:material-microsoft-powerpoint: Slides (PPTX)](cen207-week-2-slides.pptx){ .md-button download="cen207-week-2-slides.pptx" }
[:material-language-html5: Slides (HTML, offline)](cen207-week-2-slides.html){ .md-button download="cen207-week-2-slides.html" }
[:material-folder-zip: Download all (ZIP)](cen207-week-2-materials.zip){ .md-button download="cen207-week-2-materials.zip" }
[:material-fullscreen: Open slides full screen](cen207-week-2-slides.html){ .md-button .md-button--primary target=_blank }

</div>

<div class="deck-frame">
<iframe src="../cen207-week-2-slides.html" title="Week 2 — Linked Lists, Arrays, Matrices" loading="lazy" allowfullscreen></iframe>
</div>

<p class="deck-hint">Click inside the slides and use the arrow keys; use the button at the bottom right of the slides, or the "Open slides full screen" link above, for full screen.</p>

<!-- materials:end -->

## 1. Arrays and Memory Layout

An **array** is the most fundamental data structure. It is a collection of items stored at **contiguous memory locations**. The idea is to store multiple items of the same type together, allowing you to calculate the position of each element by simply adding an offset to a base value (the memory address of the first element).

### 1.1. Address Calculation in 1D Arrays
If you have an array `A[N]` of type `T`, the address of `A[i]` is:
$$ \text{Address}(A[i]) = \text{Base\_Address} + (i \times \text{SizeOf}(T)) $$
Because memory address computation requires only one multiplication and one addition, accessing any element in an array takes **$O(1)$ time**.

### 1.2. Multi-Dimensional Arrays (Matrices)
Hardware memory is strictly one-dimensional (a linear sequence of bytes). Therefore, a 2D matrix like `M[R][C]` (R rows, C columns) must be flattened into 1D memory. There are two ways to do this:

- **Row-Major Order (C/C++, Python):** Stores the first row entirely, then the second row, and so on.
  $$ \text{Address}(M[i][j]) = \text{Base\_Address} + (i \times C + j) \times \text{SizeOf}(T) $$
- **Column-Major Order (Fortran, MATLAB):** Stores the first column entirely, then the second column, etc.
  $$ \text{Address}(M[i][j]) = \text{Base\_Address} + (j \times R + i) \times \text{SizeOf}(T) $$

### 1.3. Sparse Matrices
A **sparse matrix** is a matrix in which most of the elements are zero. Storing all those zeros in a traditional 2D array wastes a massive amount of memory. 
Instead, we only store the non-zero elements using a coordinate format, typically an array of structures or a linked list, where each entry holds `(Row, Column, Value)`.

## 2. Linked Lists

While arrays are incredibly fast for random access, they have severe limitations:
1. Their size is fixed upon creation (static memory allocation).
2. Inserting or deleting an element in the middle requires shifting all subsequent elements, taking **$O(n)$ time**.

A **Linked List** solves this by breaking the contiguous memory requirement. Elements (called **nodes**) are scattered throughout memory. Each node contains its data and a **pointer** to the next node in the sequence.

### 2.1. Singly Linked List
In a Singly Linked List, each node points only to the next node. Navigation is strictly one-way (forward).

```c
typedef struct Node {
    int data;
    struct Node* next;
} Node;
```

**Operations & Time Complexity:**
- **Insertion at Head:** $O(1)$. Just point the new node to the current head, and update the head pointer.
- **Insertion at Tail:** $O(n)$ if we don't maintain a tail pointer, $O(1)$ if we do.
- **Deletion:** $O(n)$ because to delete a node, we must traverse the list to find the node immediately preceding it.
- **Search/Access:** $O(n)$. We must traverse node-by-node from the head. Random access like `list[5]` is not possible.

### 2.2. Doubly Linked List
A Doubly Linked List adds a `prev` pointer to every node, pointing to the previous node. This allows traversal in both directions.

```c
typedef struct DNode {
    int data;
    struct DNode* prev;
    struct DNode* next;
} DNode;
```

**Pros:** Deletion of a specific node becomes $O(1)$ if we already have a pointer to it, because we don't need to traverse the list to find the previous node (we just use `node->prev`).
**Cons:** Each node requires extra memory for the `prev` pointer, and insert/delete operations require updating more pointers.

### 2.3. Circular Linked List
In a Circular Linked List, the `next` pointer of the last node points back to the first node (the head), forming a loop. It can be singly or doubly linked. It is highly useful for applications that need to iterate through a list repeatedly, such as the CPU scheduler giving time slices to processes in a round-robin fashion.

## Self-check quiz

??? success "1. What is the time complexity to access the $i$-th element in a 1D array?"
    $O(1)$. It requires a simple arithmetic operation regardless of the array's size.

??? success "2. Why is inserting at the beginning of a huge array inefficient compared to a linked list?"
    Because in an array, all existing elements must be shifted one position to the right to make room, taking $O(n)$ time. In a linked list, it takes $O(1)$ time by just updating the head pointer.

??? success "3. If a 2D array `M[5][10]` (5 rows, 10 columns) is stored in Row-Major order, what is the 1D index of `M[2][4]`?"
    Index = `(Row * TotalColumns) + Col` = `(2 * 10) + 4` = `24`.

??? success "4. What is the main advantage of a Doubly Linked List over a Singly Linked List?"
    It allows traversing the list backwards and enables $O(1)$ deletion of a node if a pointer to that node is already known (since we have direct access to its predecessor).

## Looking ahead

Next week, we will introduce the **Stack** and the **Queue**. These are abstract data types (ADTs) that enforce strict rules on how elements can be added or removed (LIFO and FIFO). Interestingly, you will see how both Stacks and Queues can be implemented using either the **Arrays** or the **Linked Lists** you learned this week!
