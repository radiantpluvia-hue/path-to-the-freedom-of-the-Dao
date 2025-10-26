"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEventGraph = buildEventGraph;
exports.traverseFrom = traverseFrom;
exports.findBranchNodes = findBranchNodes;
/**
 * Build a simple adjacency map from an array of event nodes. Each choice's `next` links to another event id.
 */
function buildEventGraph(events) {
    const graph = {};
    events.forEach(e => {
        graph[e.id] = { ...e };
    });
    return graph;
}
/**
 * Traverse the graph from a start node, returning a list of reachable event ids (BFS) up to a depth limit.
 */
function traverseFrom(graph, startId, maxDepth = 10) {
    if (!graph[startId])
        return [];
    const visited = new Set();
    const q = [{ id: startId, depth: 0 }];
    while (q.length) {
        const cur = q.shift();
        if (visited.has(cur.id))
            continue;
        visited.add(cur.id);
        if (cur.depth >= maxDepth)
            continue;
        const node = graph[cur.id];
        (node.choices || []).forEach(c => {
            if (c.next && graph[c.next] && !visited.has(c.next))
                q.push({ id: c.next, depth: cur.depth + 1 });
        });
    }
    return Array.from(visited);
}
/**
 * Find branching nodes (choices > 1) to identify narrative forks.
 */
function findBranchNodes(graph) {
    return Object.values(graph).filter(n => (n.choices || []).length > 1).map(n => n.id);
}
exports.default = { buildEventGraph, traverseFrom, findBranchNodes };
