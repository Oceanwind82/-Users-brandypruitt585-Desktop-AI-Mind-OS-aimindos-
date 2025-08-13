'use client';

import React, { useState, useEffect } from 'react';
import { Users, Share2, MessageCircle, Crown, Zap, Eye, Heart, Bookmark, Send, X } from 'lucide-react';

interface CollaborationUser {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'collaborator' | 'viewer';
  isOnline: boolean;
  cursor?: {
    x: number;
    y: number;
    tool: string;
  };
}

interface CollaborationComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  position?: {
    x: number;
    y: number;
  };
  replies: CollaborationComment[];
}

interface CollaborationSession {
  id: string;
  name: string;
  description: string;
  users: CollaborationUser[];
  comments: CollaborationComment[];
  isPublic: boolean;
  createdAt: Date;
  lastActivity: Date;
}

export default function CollaborationLayer() {
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Simulate real-time collaboration data
  useEffect(() => {
    // In production, this would connect to WebSocket for real-time updates
    const mockSession: CollaborationSession = {
      id: 'session_1',
      name: 'AI Content Strategy Brainstorm',
      description: 'Collaborative session for Q4 content planning',
      users: [
        {
          id: 'user_1',
          name: 'Brandy (You)',
          avatar: '👑',
          role: 'owner',
          isOnline: true,
          cursor: { x: 450, y: 300, tool: 'whiteboard' }
        },
        {
          id: 'user_2',
          name: 'Alex Chen',
          avatar: '🎨',
          role: 'collaborator',
          isOnline: true,
          cursor: { x: 200, y: 150, tool: 'writing' }
        },
        {
          id: 'user_3',
          name: 'Maria Santos',
          avatar: '🚀',
          role: 'collaborator',
          isOnline: false
        },
        {
          id: 'user_4',
          name: 'David Kim',
          avatar: '⚡',
          role: 'viewer',
          isOnline: true
        }
      ],
      comments: [
        {
          id: 'comment_1',
          userId: 'user_2',
          userName: 'Alex Chen',
          userAvatar: '🎨',
          content: 'Love the video script ideas! Should we focus more on the TikTok format for Gen Z audience?',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          position: { x: 300, y: 200 },
          replies: [
            {
              id: 'reply_1',
              userId: 'user_1',
              userName: 'Brandy',
              userAvatar: '👑',
              content: 'Absolutely! The intelligence layer is showing 95% engagement for vertical content right now.',
              timestamp: new Date(Date.now() - 1000 * 60 * 10),
              replies: []
            }
          ]
        },
        {
          id: 'comment_2',
          userId: 'user_4',
          userName: 'David Kim',
          userAvatar: '⚡',
          content: 'The whiteboard layout is really clear. Can we add more visual hierarchy to the main concepts?',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          replies: []
        }
      ],
      isPublic: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      lastActivity: new Date()
    };

    setSession(mockSession);
  }, []);

  const handleAddComment = () => {
    if (!newComment.trim() || !session) return;

    const comment: CollaborationComment = {
      id: `comment_${Date.now()}`,
      userId: 'user_1',
      userName: 'Brandy (You)',
      userAvatar: '👑',
      content: newComment,
      timestamp: new Date(),
      replies: []
    };

    setSession({
      ...session,
      comments: [...session.comments, comment],
      lastActivity: new Date()
    });

    setNewComment('');
  };

  const handleShareSession = () => {
    // In production, this would generate a shareable link
    navigator.clipboard.writeText('https://aimindos.com/collaborate/session_1?token=abc123');
    setIsShareModalOpen(false);
  };

  if (!session) return null;

  return (
    <>
      {/* Floating Collaboration Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsCollabOpen(!isCollabOpen)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 relative"
        >
          <Users className="h-6 w-6" />
          {session.users.filter(u => u.isOnline).length > 1 && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {session.users.filter(u => u.isOnline).length}
            </div>
          )}
        </button>
      </div>

      {/* Live User Cursors */}
      {session.users
        .filter(user => user.isOnline && user.cursor && user.id !== 'user_1')
        .map(user => (
          <div
            key={user.id}
            className="fixed pointer-events-none z-40 transition-all duration-100"
            style={{
              left: user.cursor!.x,
              top: user.cursor!.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
              {user.avatar} {user.name.split(' ')[0]}
            </div>
          </div>
        ))}

      {/* Collaboration Panel */}
      {isCollabOpen && (
        <div className="fixed top-0 right-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Collaboration</h3>
              <button
                onClick={() => setIsCollabOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
              <h4 className="font-semibold text-white mb-1">{session.name}</h4>
              <p className="text-gray-300 text-sm">{session.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Share2 className="h-3 w-3" />
                  Share
                </button>
                <button className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Public
                </button>
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="p-6 border-b border-white/10">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Users ({session.users.filter(u => u.isOnline).length})
            </h4>
            <div className="space-y-2">
              {session.users.map(user => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm">
                      {user.avatar}
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <div className="flex items-center gap-2">
                      {user.role === 'owner' && <Crown className="h-3 w-3 text-yellow-400" />}
                      {user.role === 'collaborator' && <Zap className="h-3 w-3 text-blue-400" />}
                      {user.role === 'viewer' && <Eye className="h-3 w-3 text-gray-400" />}
                      <span className="text-xs text-gray-400 capitalize">{user.role}</span>
                    </div>
                  </div>
                  {user.cursor && (
                    <div className="text-xs text-gray-400 bg-slate-800 px-2 py-1 rounded">
                      {user.cursor.tool}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 pb-3">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Comments ({session.comments.length})
              </h4>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-4">
                {session.comments.map(comment => (
                  <div key={comment.id} className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs">
                        {comment.userAvatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-medium">{comment.userName}</span>
                          <span className="text-gray-400 text-xs">
                            {new Date(comment.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{comment.content}</p>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="ml-9 mt-3 space-y-2">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="bg-slate-700/50 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-xs">
                                {reply.userAvatar}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white text-xs font-medium">{reply.userName}</span>
                                  <span className="text-gray-400 text-xs">
                                    {new Date(reply.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-gray-300 text-xs">{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-3 ml-9">
                      <button className="text-gray-400 hover:text-white text-xs flex items-center gap-1 transition-colors">
                        <Heart className="h-3 w-3" />
                        Like
                      </button>
                      <button className="text-gray-400 hover:text-white text-xs flex items-center gap-1 transition-colors">
                        <MessageCircle className="h-3 w-3" />
                        Reply
                      </button>
                      <button className="text-gray-400 hover:text-white text-xs flex items-center gap-1 transition-colors">
                        <Bookmark className="h-3 w-3" />
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Comment */}
            <div className="p-6 pt-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-gray-500 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Share Collaboration Session</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Session Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="https://aimindos.com/collaborate/session_1?token=abc123"
                    readOnly
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <button
                    onClick={handleShareSession}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Permissions</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                  <option>Can collaborate</option>
                  <option>Can view only</option>
                  <option>Can comment only</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="public" className="rounded" />
                <label htmlFor="public" className="text-gray-300 text-sm">Make session public</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShareSession}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
