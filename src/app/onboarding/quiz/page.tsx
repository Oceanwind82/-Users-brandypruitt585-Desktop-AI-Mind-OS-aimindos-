'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    path: 'builder' | 'automator' | 'dealmaker';
    points: number;
  }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'work_style',
    question: 'What describes your ideal work style?',
    options: [
      { value: 'create', label: 'Creating and building new things from scratch', path: 'builder', points: 3 },
      { value: 'optimize', label: 'Optimizing and automating existing processes', path: 'automator', points: 3 },
      { value: 'connect', label: 'Connecting people and closing deals', path: 'dealmaker', points: 3 },
    ]
  },
  {
    id: 'problem_solving',
    question: 'When faced with a complex problem, you:',
    options: [
      { value: 'design', label: 'Design a completely new solution', path: 'builder', points: 2 },
      { value: 'systematize', label: 'Break it down into automated steps', path: 'automator', points: 2 },
      { value: 'collaborate', label: 'Find the right people to solve it together', path: 'dealmaker', points: 2 },
    ]
  },
  {
    id: 'motivation',
    question: 'What motivates you most?',
    options: [
      { value: 'innovation', label: 'Bringing innovative ideas to life', path: 'builder', points: 3 },
      { value: 'efficiency', label: 'Making everything run smoothly and efficiently', path: 'automator', points: 3 },
      { value: 'relationships', label: 'Building relationships and winning negotiations', path: 'dealmaker', points: 3 },
    ]
  },
  {
    id: 'tools',
    question: 'Which tools excite you most?',
    options: [
      { value: 'design_dev', label: 'Design and development platforms', path: 'builder', points: 2 },
      { value: 'automation', label: 'Automation and workflow tools', path: 'automator', points: 2 },
      { value: 'crm_sales', label: 'CRM and sales platforms', path: 'dealmaker', points: 2 },
    ]
  },
  {
    id: 'success_metric',
    question: 'How do you measure success?',
    options: [
      { value: 'creation', label: 'By what I\'ve created and launched', path: 'builder', points: 3 },
      { value: 'automation', label: 'By how much I\'ve automated and optimized', path: 'automator', points: 3 },
      { value: 'revenue', label: 'By revenue generated and deals closed', path: 'dealmaker', points: 3 },
    ]
  },
  {
    id: 'learning_style',
    question: 'Your preferred learning style:',
    options: [
      { value: 'hands_on', label: 'Hands-on building and experimenting', path: 'builder', points: 2 },
      { value: 'systematic', label: 'Step-by-step systematic approaches', path: 'automator', points: 2 },
      { value: 'interactive', label: 'Interactive discussions and case studies', path: 'dealmaker', points: 2 },
    ]
  },
  {
    id: 'vision',
    question: 'Your ultimate vision:',
    options: [
      { value: 'products', label: 'Building products that change industries', path: 'builder', points: 3 },
      { value: 'systems', label: 'Creating systems that run themselves', path: 'automator', points: 3 },
      { value: 'empire', label: 'Building a network and business empire', path: 'dealmaker', points: 3 },
    ]
  }
];

const pathDescriptions = {
  builder: {
    title: 'The Builder',
    description: 'You\'re driven to create and innovate. Your path focuses on product development, design thinking, and bringing ideas to life.',
    color: 'from-blue-500 to-cyan-500',
    icon: '🏗️'
  },
  automator: {
    title: 'The Automator', 
    description: 'You see systems everywhere and love making them efficient. Your path focuses on automation, optimization, and scaling processes.',
    color: 'from-purple-500 to-pink-500',
    icon: '⚡'
  },
  dealmaker: {
    title: 'The Deal-Maker',
    description: 'You thrive on connections and negotiations. Your path focuses on sales, networking, and building business relationships.',
    color: 'from-yellow-500 to-orange-500',
    icon: '🤝'
  }
};

export default function OnboardingQuiz() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculatePath = () => {
    const scores = { builder: 0, automator: 0, dealmaker: 0 };
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = quizQuestions.find(q => q.id === questionId);
      const option = question?.options.find(o => o.value === answer);
      if (option) {
        scores[option.path] += option.points;
      }
    });

    // Return the path with highest score
    return Object.entries(scores).reduce((a, b) => 
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
    )[0] as keyof typeof pathDescriptions;
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const path = calculatePath();
    
    try {
      // Save path to user profile
      const response = await fetch('/api/user/path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path,
          quiz_answers: answers,
          completed_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        router.push(`/onboarding/path-result?path=${path}`);
      } else {
        console.error('Failed to save path');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResult) {
    const path = calculatePath();
    const pathInfo = pathDescriptions[path];

    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${pathInfo.color} text-4xl mb-4`}>
              {pathInfo.icon}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">You are...</h1>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {pathInfo.title}
            </h2>
            <p className="text-gray-300 mt-4 text-lg">
              {pathInfo.description}
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">What&apos;s Next?</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                Personalized lesson queue tailored to your path
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                Starting challenges designed for {pathInfo.title.toLowerCase()}s
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                Starter automations and tools for your journey
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Setting up your path...' : 'Start Your Journey'}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {currentQuestionData.question}
          </h2>

          <div className="space-y-4">
            {currentQuestionData.options.map((option) => (
              <label
                key={option.value}
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  answers[currentQuestionData.id] === option.value
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestionData.id}
                  value={option.value}
                  checked={answers[currentQuestionData.id] === option.value}
                  onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                  className="sr-only"
                />
                <span className="text-white font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center px-6 py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!answers[currentQuestionData.id]}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === quizQuestions.length - 1 ? 'See Results' : 'Next'}
            {currentQuestion < quizQuestions.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
}
