'use client';

import React from 'react';
import { 
  Search, 
  Download, 
  Grid, 
  Move, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Layers,
  Plus,
  Sparkles,
  Link,
  Shapes,
  Type,
  MousePointer,
  Trash2,
  Copy,
  Zap
} from 'lucide-react';
import { useAIContext, useCrossToolAssets } from '@/lib/ai-context';

interface WhiteboardItem {
  id: string;
  type: 'text' | 'image' | 'video' | 'shape' | 'sticky' | 'aiNote' | 'connector' | 'template';
  x: number;
  y: number;
  w?: number;
  h?: number;
  text?: string;
  src?: string;
  color?: string;
  aiGenerated?: boolean;
  timestamp?: number;
  connections?: string[];
  rotation?: number;
  opacity?: number;
  zIndex?: number;
  locked?: boolean;
  style?: {
    fontSize?: number;
    fontWeight?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  };
}

interface ConnectorLine {
  id: string;
  fromId: string;
  toId: string;
  style: 'straight' | 'curved' | 'dashed';
  color: string;
  animated?: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  items: Omit<WhiteboardItem, 'id'>[];
  thumbnail: string;
  category: 'business' | 'creative' | 'education' | 'workflow';
}

export default function WorkbenchWhiteboardEnhanced() {
  const [items, setItems] = React.useState<WhiteboardItem[]>([]);
  const [connectors, setConnectors] = React.useState<ConnectorLine[]>([]);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [scale, setScale] = React.useState(1);
  const [selectedTool, setSelectedTool] = React.useState<'select' | 'text' | 'shape' | 'connector' | 'template'>('select');
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [draggingItem, setDraggingItem] = React.useState<{ id: string; ox: number; oy: number } | null>(null);
  const [panning, setPanning] = React.useState<{ ox: number; oy: number } | null>(null);
  const [snap, setSnap] = React.useState(true);
  const [gridSize] = React.useState(20);
  const [showGrid, setShowGrid] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showTemplates, setShowTemplates] = React.useState(false);
  
  const boardRef = React.useRef<HTMLDivElement>(null);

  // Enhanced AI context integration
  const { context, addActivity } = useAIContext();
  const { relevantAssets, transferAsset } = useCrossToolAssets('whiteboard');

  const templates: Template[] = [
    {
      id: 'mind-map',
      name: 'Mind Map',
      description: 'Central topic with branching ideas',
      thumbnail: '🧠',
      category: 'creative',
      items: [
        { type: 'sticky', x: 400, y: 300, text: 'Central Idea', color: '#8b5cf6', style: { fontSize: 18, fontWeight: 'bold' } },
        { type: 'sticky', x: 200, y: 200, text: 'Branch 1', color: '#06b6d4' },
        { type: 'sticky', x: 600, y: 200, text: 'Branch 2', color: '#06b6d4' },
        { type: 'sticky', x: 200, y: 400, text: 'Branch 3', color: '#06b6d4' },
        { type: 'sticky', x: 600, y: 400, text: 'Branch 4', color: '#06b6d4' }
      ]
    },
    {
      id: 'workflow',
      name: 'Process Flow',
      description: 'Step-by-step workflow diagram',
      thumbnail: '⚡',
      category: 'workflow',
      items: [
        { type: 'shape', x: 100, y: 200, w: 120, h: 60, text: 'Start', color: '#10b981' },
        { type: 'shape', x: 300, y: 200, w: 120, h: 60, text: 'Process', color: '#3b82f6' },
        { type: 'shape', x: 500, y: 200, w: 120, h: 60, text: 'Decision', color: '#f59e0b' },
        { type: 'shape', x: 700, y: 200, w: 120, h: 60, text: 'End', color: '#ef4444' }
      ]
    },
    {
      id: 'kanban',
      name: 'Kanban Board',
      description: 'Task management columns',
      thumbnail: '📋',
      category: 'business',
      items: [
        { type: 'sticky', x: 100, y: 100, w: 200, h: 300, text: 'To Do', color: '#6b7280', style: { fontSize: 16, fontWeight: 'bold' } },
        { type: 'sticky', x: 350, y: 100, w: 200, h: 300, text: 'In Progress', color: '#3b82f6', style: { fontSize: 16, fontWeight: 'bold' } },
        { type: 'sticky', x: 600, y: 100, w: 200, h: 300, text: 'Done', color: '#10b981', style: { fontSize: 16, fontWeight: 'bold' } }
      ]
    }
  ];

  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];
  const shapes = ['rectangle', 'circle', 'triangle', 'diamond'];

  // Enhanced drag and drop with multi-file support
  const onDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const xWorld = (e.clientX - rect.left - pan.x) / scale;
    const yWorld = (e.clientY - rect.top - pan.y) / scale;

    files.forEach((file, index) => {
      const id = crypto.randomUUID();
      let x = xWorld - 50 + (index * 20);
      let y = yWorld - 50 + (index * 20);
      
      if (snap) {
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setItems(prev => [...prev, { 
          id, 
          type: 'image', 
          x, 
          y, 
          src: url, 
          w: 240, 
          h: 180,
          style: { borderRadius: 8 }
        }]);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setItems(prev => [...prev, { 
          id, 
          type: 'video', 
          x, 
          y, 
          src: url, 
          w: 260, 
          h: 160,
          style: { borderRadius: 8 }
        }]);
      } else {
        setItems(prev => [...prev, { 
          id, 
          type: 'text', 
          x, 
          y, 
          text: file.name,
          style: { backgroundColor: '#374151', borderRadius: 4 }
        }]);
      }
    });

    // Track activity
    addActivity({
      tool: 'whiteboard',
      action: 'add_assets',
      content: `Added ${files.length} file(s) to whiteboard`
    });
  }, [pan, scale, snap, gridSize, addActivity]);

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
    
    if (!selectedItems.includes(id)) {
      setSelectedItems([id]);
    }
    
    setDraggingItem({ id, ox: w.x - item.x, oy: w.y - item.y });
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
      
      setItems(prev => prev.map(item => 
        selectedItems.includes(item.id) 
          ? { ...item, x: item.id === draggingItem.id ? nx : item.x + (nx - items.find(i => i.id === draggingItem.id)!.x), 
                      y: item.id === draggingItem.id ? ny : item.y + (ny - items.find(i => i.id === draggingItem.id)!.y) }
          : item
      ));
    } else if (panning) {
      setPan({
        x: e.clientX - panning.ox,
        y: e.clientY - panning.oy
      });
    }
  };

  const onMouseUp = () => {
    setDraggingItem(null);
    setPanning(null);
  };

  const onMouseDownBoard = (e: React.MouseEvent) => {
    if (e.button === 1 || e.shiftKey) {
      setPanning({ ox: e.clientX - pan.x, oy: e.clientY - pan.y });
    } else if (selectedTool === 'select') {
      setSelectedItems([]);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.05 : 0.95;
    setScale(s => Math.min(3, Math.max(0.3, s * factor)));
  };

  // Enhanced AI brainstorming with context awareness
  const generateAIIdeas = async (seedText: string) => {
    try {
      const response = await fetch('/api/ai/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: seedText,
          context: relevantAssets.length > 0 ? `Related content: ${relevantAssets.slice(0, 2).map(a => a.title).join(', ')}` : '',
          userProfile: context.userProfile
        }),
      });
      
      const { ideas } = await response.json();
      
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
          connections: [seedItem.id],
          style: { 
            backgroundColor: '#8b5cf6', 
            borderRadius: 8,
            fontSize: 14
          }
        }]);
      });

      // Add connectors from seed to AI ideas
      ideas.forEach((_: string, index: number) => {
        const connectorId = crypto.randomUUID();
        setConnectors(prev => [...prev, {
          id: connectorId,
          fromId: seedItem.id,
          toId: items[items.length - ideas.length + index]?.id || '',
          style: 'curved',
          color: '#8b5cf6',
          animated: true
        }]);
      });

      // Track AI brainstorming activity
      addActivity({
        tool: 'whiteboard',
        action: 'ai_brainstorm',
        content: `Generated ${ideas.length} AI ideas for: ${seedText}`
      });

    } catch (error) {
      console.error('AI brainstorming failed:', error);
    }
  };

  const addSticky = (template?: Partial<WhiteboardItem>) => {
    const id = crypto.randomUUID();
    const newSticky: WhiteboardItem = {
      id,
      type: 'sticky',
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      text: 'New Note',
      color: colors[Math.floor(Math.random() * colors.length)],
      style: {
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        borderRadius: 8,
        fontSize: 14
      },
      ...template
    };
    
    setItems(prev => [...prev, newSticky]);
  };

  const addShape = (shapeType: string) => {
    const id = crypto.randomUUID();
    const newShape: WhiteboardItem = {
      id,
      type: 'shape',
      x: 300 + Math.random() * 200,
      y: 300 + Math.random() * 200,
      w: 120,
      h: 80,
      text: shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
      color: colors[Math.floor(Math.random() * colors.length)],
      style: {
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        borderRadius: shapeType === 'circle' ? 50 : 8,
        fontSize: 14
      }
    };
    
    setItems(prev => [...prev, newShape]);
  };

  const applyTemplate = (template: Template) => {
    const newItems = template.items.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      x: item.x + 100,
      y: item.y + 100
    }));
    
    setItems(prev => [...prev, ...newItems]);
    setShowTemplates(false);

    // Track template usage
    addActivity({
      tool: 'whiteboard',
      action: 'apply_template',
      content: `Applied ${template.name} template`
    });
  };

  const deleteSelectedItems = () => {
    setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setConnectors(prev => prev.filter(conn => 
      !selectedItems.includes(conn.fromId) && !selectedItems.includes(conn.toId)
    ));
    setSelectedItems([]);
  };

  const duplicateSelectedItems = () => {
    const itemsToDuplicate = items.filter(item => selectedItems.includes(item.id));
    const newItems = itemsToDuplicate.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      x: item.x + 20,
      y: item.y + 20
    }));
    
    setItems(prev => [...prev, ...newItems]);
  };

  const exportPNG = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 800;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple export - in real implementation would render all items
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText('Whiteboard Export - Feature in Development', 50, 50);

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleAssetUse = (asset: { id: string; type: string; content: string | object | null; title: string; sourceTool: string }) => {
    if (asset.type === 'text' && typeof asset.content === 'string') {
      addSticky({
        text: asset.content.substring(0, 100) + (asset.content.length > 100 ? '...' : ''),
        x: 200,
        y: 200,
        color: '#3b82f6',
        style: { backgroundColor: '#3b82f6', fontSize: 12 }
      });
    }
    transferAsset(asset.id, 'whiteboard');
  };

  const filteredItems = items.filter(item => 
    !searchQuery || 
    item.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Toolbar */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4 space-y-3">
        {/* Top Row - Tools */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-700 rounded-lg p-1">
            {[
              { id: 'select', icon: MousePointer, label: 'Select' },
              { id: 'text', icon: Type, label: 'Text' },
              { id: 'shape', icon: Shapes, label: 'Shape' },
              { id: 'connector', icon: Link, label: 'Connect' },
              { id: 'template', icon: Layers, label: 'Templates' }
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => {
                  setSelectedTool(tool.id as 'select' | 'text' | 'shape' | 'connector' | 'template');
                  if (tool.id === 'template') setShowTemplates(true);
                }}
                className={`p-2 rounded ${
                  selectedTool === tool.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-slate-600'
                }`}
                title={tool.label}
              >
                <tool.icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-white/20" />

          {/* Quick Add */}
          <button
            onClick={() => addSticky()}
            className="flex items-center gap-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
          >
            <Plus className="h-4 w-4" />
            Note
          </button>

          <div className="flex gap-1">
            {shapes.map(shape => (
              <button
                key={shape}
                onClick={() => addShape(shape)}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs capitalize"
              >
                {shape}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-white/20" />

          {/* AI Tools */}
          <button
            onClick={() => {
              const seedText = prompt('Enter a topic to brainstorm around:');
              if (seedText) {
                addSticky({ 
                  text: seedText, 
                  x: 400, 
                  y: 300, 
                  color: '#f59e0b',
                  style: { backgroundColor: '#f59e0b', fontSize: 16 }
                });
                setTimeout(() => generateAIIdeas(seedText), 500);
              }
            }}
            className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
          >
            <Sparkles className="h-4 w-4" />
            AI Brainstorm
          </button>

          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="pl-8 pr-3 py-1 bg-slate-700 border border-white/20 rounded text-sm text-white placeholder-gray-400"
              />
            </div>

            {/* View Controls */}
            <div className="flex gap-1">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded ${showGrid ? 'bg-slate-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Toggle Grid"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSnap(!snap)}
                className={`p-2 rounded ${snap ? 'bg-slate-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Toggle Snap"
              >
                <Move className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row - Cross-tool Assets & Actions */}
        <div className="flex items-center justify-between">
          {/* Cross-Tool Assets */}
          {relevantAssets.length > 0 && (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">Available:</span>
              {relevantAssets.slice(0, 3).map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleAssetUse(asset)}
                  className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-xs text-purple-300 hover:bg-purple-600/30"
                >
                  {asset.title.substring(0, 15)}...
                </button>
              ))}
            </div>
          )}

          {/* Selected Items Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">{selectedItems.length} selected</span>
              <button
                onClick={duplicateSelectedItems}
                className="p-1 text-gray-400 hover:text-white"
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={deleteSelectedItems}
                className="p-1 text-red-400 hover:text-red-300"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setScale(s => Math.min(3, s * 1.2))}
              className="p-1 text-gray-400 hover:text-white"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-400 min-w-[3rem]">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(s => Math.max(0.3, s / 1.2))}
              className="p-1 text-gray-400 hover:text-white"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setPan({ x: 0, y: 0 }); setScale(1); }}
              className="p-1 text-gray-400 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={exportPNG}
              className="p-1 text-gray-400 hover:text-white"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Whiteboard Canvas */}
      <div
        ref={boardRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseDown={onMouseDownBoard}
        onWheel={onWheel}
        className="relative flex-1 border border-white/10 rounded-xl bg-slate-900/50 overflow-hidden cursor-crosshair"
        style={{ cursor: selectedTool === 'select' ? 'default' : 'crosshair' }}
      >
        {/* Enhanced Grid Background */}
        {showGrid && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`
            }}
          />
        )}

        {/* Connectors */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {connectors.map(connector => {
            const fromItem = items.find(item => item.id === connector.fromId);
            const toItem = items.find(item => item.id === connector.toId);
            if (!fromItem || !toItem) return null;

            const fromX = (fromItem.x + (fromItem.w || 100) / 2) * scale + pan.x;
            const fromY = (fromItem.y + (fromItem.h || 50) / 2) * scale + pan.y;
            const toX = (toItem.x + (toItem.w || 100) / 2) * scale + pan.x;
            const toY = (toItem.y + (toItem.h || 50) / 2) * scale + pan.y;

            return (
              <line
                key={connector.id}
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke={connector.color}
                strokeWidth="2"
                strokeDasharray={connector.style === 'dashed' ? '5,5' : undefined}
                className={connector.animated ? 'animate-pulse' : ''}
              />
            );
          })}
        </svg>

        {/* Enhanced Items */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {(searchQuery ? filteredItems : items).map((item) => (
            <div
              key={item.id}
              className={`absolute select-none transition-all duration-200 ${
                selectedItems.includes(item.id) 
                  ? 'ring-2 ring-blue-400 ring-opacity-50' 
                  : ''
              } ${
                item.locked ? 'opacity-60' : 'cursor-move hover:shadow-lg'
              }`}
              style={{
                left: item.x,
                top: item.y,
                width: item.w,
                height: item.h,
                zIndex: item.zIndex || 10,
                opacity: item.opacity || 1,
                transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined
              }}
              onMouseDown={(e) => !item.locked && onItemMouseDown(e, item.id)}
              onClick={(e) => {
                if (selectedTool === 'select') {
                  setSelectedItems(prev => 
                    e.ctrlKey || e.metaKey 
                      ? prev.includes(item.id) 
                        ? prev.filter(id => id !== item.id)
                        : [...prev, item.id]
                      : [item.id]
                  );
                }
              }}
            >
              {item.type === 'text' || item.type === 'sticky' || item.type === 'aiNote' ? (
                <div 
                  className={`rounded-lg border px-3 py-2 min-w-[120px] transition-all ${
                    item.aiGenerated 
                      ? 'border-purple-500 bg-purple-900/30 text-purple-100 shadow-lg shadow-purple-500/20' 
                      : 'border-yellow-700 bg-yellow-900/30 text-yellow-100'
                  }`}
                  style={{
                    backgroundColor: item.style?.backgroundColor || item.color,
                    borderRadius: item.style?.borderRadius || 8,
                    fontSize: item.style?.fontSize || 14,
                    fontWeight: item.style?.fontWeight
                  }}
                >
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
                    style={{
                      fontSize: item.style?.fontSize || 14,
                      fontWeight: item.style?.fontWeight
                    }}
                    title={item.aiGenerated ? "AI-generated idea" : "Double-click to generate AI ideas"}
                  />
                  {item.aiGenerated && (
                    <div className="text-xs text-purple-300 mt-1 opacity-70">🤖 AI Generated</div>
                  )}
                </div>
              ) : item.type === 'shape' ? (
                <div 
                  className="flex items-center justify-center text-white font-medium border-2"
                  style={{
                    backgroundColor: item.style?.backgroundColor || item.color,
                    borderColor: item.style?.borderColor || 'transparent',
                    borderRadius: item.style?.borderRadius || 8,
                    width: item.w || 120,
                    height: item.h || 80,
                    fontSize: item.style?.fontSize || 14
                  }}
                >
                  {item.text}
                </div>
              ) : item.type === 'image' ? (
                <div
                  className="border border-white/20 rounded-lg overflow-hidden bg-gray-800"
                  style={{ width: item.w, height: item.h }}
                >
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Image Preview
                  </div>
                </div>
              ) : item.type === 'video' ? (
                <div
                  className="border border-white/20 rounded-lg overflow-hidden bg-gray-800"
                  style={{ width: item.w, height: item.h }}
                >
                  <video 
                    src={item.src} 
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Drop Zone Indicator */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">
          Drop files, or use tools above
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-white/20 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Choose Template</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="p-4 bg-slate-700 hover:bg-slate-600 border border-white/20 rounded-lg text-left transition-colors"
                >
                  <div className="text-2xl mb-2">{template.thumbnail}</div>
                  <h4 className="text-white font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                  <div className="text-xs text-blue-300 mt-2 capitalize">{template.category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
