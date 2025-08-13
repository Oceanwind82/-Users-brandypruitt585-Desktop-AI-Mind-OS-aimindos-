import { NextRequest, NextResponse } from 'next/server';
import { AITopicLessonGenerator } from '@/lib/ai-topic-generator';
import { AI_CURRICULUM } from '@/lib/ai-curriculum';
import { notify } from '@/lib/notify';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'topics') {
      // Return all available AI topics
      const allTopics = AITopicLessonGenerator.getAllAvailableTopics();
      
      return NextResponse.json({
        success: true,
        total_topics: allTopics.length,
        topics: allTopics,
        curriculum_overview: {
          total_areas: Object.keys(AI_CURRICULUM).length - 1, // exclude metadata
          estimated_duration: AI_CURRICULUM.metadata.estimated_duration,
          coverage_areas: AI_CURRICULUM.metadata.coverage_areas
        }
      });
    }

    if (action === 'search') {
      const keyword = searchParams.get('keyword');
      if (!keyword) {
        return NextResponse.json(
          { error: 'Keyword parameter is required for search' },
          { status: 400 }
        );
      }

      const matchingTopics = AITopicLessonGenerator.searchTopics(keyword);
      
      return NextResponse.json({
        success: true,
        keyword,
        matches_found: matchingTopics.length,
        topics: matchingTopics
      });
    }

    if (action === 'curriculum') {
      // Return complete curriculum structure
      return NextResponse.json({
        success: true,
        curriculum: AI_CURRICULUM,
        total_topics: AI_CURRICULUM.metadata.total_topics,
        coverage_areas: AI_CURRICULUM.metadata.coverage_areas
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: topics, search, or curriculum' },
      { status: 400 }
    );

  } catch (error) {
    console.error('AI topics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, topic, user_preferences } = body;

    if (action === 'generate_lesson') {
      if (!topic) {
        return NextResponse.json(
          { error: 'Topic is required for lesson generation' },
          { status: 400 }
        );
      }

      // Generate comprehensive lesson for the requested topic
      const lesson = AITopicLessonGenerator.generateLessonForTopic(topic, user_preferences);
      
      // Send notification about lesson generation
      await notify(`📚 AI LESSON GENERATED!\n` +
        `🎯 Topic: ${topic}\n` +
        `⭐ Difficulty: ${lesson.difficulty_level}/4\n` +
        `⏱️ Duration: ${lesson.estimated_time} minutes\n` +
        `📝 Key Concepts: ${lesson.content.key_concepts.length}\n` +
        `💡 Practical Examples: ${lesson.content.practical_examples.length}\n` +
        `🌟 AI education at its finest!`);

      return NextResponse.json({
        success: true,
        lesson,
        generation_info: {
          topic_requested: topic,
          user_level: user_preferences?.user_level || 'intermediate',
          focus_area: user_preferences?.focus_area || 'practical',
          estimated_completion: lesson.estimated_time
        }
      });
    }

    if (action === 'generate_learning_path') {
      const { user_goals, time_frame, user_level } = body;
      
      if (!user_goals || !Array.isArray(user_goals)) {
        return NextResponse.json(
          { error: 'user_goals array is required for learning path generation' },
          { status: 400 }
        );
      }

      // Generate personalized learning path
      const learningPath = AITopicLessonGenerator.generateLearningPath(
        user_goals,
        time_frame || 12,
        user_level || 'intermediate'
      );

      // Calculate total learning time
      const totalTime = learningPath.reduce((sum, lesson) => sum + lesson.estimated_time, 0);
      const totalHours = Math.round(totalTime / 60 * 10) / 10;

      // Send notification about learning path creation
      await notify(`🎓 AI LEARNING PATH CREATED!\n` +
        `👤 Goals: ${user_goals.join(', ')}\n` +
        `📚 Total Lessons: ${learningPath.length}\n` +
        `⏱️ Total Time: ${totalHours} hours\n` +
        `📈 Level: ${user_level || 'intermediate'}\n` +
        `🚀 Your AI mastery journey begins!`);

      return NextResponse.json({
        success: true,
        learning_path: learningPath,
        path_summary: {
          total_lessons: learningPath.length,
          total_hours: totalHours,
          estimated_weeks: Math.ceil(totalHours / 10), // Assuming 10 hours per week
          user_goals,
          user_level: user_level || 'intermediate'
        },
        recommended_schedule: generateStudySchedule(learningPath, time_frame || 12)
      });
    }

    if (action === 'batch_generate') {
      const { topics, user_preferences } = body;
      
      if (!topics || !Array.isArray(topics)) {
        return NextResponse.json(
          { error: 'topics array is required for batch generation' },
          { status: 400 }
        );
      }

      // Generate lessons for multiple topics
      const lessons = topics.map(topic => 
        AITopicLessonGenerator.generateLessonForTopic(topic, user_preferences)
      );

      const totalTime = lessons.reduce((sum, lesson) => sum + lesson.estimated_time, 0);

      await notify(`📚 BATCH AI LESSONS GENERATED!\n` +
        `📝 Topics: ${topics.length}\n` +
        `⏱️ Total Duration: ${Math.round(totalTime / 60)} hours\n` +
        `🎯 Ready for comprehensive AI learning!`);

      return NextResponse.json({
        success: true,
        lessons,
        batch_info: {
          topics_processed: topics.length,
          total_estimated_time: totalTime,
          average_lesson_time: Math.round(totalTime / topics.length),
          difficulty_range: getDifficultyRange(lessons)
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: generate_lesson, generate_learning_path, or batch_generate' },
      { status: 400 }
    );

  } catch (error) {
    console.error('AI lesson generation error:', error);
    
    // Send error notification
    await notify(`🔥 AI Lesson Generation Error\n` +
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
      `Timestamp: ${new Date().toISOString()}`);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateStudySchedule(lessons: { title: string; estimated_time: number; category: string }[], weeks: number) {
  const lessonsPerWeek = Math.ceil(lessons.length / weeks);
  const schedule = [];
  
  for (let week = 1; week <= weeks; week++) {
    const startIndex = (week - 1) * lessonsPerWeek;
    const endIndex = Math.min(startIndex + lessonsPerWeek, lessons.length);
    const weekLessons = lessons.slice(startIndex, endIndex);
    
    if (weekLessons.length > 0) {
      schedule.push({
        week,
        lessons: weekLessons.map(lesson => ({
          title: lesson.title,
          category: lesson.category,
          estimated_time: lesson.estimated_time
        })),
        total_time: weekLessons.reduce((sum, lesson) => sum + lesson.estimated_time, 0)
      });
    }
  }
  
  return schedule;
}

function getDifficultyRange(lessons: { difficulty_level: number }[]) {
  const difficulties = lessons.map(lesson => lesson.difficulty_level);
  return {
    min: Math.min(...difficulties),
    max: Math.max(...difficulties),
    average: Math.round(difficulties.reduce((sum, diff) => sum + diff, 0) / difficulties.length * 10) / 10
  };
}
