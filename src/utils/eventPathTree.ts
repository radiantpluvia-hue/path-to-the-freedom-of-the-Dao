/* eslint-disable @typescript-eslint/no-non-null-assertion -- temporary: will triage non-null assertions later */
export type EventNode = {
  id: string;
  title?: string;
  description?: string;
  choices?: { id: string; text: string; next?: string }[];
  tags?: string[];
};

export type EventGraph = Record<string, EventNode>;

/**
 * Build a simple adjacency map from an array of event nodes. Each choice's `next` links to another event id.
 */
export function buildEventGraph(events: EventNode[]): EventGraph {
  const graph: EventGraph = {};
  events.forEach(e => {
    graph[e.id] = { ...e };
  });
  return graph;
}

/**
 * Traverse the graph from a start node, returning a list of reachable event ids (BFS) up to a depth limit.
 */
export function traverseFrom(graph: EventGraph, startId: string, maxDepth = 10): string[] {
  if (!graph[startId]) return [];
  const visited = new Set<string>();
  const q: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];
  while (q.length) {
    const cur = q.shift()!;
    if (visited.has(cur.id)) continue;
    visited.add(cur.id);
    if (cur.depth >= maxDepth) continue;
    const node = graph[cur.id];
    (node.choices || []).forEach(c => {
      if (c.next && graph[c.next] && !visited.has(c.next)) q.push({ id: c.next, depth: cur.depth + 1 });
    });
  }
  return Array.from(visited);
}

/**
 * Find branching nodes (choices > 1) to identify narrative forks.
 */
export function findBranchNodes(graph: EventGraph): string[] {
  return Object.values(graph).filter(n => (n.choices || []).length > 1).map(n => n.id);
}

export default { buildEventGraph, traverseFrom, findBranchNodes };
