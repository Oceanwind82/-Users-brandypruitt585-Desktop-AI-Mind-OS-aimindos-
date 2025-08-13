'use client';

import React from 'react';

type Item = {
  id: string;
  type: 'image' | 'video' | 'text' | 'mindmap' | 'aiNote' | 'connection';
  x: number;
  y: number;
  src?: string;
  text?: string;
  w?: number;
  h?: number;
  color?: string;
  connections?: string[]; // IDs of connected items
  aiGenerated?: boolean;
  timestamp?: number;
};

type FrameRatio = '9:16' | '1:1' | '16:9' | 'None';

export default function WorkbenchWhiteboard() {
  const [items, setItems] = React.useState<Item[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('wb:items');
      return raw ? JSON.parse(raw) as Item[] : [];
    } catch { return []; }
  });
  const [scale, setScale] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [draggingItem, setDraggingItem] = React.useState<{id: string; ox: number; oy: number} | null>(null);
  const [panning, setPanning] = React.useState<{ox: number; oy: number} | null>(null);
  const [snap, setSnap] = React.useState(true);
  const [ratio, setRatio] = React.useState<FrameRatio>('9:16');
  const [project, setProject] = React.useState('Untitled Project');
  const boardRef = React.useRef<HTMLDivElement | null>(null);

  // persist
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('wb:items', JSON.stringify(items));
    localStorage.setItem('wb:ratio', ratio);
  }, [items, ratio]);

  const gridSize = 20;

  const onDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const xWorld = (e.clientX - rect.left - pan.x) / scale;
    const yWorld = (e.clientY - rect.top - pan.y) / scale;

    files.forEach(file => {
      const id = crypto.randomUUID();
      let x = xWorld - 50;
      let y = yWorld - 50;
      if (snap) {
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setItems(prev => [...prev, { id, type: 'image', x, y, src: url, w: 240, h: 180 }]);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setItems(prev => [...prev, { id, type: 'video', x, y, src: url, w: 260, h: 160 }]);
      } else {
        setItems(prev => [...prev, { id, type: 'text', x, y, text: file.name }]);
      }
    });
  }, [pan, scale, snap]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const worldFromEvent = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / scale;
    const y = (e.clientY - rect.top - pan.y) / scale;
    return { x, y };
  };

  const onItemMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const w = worldFromEvent(e);
    const item = items.find(i => i.id === id)!;
    setDraggingItem({ id, ox: w.x - item.x, oy: w.y - item.y });
  };

  const onMouseDownBoard = (e: React.MouseEvent) => {
    if ((e.nativeEvent as MouseEvent).button === 1 || e.shiftKey) {
      setPanning({ ox: e.clientX - pan.x, oy: e.clientY - pan.y });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (draggingItem) {
      const w = worldFromEvent(e);
      let nx = w.x - draggingItem.ox;
      let ny = w.y - draggingItem.oy;
      if (snap) {
        nx = Math.round(nx / gridSize) * gridSize;
        ny = Math.round(ny / gridSize) * gridSize;
      }
      setItems(prev => prev.map(i => i.id === draggingItem.id ? { ...i, x: nx, y: ny } : i));
    } else if (panning) {
      setPan({ x: e.clientX - panning.ox, y: e.clientY - panning.oy });
    }
  };

  const onMouseUp = () => {
    setDraggingItem(null);
    setPanning(null);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.05 : 0.95;
    setScale(s => Math.min(3, Math.max(0.3, s * factor)));
  };

  // AI Brainstorming Feature
  const generateAIIdeas = async (seedText: string) => {
    try {
      const response = await fetch('/api/ai/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: seedText }),
      });
      
      const { ideas } = await response.json();
      
      // Add AI-generated ideas around the seed idea
      const seedItem = items.find(item => item.text === seedText);
      if (!seedItem) return;
      
      ideas.forEach((idea: string, index: number) => {
        const id = crypto.randomUUID();
        const angle = (index * (360 / ideas.length)) * (Math.PI / 180);
        const radius = 200;
        const x = seedItem.x + Math.cos(angle) * radius;
        const y = seedItem.y + Math.sin(angle) * radius;
        
        setItems(prev => [...prev, {
          id,
          type: 'aiNote' as const,
          x: snap ? Math.round(x / gridSize) * gridSize : x,
          y: snap ? Math.round(y / gridSize) * gridSize : y,
          text: idea,
          color: '#8b5cf6',
          aiGenerated: true,
          timestamp: Date.now(),
          connections: [seedItem.id]
        }]);
      });
    } catch (error) {
      console.error('AI brainstorming failed:', error);
    }
  };

  // Removed unused connectItems function

  const addSticky = () => {
    const id = crypto.randomUUID();
    setItems(prev => [...prev, { id, type: 'text', x: 80, y: 80, text: 'Idea…' }]);
  };

  const exportPNG = async () => {
    const node = boardRef.current;
    if (!node) return;
    
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${project.replace(/\s+/g,'_')}.png`;
      a.click();
    } catch (error) {
      alert('Export failed: ' + (error as Error).message);
    }
  };

  const saveProject = () => {
    localStorage.setItem(`wb:project:${project}`, JSON.stringify({ items, ratio }));
  };
  
  const loadProject = () => {
    const raw = localStorage.getItem(`wb:project:${project}`);
    if (raw) {
      const data = JSON.parse(raw);
      setItems(data.items || []);
      setRatio(data.ratio || '9:16');
    }
  };
  
  const newProject = () => { setItems([]); };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <input 
          value={project} 
          onChange={e=>setProject(e.target.value)} 
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-2 py-2 text-sm text-white" 
        />
        <button onClick={saveProject} className="px-3 py-2 text-sm rounded-xl border border-zinc-700 hover:bg-zinc-900 disabled:opacity-50 text-white">
          Save
        </button>
        <button onClick={loadProject} className="px-3 py-2 text-sm rounded-xl border border-zinc-700 hover:bg-zinc-900 disabled:opacity-50 text-white">
          Load
        </button>
        <button onClick={newProject} className="px-3 py-2 text-sm rounded-xl border border-zinc-700 hover:bg-zinc-900 disabled:opacity-50 text-white">
          New
        </button>
        <div className="text-xs text-gray-400">Zoom</div>
        <input 
          type="range" 
          min={30} 
          max={300} 
          value={Math.round(scale*100)} 
          onChange={e=>setScale(Number(e.target.value)/100)} 
        />
        <button 
          onClick={()=>{setPan({x:0,y:0}); setScale(1);}} 
          className="px-3 py-2 text-sm rounded-xl border border-zinc-700 hover:bg-zinc-900 disabled:opacity-50 text-white"
        >
          Reset View
        </button>
        <label className="inline-flex items-center gap-1 text-xs text-white">
          <input type="checkbox" checked={snap} onChange={e=>setSnap(e.target.checked)} /> Snap
        </label>
        <select 
          value={ratio} 
          onChange={e=>setRatio(e.target.value as FrameRatio)} 
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-2 py-2 text-sm text-white"
        >
          <option value="9:16">Frame 9:16</option>
          <option value="1:1">Frame 1:1</option>
          <option value="16:9">Frame 16:9</option>
          <option value="None">No Frame</option>
        </select>
        <button onClick={exportPNG} className="px-3 py-2 text-sm rounded-xl border border-zinc-700 hover:bg-zinc-900 disabled:opacity-50 text-white">
          Export PNG
        </button>
        <button onClick={addSticky} className="px-3 py-2 text-sm rounded-xl border border-zinc-700 hover:bg-zinc-900 disabled:opacity-50 text-white">
          + Sticky
        </button>
        <button 
          onClick={() => {
            const seedText = prompt('Enter a topic to brainstorm around:');
            if (seedText) {
              // First add the seed idea
              const id = crypto.randomUUID();
              setItems(prev => [...prev, { 
                id, 
                type: 'text', 
                x: 200, 
                y: 200, 
                text: seedText,
                color: '#f59e0b'
              }]);
              // Then generate AI ideas
              generateAIIdeas(seedText);
            }
          }}
          className="px-3 py-2 text-sm rounded-xl border border-purple-600 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300"
        >
          🧠 AI Brainstorm
        </button>
        <div className="text-xs text-gray-400">Tip: Hold Shift or Middle-Click to pan. Pinch/ctrl+wheel to zoom.</div>
      </div>

      <div
        ref={boardRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseDown={onMouseDownBoard}
        onWheel={onWheel}
        className="relative flex-1 border border-white/10 rounded-xl bg-slate-900/50 overflow-hidden"
      >
        {/* grid background in world space */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
          backgroundSize: `${gridSize*scale}px ${gridSize*scale}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }} />

        {/* world layer */}
        <div className="absolute inset-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: '0 0' }}>
          {/* Render connections first (behind items) */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            {items.flatMap(item => 
              (item.connections || []).map(connectedId => {
                const connectedItem = items.find(i => i.id === connectedId);
                if (!connectedItem) return null;
                
                const x1 = item.x + (item.w || 60) / 2;
                const y1 = item.y + (item.h || 30) / 2;
                const x2 = connectedItem.x + (connectedItem.w || 60) / 2;
                const y2 = connectedItem.y + (connectedItem.h || 30) / 2;
                
                return (
                  <line
                    key={`${item.id}-${connectedId}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={item.aiGenerated ? '#8b5cf6' : '#64748b'}
                    strokeWidth="2"
                    strokeDasharray={item.aiGenerated ? '4 4' : 'none'}
                    opacity="0.6"
                  />
                );
              })
            )}
          </svg>
          
          {items.map(item => (
            <div key={item.id} onMouseDown={(e) => onItemMouseDown(e, item.id)} className="absolute select-none cursor-move" style={{ left: item.x, top: item.y }}>
              {item.type === 'image' && item.src && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt="drop" className="rounded-xl border border-zinc-700 shadow-lg" style={{ width: item.w ?? 240, height: item.h ?? 180, objectFit: 'cover' }} />
                </>
              )}
              {item.type === 'video' && item.src && (
                <video src={item.src} className="rounded-xl border border-zinc-700 shadow-lg" style={{ width: item.w ?? 260, height: item.h ?? 160 }} controls />
              )}
              {(item.type === 'text' || item.type === 'aiNote') && (
                <div className={`rounded-xl border px-3 py-2 min-w-[120px] ${
                  item.aiGenerated 
                    ? 'border-purple-500 bg-purple-900/30 text-purple-100 shadow-lg shadow-purple-500/20' 
                    : 'border-yellow-700 bg-yellow-900/30 text-yellow-100'
                }`}>
                  <input 
                    className="bg-transparent outline-none w-full text-white" 
                    defaultValue={item.text ?? ''} 
                    onChange={(e) => {
                      const v = e.target.value;
                      setItems(prev => prev.map(i => i.id === item.id ? { ...i, text: v } : i));
                    }} 
                    onDoubleClick={() => {
                      if (!item.aiGenerated && item.text) {
                        generateAIIdeas(item.text);
                      }
                    }}
                    title={item.aiGenerated ? "AI-generated idea" : "Double-click to generate AI ideas"}
                  />
                  {item.aiGenerated && (
                    <div className="text-xs text-purple-300 mt-1 opacity-70">🤖 AI Generated</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Frame overlay in screen space */}
        <FrameOverlay ratio={ratio} />
      </div>
    </div>
  );
}

function FrameOverlay({ ratio }: { ratio: FrameRatio }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = React.useState<{fw:number;fh:number;x:number;y:number} | null>(null);

  const compute = React.useCallback(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    if (ratio === 'None') { setDims(null); return; }
    const [a,b] = ratio.split(':').map(Number);
    const target = a / b;
    const margin = 40;
    const availW = w - margin*2;
    const availH = h - margin*2;
    let fw = availW, fh = fw / target;
    if (fh > availH) { fh = availH; fw = fh * target; }
    setDims({ fw, fh, x: (w - fw)/2, y: (h - fh)/2 });
  }, [ratio]);

  React.useEffect(() => {
    compute();
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [compute]);

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none">
      {dims && (
        <div 
          className="absolute border-2 border-zinc-600/60 rounded-xl" 
          style={{ 
            left: dims.x, 
            top: dims.y, 
            width: dims.fw, 
            height: dims.fh, 
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.35) inset' 
          }} 
          aria-label="Frame overlay" 
          title="Frame"
        >
          <div className="absolute left-2 top-1 text-[10px] px-1 py-0.5 rounded bg-zinc-900/80 border border-zinc-700 text-white">
            {ratio}
          </div>
          {ratio === '9:16' && (
            <>
              <div className="absolute left-0 right-0 top-[8%] h-[10%] border-t border-b border-zinc-700/50" />
              <div className="absolute left-0 right-0 bottom-[8%] h-[12%] border-t border-b border-zinc-700/50" />
            </>
          )}
        </div>
      )}
    </div>
  );
}
