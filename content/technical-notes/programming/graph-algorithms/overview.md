---
title: Overview
description: Graph representations, Depth-First Search (DFS), Breadth-First Search (BFS), and shortest path algorithms.
date: 2026-06-14
order: 10
---

A graph is a non-linear data structure consisting of **vertices** (or nodes) connected by **edges**. Graphs are used to model networks, routing pathways, social connections, and hierarchical dependencies.

---

## 1. Graph Representations

There are two primary ways to store a graph in memory:

### Adjacency List
An array of lists, where the index represents a vertex, and the list contains the neighbors of that vertex.

*   **Space**: $O(V + E)$ — highly space-efficient for sparse graphs.
*   **Lookup**: $O(V)$ to check if an edge exists.

### Adjacency Matrix
A 2D grid of size $V \times V$ where `matrix[i][j]` is $1$ (or a weight value) if an edge exists between $i$ and $j$, and $0$ otherwise.

*   **Space**: $O(V^2)$ — memory-heavy.
*   **Lookup**: $O(1)$ to check if an edge exists.

---

## 2. Fundamental Traversals

Traversing a graph involves visiting every vertex exactly once.

```mermaid
graph TD
    A["Traversal Methods"] --> B["Breadth-First Search (BFS)"]
    A --> C["Depth-First Search (DFS)"]
    B --> B1["Uses a Queue (FIFO)"]
    B --> B2["Explores level-by-level"]
    C --> C1["Uses a Stack (LIFO / Recursion)"]
    C --> C2["Explores deep along branches"]
```

---

## 3. Shortest Path (Dijkstra's)

Dijkstra's algorithm finds the shortest path from a single source node to all other nodes in a weighted graph with non-negative edge weights.

```mermaid
graph LR
    A((A)) -->|4| B((B))
    A -->|2| C((C))
    B -->|5| D((D))
    C -->|1| D((D))
    C -->|10| E((E))
    D -->|3| F((F))
    
    style A fill:#ff7e47
    style F fill:#cc295f
```

### Dijkstra Execution logic
1.  Initialize distances to all nodes as infinity ($\infty$), and distance to source node as $0$.
2.  Select the node with the minimum distance that hasn't been visited yet.
3.  Update the distance values of all adjacent neighbors of the selected node.
4.  Mark the selected node as visited. Repeat until all nodes are visited.
