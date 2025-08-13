'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Star, MessageCircle, Share2, Heart, Bookmark, Search, Plus, Crown, Zap, Eye } from 'lucide-react';

interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: 'creator' | 'collaborator' | 'member';
  title: string;
  description: string;
  type: 'whiteboard' | 'video' | 'writing' | 'collaboration';
  thumbnail: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: Date;
  trending?: boolean;
  featured?: boolean;
}

interface CommunityUser {
  id: string;
  name: string;
  avatar: string;
  role: 'creator' | 'collaborator' | 'member';
  followers: number;
  following: number;
  posts: number;
  xp: number;
  specialties: string[];
  isVerified: boolean;
}

export default function CommunityHub() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [featuredUsers, setFeaturedUsers] = useState<CommunityUser[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'trending' | 'featured' | 'following'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Mock community data - in production, this would fetch from API
    const mockPosts: CommunityPost[] = [
      {
        id: 'post_1',
        userId: 'user_alex',
        userName: 'Alex Chen',
        userAvatar: '🎨',
        userRole: 'creator',
        title: 'AI-Powered Content Calendar Template',
        description: 'Created a comprehensive content calendar that uses AI trends to suggest optimal posting times and formats. Perfect for creators looking to maximize engagement!',
        type: 'whiteboard',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
        tags: ['Content Strategy', 'AI Tools', 'Social Media', 'Planning'],
        likes: 47,
        comments: 12,
        shares: 8,
        isLiked: false,
        isBookmarked: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        trending: true,
        featured: true
      },
      {
        id: 'post_2',
        userId: 'user_maria',
        userName: 'Maria Santos',
        userAvatar: '🚀',
        userRole: 'creator',
        title: 'Viral TikTok Script Generator',
        description: 'Developed an AI script that analyzes current trends and generates TikTok-ready content. Already helped me hit 100K+ views on 3 videos this week!',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
        tags: ['TikTok', 'Video Scripts', 'Viral Content', 'AI Generation'],
        likes: 89,
        comments: 23,
        shares: 15,
        isLiked: true,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        trending: true
      },
      {
        id: 'post_3',
        userId: 'user_david',
        userName: 'David Kim',
        userAvatar: '⚡',
        userRole: 'collaborator',
        title: 'Personal Brand Storytelling Framework',
        description: 'A step-by-step framework for crafting authentic personal brand stories that resonate. Includes templates and real examples from successful creators.',
        type: 'writing',
        thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
        tags: ['Personal Branding', 'Storytelling', 'Content Creation', 'Authenticity'],
        likes: 34,
        comments: 9,
        shares: 6,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      },
      {
        id: 'post_4',
        userId: 'user_sarah',
        userName: 'Sarah Johnson',
        userAvatar: '💎',
        userRole: 'creator',
        title: 'Cross-Platform Content Amplification Strategy',
        description: 'How I turned one whiteboard concept into 20+ pieces of content across all platforms. Complete breakdown with examples and templates.',
        type: 'collaboration',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        tags: ['Cross-Platform', 'Content Strategy', 'Amplification', 'Efficiency'],
        likes: 67,
        comments: 18,
        shares: 12,
        isLiked: true,
        isBookmarked: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        featured: true
      }
    ];

    const mockUsers: CommunityUser[] = [
      {
        id: 'user_alex',
        name: 'Alex Chen',
        avatar: '🎨',
        role: 'creator',
        followers: 1247,
        following: 89,
        posts: 23,
        xp: 8900,
        specialties: ['Design', 'Strategy', 'AI Tools'],
        isVerified: true
      },
      {
        id: 'user_maria',
        name: 'Maria Santos',
        avatar: '🚀',
        role: 'creator',
        followers: 2891,
        following: 156,
        posts: 41,
        xp: 12400,
        specialties: ['Video Creation', 'TikTok', 'Viral Content'],
        isVerified: true
      },
      {
        id: 'user_sarah',
        name: 'Sarah Johnson',
        avatar: '💎',
        role: 'creator',
        followers: 967,
        following: 234,
        posts: 18,
        xp: 6700,
        specialties: ['Content Strategy', 'Cross-Platform', 'Analytics'],
        isVerified: false
      }
    ];

    setPosts(mockPosts);
    setFeaturedUsers(mockUsers);
  }, []);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    switch (activeFilter) {
      case 'trending':
        return matchesSearch && post.trending;
      case 'featured':
        return matchesSearch && post.featured;
      case 'following':
        return matchesSearch; // In production, filter by following
      default:
        return matchesSearch;
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whiteboard': return '🎨';
      case 'video': return '🎬';
      case 'writing': return '✍️';
      case 'collaboration': return '🤝';
      default: return '📄';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator': return <Crown className="h-3 w-3 text-yellow-400" />;
      case 'collaborator': return <Zap className="h-3 w-3 text-blue-400" />;
      case 'member': return <Eye className="h-3 w-3 text-gray-400" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🌟 Community Hub
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Discover, share, and collaborate with dangerous thinkers worldwide
          </p>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center max-w-2xl mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search posts, creators, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'trending', 'featured', 'following'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as 'all' | 'trending' | 'featured' | 'following')}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    activeFilter === filter
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {filter === 'trending' && <TrendingUp className="h-4 w-4 inline mr-1" />}
                  {filter === 'featured' && <Star className="h-4 w-4 inline mr-1" />}
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Feed */}
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:bg-white/10 transition-colors">
                
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg">
                        {post.userAvatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{post.userName}</h3>
                          {getRoleIcon(post.userRole)}
                          {post.trending && <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">🔥 Trending</div>}
                          {post.featured && <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">⭐ Featured</div>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{getTypeIcon(post.type)} {post.type}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                  <p className="text-gray-300 mb-4">{post.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                        #{tag.replace(' ', '')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Post Thumbnail */}
                <div className="px-6 pb-4">
                  <div 
                    className="w-full h-48 bg-cover bg-center rounded-lg"
                    style={{ backgroundImage: `url(${post.thumbnail})` }}
                  />
                </div>

                {/* Post Actions */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          post.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      
                      <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      
                      <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors">
                        <Share2 className="h-5 w-5" />
                        <span className="text-sm">{post.shares}</span>
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`transition-colors ${
                        post.isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                      }`}
                    >
                      <Bookmark className={`h-5 w-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Featured Creators */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Featured Creators
              </h3>
              <div className="space-y-4">
                {featuredUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white text-sm">{user.name}</h4>
                        {getRoleIcon(user.role)}
                        {user.isVerified && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{user.followers.toLocaleString()} followers</span>
                        <span>•</span>
                        <span>{user.xp.toLocaleString()} XP</span>
                      </div>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded-lg transition-colors">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Active Creators</span>
                  <span className="text-white font-semibold">2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Posts Today</span>
                  <span className="text-white font-semibold">127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Collaborations</span>
                  <span className="text-white font-semibold">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Trending Now</span>
                  <span className="text-purple-400 font-semibold">AI Video</span>
                </div>
              </div>
            </div>

            {/* Create Post CTA */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">Share Your Creation</h3>
              <p className="text-gray-300 text-sm mb-4">
                Show the community what you&apos;ve built with AI Mind OS
              </p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Create Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
