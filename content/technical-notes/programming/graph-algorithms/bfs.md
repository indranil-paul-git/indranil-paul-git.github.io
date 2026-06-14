---
title: Breadth-First Search (BFS)
description: Level-by-level traversal of unweighted graphs using a queue.
date: 2026-06-14
order: 20
---

BFS explores nodes level-by-level, making it useful for finding the shortest path in unweighted graphs.

### Queue Traversal Flow

The queue and visited set states during BFS execution:

```mermaid
graph LR
    Q1["Queue: [A]"] --> Q2["Pop A, Push Neighbors: [B, C]"]
    Q2 --> Q3["Pop B, Push Neighbors: [C, D]"]
    Q3 --> Q4["Pop C, Push Neighbors: [D, E]"]
    style Q2 fill:#ff7e47
    style Q3 fill:#cc295f
```

### Python Implementation

Here is the clean, bare Python script utilizing a queue (FIFO):

```python
# Graph represented as an adjacency list
graph = {
    'A': ['B', 'C'],
    'B': ['D'],
    'C': ['D', 'E'],
    'D': ['F'],
    'E': [],
    'F': []
}
start_node = 'A'

visited = []
queue = [start_node]
visited.append(start_node)

# BFS loop using FIFO queue
while queue:
    current = queue.pop(0)
    for neighbor in graph[current]:
        if neighbor not in visited:
            visited.append(neighbor)
            queue.append(neighbor)

print('BFS Traversal Path:', visited)
```
