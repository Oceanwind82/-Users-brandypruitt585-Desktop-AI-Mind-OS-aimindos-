#!/usr/bin/env node

/**
 * Test script for AI Learning Assistant
 * Demonstrates all the introvert-friendly features
 */

const API_URL = 'http://localhost:3000/api/ai-assistant';

async function testAIAssistant() {
  console.log('🤖 Testing AI Personal Learning Assistant...\n');

  const testCases = [
    {
      user: 'intro_user_1',
      message: 'What should I learn next?',
      description: '📚 Getting personalized recommendations'
    },
    {
      user: 'advanced_user',
      message: 'How am I doing with my lessons?',
      description: '📊 Checking progress report'
    },
    {
      user: 'struggling_user',
      message: 'I\'m stuck on machine learning concepts and feeling confused',
      description: '🆘 Getting help without pressure'
    },
    {
      user: 'planning_user',
      message: 'Help me plan my study schedule for this week',
      description: '📅 Creating custom study plan'
    },
    {
      user: 'motivated_user',
      message: 'I need some motivation to keep going',
      description: '💪 Getting encouragement'
    },
    {
      user: 'insights_user',
      message: 'Show me my learning insights and patterns',
      description: '🔍 Analyzing learning patterns'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${testCase.description}`);
    console.log(`User: "${testCase.message}"`);
    console.log(`${'='.repeat(60)}`);

    try {
      const url = `${API_URL}?user_id=${testCase.user}&message=${encodeURIComponent(testCase.message)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        const ai = data.response;
        
        console.log(`\n🤖 AI Response:`);
        console.log(ai.message);

        if (ai.recommended_lessons) {
          console.log(`\n📚 Recommended Lessons:`);
          ai.recommended_lessons.forEach((lesson, i) => {
            console.log(`  ${i + 1}. ${lesson}`);
          });
        }

        if (ai.insights) {
          console.log(`\n💡 Insights:`);
          ai.insights.forEach((insight) => {
            console.log(`  • ${insight}`);
          });
        }

        if (ai.study_plan) {
          console.log(`\n📅 Study Plan:`);
          console.log(`  Today: ${ai.study_plan.today.join(', ')}`);
          console.log(`  This Week: ${ai.study_plan.this_week.join(', ')}`);
          console.log(`  Next Steps: ${ai.study_plan.next_steps.join(', ')}`);
        }

        if (ai.motivation) {
          console.log(`\n🌟 Motivation:`);
          console.log(`  ${ai.motivation}`);
        }

        if (ai.suggestions) {
          console.log(`\n💬 Quick Suggestions:`);
          ai.suggestions.forEach((suggestion, i) => {
            console.log(`  ${i + 1}. "${suggestion}"`);
          });
        }

      } else {
        console.log(`❌ Error: ${data.error}`);
      }

    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }

    // Brief pause between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ AI Learning Assistant Test Complete!');
  console.log('');
  console.log('🎯 Perfect for Introverts:');
  console.log('  • No video calls or human interaction required');
  console.log('  • Available 24/7 for text-based support');
  console.log('  • Personalized insights based on amazingness scores');
  console.log('  • Custom study plans and recommendations');
  console.log('  • Encouragement and motivation on demand');
  console.log('  • Smart analysis of learning patterns');
  console.log('');
  console.log('🚀 Visit: http://localhost:3000/ai-assistant');
  console.log(`${'='.repeat(60)}\n`);
}

// Run the test
testAIAssistant().catch(console.error);
