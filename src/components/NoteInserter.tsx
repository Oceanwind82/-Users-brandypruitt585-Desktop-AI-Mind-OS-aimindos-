'use client';
import { useEditor } from 'tldraw';

export function insertSticky(editor: unknown, text: string, x: number, y: number) {
  const id = `note-${Math.random().toString(36).slice(2)}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (editor as any).createShape({
    id,
    type: 'geo',
    x,
    y,
    props: {
      geo: 'rectangle',
      w: 240,
      h: 120,
      text,
      fill: 'semi',
      color: 'yellow',
      dash: 'draw',
      size: 'm',
      font: 'draw',
    },
  });
}

export default function NoteInserter({ notes }: { notes: string[] }) {
  const editor = useEditor();
  
  const handleAdd = () => {
    if (!editor || !notes.length) return;
    
    let x = 200;
    let y = 200;
    
    notes.slice(0, 30).forEach((note, i) => {
      insertSticky(editor, note, x, y);
      x += 260;
      if ((i + 1) % 3 === 0) {
        x = 200;
        y += 160;
      }
    });
  };

  return (
    <button 
      onClick={handleAdd} 
      className="mt-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium transition-all duration-200 transform hover:scale-105"
    >
      ✨ Add {notes.length} notes to canvas
    </button>
  );
}
