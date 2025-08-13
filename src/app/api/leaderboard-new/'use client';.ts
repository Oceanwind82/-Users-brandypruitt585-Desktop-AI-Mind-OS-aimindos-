 'use client';

import { useSpatial3D } from '@/lib/spatial-3d';
import { useAchievements } from '@/hooks/useAchievements';
import PrivacySettings from '@/components/PrivacySettings';
import CompanionMode from '@/components/CompanionMode';
import MultiOutputButton from '@/components/MultiOutputButton';

export default function AdminPage() {
  const spatial = useSpatial3D();
  const { achievements, unlock } = useAchievements();

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Spatial 3D Controls</h2>
        <button
          className="bg-blue-600 px-4 py-2 rounded mr-2"
          onClick={() => spatial.arrangeInGrid()}
        >
          Arrange Panels in Grid
        </button>
        <button
          className="bg-purple-600 px-4 py-2 rounded"
          onClick={() => spatial.arrangeInCircle()}
        >
          Arrange Panels in Circle
        </button>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Achievements</h2>
        <button
          className="bg-yellow-500 text-black px-4 py-2 rounded"
          onClick={() => unlock('admin-test')}
        >
          Unlock Admin Test Achievement
        </button>
        <div className="mt-2 text-green-400">
          {achievements.length > 0 && achievements.join(', ')}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Privacy Settings</h2>
        <PrivacySettings />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Companion Mode</h2>
        <CompanionMode />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Multi-Output Test</h2>
        <MultiOutputButton />
      </section>

      <div className="bg-brand-500 text-white p-4 rounded-2xl shadow-soft mt-8">
        Tailwind is working!
      </div>
    </main>
  );
}