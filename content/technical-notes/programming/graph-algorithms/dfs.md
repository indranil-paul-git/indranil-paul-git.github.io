---
title: Depth-First Search (DFS)
description: Deep-dive traversal of graphs using a stack.
date: 2026-06-14
order: 30
---

DFS explores as deep as possible along each branch before backtracking.

### Stack Traversal Flow

The stack and visited set states during DFS execution:

```mermaid
graph LR
    S1["Stack: [A]"] --> S2["Pop A, Push Neighbors: [C, B]"]
    S2 --> S3["Pop B, Push Neighbors: [C, D]"]
    S3 --> S4["Pop D, Push Neighbors: [C, F]"]
    style S2 fill:#ff7e47
    style S3 fill:#cc295f
```

### Python Implementation

Here is the clean, bare Python script utilizing a stack (LIFO):

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
stack = [start_node]

# DFS loop using LIFO stack
while stack:
    current = stack.pop()
    if current not in visited:
        visited.append(current)
        # Push neighbors in reverse to explore left-to-right
        for neighbor in reversed(graph[current]):
            if neighbor not in visited:
                stack.append(neighbor)

print('DFS Traversal Path:', visited)
```
