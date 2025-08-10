'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LessonSection {
  title: string;
  content: string;
  duration: number;
  concepts: string[];
}

interface Exercise {
  title: string;
  description: string;
  difficulty: string;
  estimated_time: number;
}

interface Project {
  title: string;
  description: string;
  difficulty: string;
  estimated_time: number;
}

interface LessonContent {
  sections: LessonSection[];
  exercises: Exercise[];
  projects: Project[];
  key_takeaways: string[];
}

interface Lesson {
  lesson_id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  ai_topic_area: string;
  estimated_duration: number;
  relevance_score: number;
  content: LessonContent;
}

interface LessonViewerProps {
  lesson: Lesson;
}

export default function LessonViewer({ lesson }: LessonViewerProps) {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completionData, setCompletionData] = useState({
    satisfaction_rating: 5,
    difficulty_rating: 5,
    engagement_score: 8,
    feedback_text: '',
    would_recommend: true
  });

  useEffect(() => {
    setStartTime(new Date());
  }, []);

  const progress = ((currentSection + 1) / lesson.content.sections.length) * 100;

  const nextSection = () => {
    if (currentSection < lesson.content.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowCompleteForm(true);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const completeLesson = async () => {
    if (!startTime) return;

    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const score = Math.floor(85 + Math.random() * 15); // Mock score between 85-100

    const requestBody = {
      user_id: 'demo_user', // In real app, get from auth
      lesson_id: lesson.lesson_id,
      score,
      time_spent: timeSpent,
      baseXp: 100,
      satisfaction_rating: completionData.satisfaction_rating,
      difficulty_rating: completionData.difficulty_rating,
      engagement_score: completionData.engagement_score,
      feedback_text: completionData.feedback_text,
      lesson_quality_metrics: {
        clarity: 4,
        usefulness: 5,
        pace: 3,
        would_recommend: completionData.would_recommend
      }
    };

    try {
      const response = await fetch('/api/lessons/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      
      if (result.success) {
        setIsCompleted(true);
        // Show success message and redirect after delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-blue-400 bg-blue-400/20';
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 9.5) return 'text-green-400';
    if (score >= 9.0) return 'text-blue-400';
    if (score >= 8.0) return 'text-yellow-400';
    return 'text-purple-400';
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-white mb-4">Lesson Completed!</h1>
          <p className="text-purple-200 text-xl mb-6">
            Amazing work! Your lesson has been tracked and you&apos;ve earned XP.
          </p>
          <div className="text-green-400 text-lg">
            Redirecting to dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (showCompleteForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                🌟 Rate This Amazing Lesson!
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    How satisfied were you with this lesson? (1-5 stars)
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setCompletionData({...completionData, satisfaction_rating: rating})}
                        className={`text-2xl ${
                          rating <= completionData.satisfaction_rating ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    How difficult did you find this lesson? (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={completionData.difficulty_rating}
                    onChange={(e) => setCompletionData({...completionData, difficulty_rating: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-purple-300 text-sm mt-1">
                    {completionData.difficulty_rating}/10
                  </div>
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    How engaging was this lesson? (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={completionData.engagement_score}
                    onChange={(e) => setCompletionData({...completionData, engagement_score: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-purple-300 text-sm mt-1">
                    {completionData.engagement_score}/10
                  </div>
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Would you recommend this lesson to others?
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCompletionData({...completionData, would_recommend: true})}
                      className={`px-4 py-2 rounded-lg ${
                        completionData.would_recommend 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      👍 Yes
                    </button>
                    <button
                      onClick={() => setCompletionData({...completionData, would_recommend: false})}
                      className={`px-4 py-2 rounded-lg ${
                        !completionData.would_recommend 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      👎 No
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Any feedback to make this lesson even more amazing?
                  </label>
                  <textarea
                    value={completionData.feedback_text}
                    onChange={(e) => setCompletionData({...completionData, feedback_text: e.target.value})}
                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg p-3 h-24"
                    placeholder="Your thoughts help us improve..."
                  />
                </div>

                <button
                  onClick={completeLesson}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 text-lg"
                >
                  🎯 Complete Lesson & Earn XP!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSectionData = lesson.content.sections[currentSection];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-purple-200 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
          
          <div className="text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
              {lesson.difficulty.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Lesson Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{lesson.title}</h1>
          <p className="text-purple-200 text-lg mb-4">{lesson.description}</p>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-purple-300">
            <span>📚 {lesson.category}</span>
            <span>⏱️ {lesson.estimated_duration} min</span>
            <span className={`${getRelevanceColor(lesson.relevance_score)} font-bold`}>
              🌟 {lesson.relevance_score}/10 relevance
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-200 text-sm">
              Section {currentSection + 1} of {lesson.content.sections.length}
            </span>
            <span className="text-purple-200 text-sm">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Section Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                {currentSectionData.title}
              </h2>
              
              <div className="prose prose-invert max-w-none">
                <div className="text-purple-100 leading-relaxed whitespace-pre-line">
                  {currentSectionData.content}
                </div>
              </div>

              {/* Key Concepts */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">🧠 Key Concepts</h3>
                <div className="flex flex-wrap gap-2">
                  {currentSectionData.concepts.map((concept, index) => (
                    <span
                      key={index}
                      className="bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-sm"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={prevSection}
                  disabled={currentSection === 0}
                  className="bg-slate-600 hover:bg-slate-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  ← Previous
                </button>
                
                <span className="text-purple-300 text-sm">
                  ⏱️ ~{currentSectionData.duration} minutes
                </span>
                
                <button
                  onClick={nextSection}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300"
                >
                  {currentSection === lesson.content.sections.length - 1 ? 'Complete Lesson' : 'Next →'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Section Overview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">📖 Sections</h3>
              <div className="space-y-2">
                {lesson.content.sections.map((section, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      index === currentSection
                        ? 'bg-purple-500/30 border border-purple-400'
                        : index < currentSection
                        ? 'bg-green-500/20 text-green-300'
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => setCurrentSection(index)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs">
                        {index < currentSection ? '✅' : index === currentSection ? '▶️' : '⏳'}
                      </span>
                      <span className="text-sm text-purple-200">{section.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercises Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">💻 Exercises</h3>
              <div className="space-y-3">
                {lesson.content.exercises.slice(0, 2).map((exercise, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3">
                    <div className="text-sm font-medium text-white">{exercise.title}</div>
                    <div className="text-xs text-purple-300 mt-1">{exercise.description}</div>
                    <div className="text-xs text-blue-400 mt-1">~{exercise.estimated_time} min</div>
                  </div>
                ))}
                {lesson.content.exercises.length > 2 && (
                  <div className="text-xs text-purple-400">
                    +{lesson.content.exercises.length - 2} more exercises
                  </div>
                )}
              </div>
            </div>

            {/* Projects Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">🚀 Projects</h3>
              <div className="space-y-3">
                {lesson.content.projects.slice(0, 1).map((project, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3">
                    <div className="text-sm font-medium text-white">{project.title}</div>
                    <div className="text-xs text-purple-300 mt-1">{project.description}</div>
                    <div className="text-xs text-yellow-400 mt-1">~{Math.floor(project.estimated_time / 60)}h project</div>
                  </div>
                ))}
                {lesson.content.projects.length > 1 && (
                  <div className="text-xs text-purple-400">
                    +{lesson.content.projects.length - 1} more projects
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
