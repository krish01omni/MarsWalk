import { graphMemory } from './dataService';
import type { GraphMemoryData, GraphNode, GraphEdge } from '../types/memory';

const STORAGE_KEY = 'ARES_GRAPH_MEMORY_OVERLAY_V1';

export class GraphMemoryService {
  private memory: GraphMemoryData;

  constructor() {
    this.memory = { ...graphMemory };
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.edges) {
          this.memory.nodes = [...graphMemory.nodes, ...parsed.nodes];
          this.memory.edges = [...graphMemory.edges, ...parsed.edges];
        }
      }
    } catch (e) {
      console.warn('Could not load graph memory overlay from localStorage', e);
    }
  }

  private saveToStorage(customNodes: GraphNode[], customEdges: GraphEdge[]) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ nodes: customNodes, edges: customEdges })
      );
    } catch (e) {
      console.warn('Could not persist graph memory overlay', e);
    }
  }

  public getMemory(): GraphMemoryData {
    return this.memory;
  }

  public getNodes(): GraphNode[] {
    return this.memory.nodes;
  }

  public getEdges(): GraphEdge[] {
    return this.memory.edges;
  }

  public getNodeById(id: string): GraphNode | undefined {
    return this.memory.nodes.find(n => n.id === id);
  }

  public getRelatedNodes(nodeId: string): { incoming: GraphNode[]; outgoing: GraphNode[] } {
    const outgoingIds = this.memory.edges
      .filter(e => e.source === nodeId)
      .map(e => e.target);
    const incomingIds = this.memory.edges
      .filter(e => e.target === nodeId)
      .map(e => e.source);

    return {
      outgoing: this.memory.nodes.filter(n => outgoingIds.includes(n.id)),
      incoming: this.memory.nodes.filter(n => incomingIds.includes(n.id))
    };
  }

  public addAstronautNote(label: string, lat: number, lon: number, notes: string): GraphNode {
    const newNode: GraphNode = {
      id: `EVA-NOTE-${Date.now()}`,
      type: 'DiscoverySite',
      label,
      coordinates: [lat, lon],
      contents: notes,
      core_attributes: { created_by: 'Astronaut Field Crew', timestamp: new Date().toISOString() }
    };

    this.memory.nodes.push(newNode);
    const customNodes = this.memory.nodes.filter(n => n.id.startsWith('EVA-NOTE-'));
    this.saveToStorage(customNodes, []);
    return newNode;
  }
}

export const graphMemoryService = new GraphMemoryService();
