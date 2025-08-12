'use client';
import { useState, useEffect, useCallback } from 'react';
import { Users, Gift, Copy, Check, Trophy, Coins } from 'lucide-react';

interface Referral {
  id: string;
  referred_email: string;
  status: 'pending' | 'completed' | 'cancelled';
  reward_claimed: boolean;
  created_at: string;
  completed_at?: string;
}

interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_rewards_earned: number;
  unclaimed_rewards: number;
}

export default function ReferralDashboard() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    successful_referrals: 0,
    pending_referrals: 0,
    total_rewards_earned: 0,
    unclaimed_rewards: 0
  });
  const [referralCode, setReferralCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReferralData = useCallback(async () => {
    try {
      // Fetch referral data from API
      const [referralsRes, statsRes, codeRes] = await Promise.all([
        fetch('/api/referrals'),
        fetch('/api/referrals/stats'),
        fetch('/api/referrals/code')
      ]);

      if (referralsRes.ok) {
        const referralsData = await referralsRes.json();
        setReferrals(referralsData.referrals || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || stats);
      }

      if (codeRes.ok) {
        const codeData = await codeRes.json();
        setReferralCode(codeData.code || 'INVITE123');
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  };

  const claimReward = async (referralId: string) => {
    try {
      const response = await fetch(`/api/referrals/${referralId}/claim`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchReferralData(); // Refresh data
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="text-blue-400" size={24} />
          <h2 className="text-xl font-bold text-white">Referral Program</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Gift size={16} />
          <span>Earn 50 XP per successful referral</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.total_referrals}</div>
          <div className="text-sm text-gray-300">Total Referrals</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{stats.successful_referrals}</div>
          <div className="text-sm text-gray-300">Successful</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.pending_referrals}</div>
          <div className="text-sm text-gray-300">Pending</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">{stats.total_rewards_earned}</div>
          <div className="text-sm text-gray-300">XP Earned</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-400">{stats.unclaimed_rewards}</div>
          <div className="text-sm text-gray-300">Unclaimed XP</div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Your Referral Link</h3>
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-700 rounded-lg p-3 font-mono text-sm text-gray-300">
            {`${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${referralCode}`}
          </div>
          <button
            onClick={copyReferralLink}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Share this link with friends to earn 50 XP when they sign up and complete their first lesson!
        </p>
      </div>

      {/* Referrals List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Your Referrals</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No referrals yet. Share your link to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{referral.referred_email}</div>
                    <div className="text-sm text-gray-400">
                      Referred on {new Date(referral.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(referral.status)}`}>
                    {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                  </span>

                  {referral.status === 'completed' && !referral.reward_claimed && (
                    <button
                      onClick={() => claimReward(referral.id)}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      <Coins size={14} />
                      <span>Claim 50 XP</span>
                    </button>
                  )}

                  {referral.reward_claimed && (
                    <div className="flex items-center space-x-2 text-green-400 text-sm">
                      <Trophy size={14} />
                      <span>Claimed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
