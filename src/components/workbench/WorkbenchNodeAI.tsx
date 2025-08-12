'use client';

import React from 'react';

type Node = { id: string; label: string; x?: number; y?: number };
type Edge = { from: string; to: string };

export default function WorkbenchNodeAI() {
  const [nodes, setNodes] = React.useState<Node[]>([
    { id: 'n1', label: 'Start', x: 80, y: 80 },
    { id: 'n2', label: 'Generate Script', x: 280, y: 80 },
    { id: 'n3', label: 'Render Video', x: 480, y: 80 },
  ]);
  const [edges, setEdges] = React.useState<Edge[]>([{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }]);

  const addNode = () => {
    const id = crypto.randomUUID();
    setNodes(prev => [...prev, { id, label: 'Node ' + (prev.length + 1), x: 80 + prev.length*60, y: 200 }]);
  };
  
  const addEdge = () => {
    if (nodes.length < 2) return;
    setEdges(prev => [...prev, { from: nodes[nodes.length-2].id, to: nodes[nodes.length-1].id }]);
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={addNode} className="px-3 py-2 text-sm rounded-xl border border-zinc-700 hover:bg-zinc-900 disabled:opacity-50 text-white">+ Node</button>
          <button onClick={addEdge} className="px-3 py-2 text-sm rounded-xl border border-zinc-700 hover:bg-zinc-900 disabled:opacity-50 text-white">+ Edge</button>
          <div className="text-xs text-gray-400">Drag nodes in preview →</div>
        </div>
        <div className="space-y-2">
          {nodes.map(n => (
            <div key={n.id} className="flex items-center gap-2">
              <input className="bg-zinc-900 border border-zinc-700 rounded-xl px-2 py-1 text-sm text-white" value={n.label}
                onChange={(e) => setNodes(prev => prev.map(p => p.id === n.id ? { ...p, label: e.target.value } : p))}/>
              <button className="text-xs px-2 py-1 border border-zinc-700 rounded-lg hover:bg-zinc-900 text-white"
                onClick={() => setNodes(prev => prev.filter(p => p.id !== n.id))}>Delete</button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/5 rounded-xl border border-white/10 p-4 overflow-auto">
        <Graph nodes={nodes} setNodes={setNodes} edges={edges} />
      </div>
    </div>
  );
}

function Graph({ nodes, setNodes, edges }: { nodes: Node[]; setNodes: React.Dispatch<React.SetStateAction<Node[]>>; edges: Edge[] }) {
  const [drag, setDrag] = React.useState<{id:string; dx:number; dy:number} | null>(null);

  const onMouseDown = (e: React.MouseEvent, n: Node) => {
    const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
    setDrag({ id: n.id, dx: e.clientX - rect.left - (n.x || 0), dy: e.clientY - rect.top - (n.y || 0) });
  };
  
  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drag) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - drag.dx;
    const y = e.clientY - rect.top - drag.dy;
    setNodes((prev: Node[]) => prev.map(n => n.id === drag.id ? { ...n, x, y } : n));
  };
  
  const onMouseUp = () => setDrag(null);

  const find = (id: string) => nodes.find(n => n.id === id)!;

  return (
    <svg width="100%" height="420" onMouseMove={onMouseMove} onMouseUp={onMouseUp} className="bg-zinc-900 rounded-xl border border-zinc-700">
      {/* Edges */}
      {edges.map((e, i) => {
        const a = find(e.from), b = find(e.to);
        const ax = (a.x||0)+80, ay = (a.y||0)+20;
        const bx = (b.x||0), by = (b.y||0)+20;
        return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke="#666" strokeWidth="2" markerEnd="url(#arrow)"/>;
      })}
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto-start-reverse">
          <path d="M0,0 L0,6 L6,3 z" fill="#666" />
        </marker>
      </defs>
      {/* Nodes */}
      {nodes.map(n => (
        <g key={n.id} transform={`translate(${n.x||0},${n.y||0})`} onMouseDown={(e)=>onMouseDown(e, n)} style={{ cursor: 'move' }}>
          <rect width="160" height="40" rx="10" ry="10" fill="#0f0f0f" stroke="#666" />
          <text x="80" y="24" textAnchor="middle" fontSize="12" fill="#ddd">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}
