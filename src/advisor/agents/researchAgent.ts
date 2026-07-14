/**
 * Research Agent — builds and updates the Knowledge Graph of roles, tasks,
 * pains, tools and methods. Starts from curated seed data and can grow the
 * graph with entities discovered in free-text answers (e.g. a tool the user
 * mentions that we don't know yet).
 */

import type { KnowledgeEdge, KnowledgeGraph, KnowledgeNode } from "../types";
import { seedEdges, seedNodes } from "../knowledge/seed";

export function buildKnowledgeGraph(): KnowledgeGraph {
  const nodes = new Map<string, KnowledgeNode>();
  for (const n of seedNodes) nodes.set(n.id, { ...n });
  const edges: KnowledgeEdge[] = seedEdges.map((e) => ({ ...e }));
  return { nodes, edges };
}

let customCounter = 0;

/**
 * Merge a user-mentioned entity into the graph. Returns the node id
 * (existing when the label already matches a known node).
 */
export function mergeCustomNode(
  graph: KnowledgeGraph,
  kind: KnowledgeNode["kind"],
  label: string,
): string {
  const normalized = label.trim();
  for (const node of graph.nodes.values()) {
    if (node.kind === kind && node.label.toLowerCase() === normalized.toLowerCase()) {
      return node.id;
    }
  }
  const id = `custom-${kind}-${++customCounter}`;
  graph.nodes.set(id, { id, kind, label: normalized, tags: [] });
  return id;
}

export function nodesOfKind(graph: KnowledgeGraph, kind: KnowledgeNode["kind"]): KnowledgeNode[] {
  return [...graph.nodes.values()].filter((n) => n.kind === kind);
}

/** Outgoing edges of a given kind from a node. */
export function edgesFrom(graph: KnowledgeGraph, from: string, kind?: KnowledgeEdge["kind"]): KnowledgeEdge[] {
  return graph.edges.filter((e) => e.from === from && (!kind || e.kind === kind));
}

/** Incoming edges of a given kind into a node. */
export function edgesTo(graph: KnowledgeGraph, to: string, kind?: KnowledgeEdge["kind"]): KnowledgeEdge[] {
  return graph.edges.filter((e) => e.to === to && (!kind || e.kind === kind));
}
