'use client';

import { useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIResponse {
  message: string;
  suggestions?: string[];
  recommended_lessons?: string[];
  insights?: string[];
  motivation?: string;
  study_plan?: {
    today: string[];
    this_week: string[];
    next_steps: string[];
  };
}

export default function AIAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hey there! 👋 I'm your AI Learning Assistant - your personal study buddy who's always here to help (no video calls required! 😊). What would you like to explore today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user_123', // You'd get this from auth
          message: inputMessage
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const aiResponse: AIResponse = data.response;
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiResponse.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

        // Add suggestions as quick buttons
        if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
          const suggestionsMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: `Quick suggestions: ${aiResponse.suggestions.join(' • ')}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, suggestionsMessage]);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "Sorry, I'm having trouble connecting right now. Try asking me again! 🤖",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickMessages = [
    "What should I learn next?",
    "How am I doing with my lessons?",
    "Show me my learning insights",
    "Help me plan my study schedule",
    "Give me some motivation!",
    "I'm stuck on a concept - help!"
  ];

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '24px' }}>🤖 AI Learning Assistant</h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          Your personal study buddy - no video calls, just pure AI-powered learning support
        </p>
      </div>

      {/* Quick Message Buttons */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {quickMessages.map((msg, idx) => (
          <button
            key={idx}
            onClick={() => setInputMessage(msg)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              background: '#f8f9fa',
              color: '#666',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#e9ecef';
              e.currentTarget.style.borderColor = '#007bff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.borderColor = '#ddd';
            }}
          >
            {msg}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        height: '400px',
        overflowY: 'auto',
        padding: '20px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '18px',
              background: message.type === 'user' 
                ? 'linear-gradient(135deg, #007bff, #0056b3)'
                : '#f8f9fa',
              color: message.type === 'user' ? '#fff' : '#333',
              fontSize: '14px',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap'
            }}>
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '15px'
          }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px',
              background: '#f8f9fa',
              color: '#666',
              fontSize: '14px'
            }}>
              🤖 Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #eee',
        background: '#f8f9fa'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your AI learning journey..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              minHeight: '44px',
              maxHeight: '100px'
            }}
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            style={{
              padding: '12px 20px',
              background: inputMessage.trim() && !isLoading 
                ? 'linear-gradient(135deg, #007bff, #0056b3)'
                : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            Send
          </button>
        </div>
        <p style={{
          margin: '8px 0 0',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          Press Enter to send • Perfect for introverts - no human interaction required! 😊
        </p>
      </div>
    </div>
  );
}
