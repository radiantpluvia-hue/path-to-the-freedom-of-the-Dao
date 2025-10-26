"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findShortestPath = findShortestPath;
// Simple Dijkstra-like search using edges list; edges may be asymmetric
function findShortestPath(nodes, edges, fromId, toId) {
    if (!toId)
        return null;
    const nodeIds = new Set(nodes.map(n => n.id));
    const source = fromId || (nodes[0] && nodes[0].id) || null;
    if (!source)
        return null;
    if (!nodeIds.has(source) || !nodeIds.has(toId))
        return null;
    const adjacency = {};
    for (const n of nodes)
        adjacency[n.id] = [];
    for (const e of edges || []) {
        if (!adjacency[e.from])
            adjacency[e.from] = [];
        adjacency[e.from].push(e);
        // if implicit undirected, push reversed edge if missing
        if (!adjacency[e.to])
            adjacency[e.to] = [];
    }
    // Min-heap replacement: use simple array for small graphs
    const distTicks = {};
    const distSecs = {};
    const prev = {};
    const unvisited = new Set(Array.from(nodeIds));
    for (const id of unvisited) {
        distTicks[id] = Infinity;
        distSecs[id] = Infinity;
        prev[id] = null;
    }
    distTicks[source] = 0;
    distSecs[source] = 0;
    while (unvisited.size > 0) {
        // pick node with smallest distTicks primarily, then secs
        let cur = null;
        let best = Infinity;
        for (const id of unvisited) {
            const score = distTicks[id] + distSecs[id] / 1000;
            if (score < best) {
                best = score;
                cur = id;
            }
        }
        if (!cur)
            break;
        unvisited.delete(cur);
        if (cur === toId)
            break;
        const neighbors = adjacency[cur] || [];
        for (const e of neighbors) {
            if (e.blocked)
                continue; // skip blocked edges
            const neighborId = e.to === cur ? e.from : e.to; // handle undirected
            if (!unvisited.has(neighborId))
                continue;
            const tickCost = (e.durationTicks || 0) + 0; // default 0
            const secCost = (e.durationSeconds || 0) + 0;
            const altTicks = distTicks[cur] + tickCost;
            const altSecs = distSecs[cur] + secCost;
            if (altTicks < distTicks[neighborId] || (altTicks === distTicks[neighborId] && altSecs < distSecs[neighborId])) {
                distTicks[neighborId] = altTicks;
                distSecs[neighborId] = altSecs;
                prev[neighborId] = cur;
            }
        }
    }
    if (distTicks[toId] === Infinity)
        return null;
    const path = [];
    let cur = toId;
    while (cur) {
        path.unshift(cur);
        cur = prev[cur] || null;
    }
    return { path, totalDurationTicks: distTicks[toId], totalDurationSeconds: distSecs[toId] };
}
