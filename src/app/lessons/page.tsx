import { redirect } from 'next/navigation';

export default function LessonsPage() {
  // Redirect to dashboard where lessons are displayed
  redirect('/dashboard');
}
