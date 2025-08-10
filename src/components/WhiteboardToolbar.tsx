'use client';
import { Download, Upload, Home } from 'lucide-react';
import { useEditor } from 'tldraw';
import Link from 'next/link';

export default function WhiteboardToolbar() {
  const editor = useEditor();

  const exportJson = () => {
    if (!editor) return;
    const data = editor.store.getSnapshot();
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = () => {
    if (!editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        editor.store.loadSnapshot(json);
      } catch (error) {
        console.error('Failed to import whiteboard:', error);
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-3">
      <Link 
        href="/dashboard"
        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2 transition-colors"
      >
        <Home size={16} />
        Dashboard
      </Link>
      
      <div className="flex gap-2">
        <button 
          onClick={exportJson} 
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2 transition-colors"
        >
          <Download size={16} />
          Export
        </button>
        
        <button 
          onClick={importJson} 
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2 transition-colors"
        >
          <Upload size={16} />
          Import
        </button>
      </div>
    </div>
  );
}
