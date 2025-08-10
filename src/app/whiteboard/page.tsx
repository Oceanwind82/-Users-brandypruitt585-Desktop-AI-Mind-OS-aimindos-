import { Metadata } from 'next';
import WhiteboardApp from '@/components/WhiteboardApp';

export const metadata: Metadata = {
  title: 'AI Mind Whiteboard - AI Mind OS',
  description: 'Visual AI canvas for mind mapping, brainstorming, and idea generation with AI assistance',
};

export default function WhiteboardPage() {
  return <WhiteboardApp />;
}
