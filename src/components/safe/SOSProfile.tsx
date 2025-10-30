import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, Users, Clock, MapPin, Award, TrendingUp, Heart, Shield, Search, Car, Zap, Target, Medal, Crown, Gem } from 'lucide-react';
import { useHelperProfile } from '@/hooks/useHelperProfile';
import { useUser } from '@/contexts/UserContext';

export const SOSProfile: React.FC = () => {
  const { user } = useUser();
  const { helperProfile, isLoading } = useHelperProfile(user?.id);

  // Calculate badge and next badge based on completion count
  const getBadgeInfo = (completionCount: number) => {
    if (completionCount >= 100) {
      return { 
        name: 'Diamond Helper', 
        color: 'from-blue-400 via-cyan-500 to-blue-600',
        next: { name: 'Max Level', needed: 0 }
      };
    }
    if (completionCount >= 50) {
      return { 
        name: 'Platinum Helper', 
        color: 'from-slate-300 via-gray-400 to-slate-500',
        next: { name: 'Diamond Helper', needed: 100 }
      };
    }
    if (completionCount >= 25) {
      return { 
        name: 'Gold Helper', 
        color: 'from-amber-400 via-yellow-500 to-orange-500',
        next: { name: 'Platinum Helper', needed: 50 }
      };
    }
    if (completionCount >= 10) {
      return { 
        name: 'Silver Helper', 
        color: 'from-gray-300 via-gray-400 to-gray-500',
        next: { name: 'Gold Helper', needed: 25 }
      };
    }
    return { 
      name: 'Bronze Helper', 
      color: 'from-orange-300 via-orange-400 to-orange-500',
      next: { name: 'Silver Helper', needed: 10 }
    };
  };

  const badgeInfo = getBadgeInfo(helperProfile?.completion_count || 0);
  const currentCount = helperProfile?.completion_count || 0;
  const progressToNext = badgeInfo.next.needed > 0 
    ? Math.min(100, Math.round((currentCount / badgeInfo.next.needed) * 100))
    : 100;
  
  const helperStats = {
    badge: badgeInfo.name,
    badgeColor: badgeInfo.color,
    nextBadge: badgeInfo.next.name,
    progressToNext,
    totalStars: helperProfile?.total_stars || 0,
    peopleHelped: helperProfile?.completion_count || 0,
    responseTime: helperProfile?.average_response_time_minutes ? `${helperProfile.average_response_time_minutes} min` : 'N/A',
    averageRating: helperProfile?.average_rating || 0,
    weeklyStreak: helperProfile?.current_streak_days || 0,
    responseCount: helperProfile?.response_count || 0,
    completionRate: helperProfile?.completion_count > 0 
      ? Math.round((helperProfile.completion_count / helperProfile.response_count) * 100)
      : 0,
  };

  const recentActivity = [
    {
      id: 1,
      action: 'Helped with medical emergency',
      time: '2 hours ago',
      stars: 3,
      location: 'Downtown Plaza',
      type: 'medical',
      icon: Heart
    },
    {
      id: 2,
      action: 'Responded to safety alert',
      time: '1 day ago',
      stars: 2,
      location: 'Park Avenue',
      type: 'safety',
      icon: Shield
    },
    {
      id: 3,
      action: 'Assisted lost person',
      time: '3 days ago',
      stars: 2,
      location: 'Shopping Center',
      type: 'lost',
      icon: Search
    },
    {
      id: 4,
      action: 'Provided traffic accident help',
      time: '1 week ago',
      stars: 3,
      location: 'Main Street',
      type: 'accident',
      icon: Car
    }
  ];

  const getActivityIcon = (type: string) => {
    const icons = {
      medical: '🏥',
      safety: '🛡️',
      lost: '🔍',
      accident: '🚗'
    };
    return icons[type as keyof typeof icons] || '🚨';
  };

  const achievements = [
    { name: 'First Responder', icon: Target, earned: true, color: 'text-blue-600' },
    { name: 'Night Owl Helper', icon: Medal, earned: true, color: 'text-purple-600' },
    { name: 'Community Guardian', icon: Shield, earned: true, color: 'text-green-600' },
    { name: 'Life Saver', icon: Heart, earned: false, color: 'text-red-600' },
    { name: 'Super Helper', icon: Crown, earned: false, color: 'text-yellow-600' },
    { name: 'Emergency Hero', icon: Gem, earned: false, color: 'text-indigo-600' }
  ];

  if (isLoading) {
    return (
      <div className="px-4 space-y-4">
        <Card className="p-6">
          <div className="text-center text-muted-foreground">Loading profile...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-4">
      {/* Helper Badge & Stats */}
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center justify-center h-20 w-20 bg-gradient-to-br ${helperStats.badgeColor} rounded-2xl text-white shadow-xl`}>
            <Trophy className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-800">{helperStats.badge}</h2>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-amber-700 font-medium">{helperStats.averageRating.toFixed(1)}</span>
              <span className="text-amber-600 text-sm">average rating</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-amber-800">{helperStats.totalStars}</div>
              <div className="text-amber-600">Stars</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-amber-800">{helperStats.peopleHelped}</div>
              <div className="text-amber-600">Helped</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-amber-800">{helperStats.responseTime}</div>
              <div className="text-amber-600">Response</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress to Next Badge */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Progress to {helperStats.nextBadge}
            </h3>
            <span className="text-sm text-muted-foreground">{helperStats.progressToNext}%</span>
          </div>
          <Progress value={helperStats.progressToNext} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Help {Math.ceil((100 - helperStats.progressToNext) / 5)} more people to unlock Platinum Helper
          </p>
        </div>
      </Card>

      {/* Statistics */}
      <Card className="p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          Helper Statistics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{helperStats.completionRate}%</div>
            <div className="text-xs text-blue-600">Completion Rate</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{helperStats.weeklyStreak}</div>
            <div className="text-xs text-green-600">Day Streak</div>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Award className="h-4 w-4 text-purple-500" />
          Achievements
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement, index) => {
            const IconComponent = achievement.icon;
            return (
              <div
                key={index}
                className={`text-center p-3 rounded-xl border transition-all ${
                  achievement.earned
                    ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className={`mb-2 flex justify-center ${achievement.earned ? achievement.color : 'text-gray-400'}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className={`text-xs font-medium ${
                  achievement.earned ? 'text-purple-700' : 'text-gray-500'
                }`}>
                  {achievement.name}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm border">
                  <IconComponent className="h-5 w-5 text-gray-600" />
                </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{activity.time}</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{activity.location}</span>
                  </div>
                </div>
              </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-yellow-700">+{activity.stars}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Weekly Challenge */}
      <Card className="p-4 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 border-pink-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Heart className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-pink-800">Weekly Challenge</h3>
            <p className="text-sm text-pink-600">Help 3 more people this week</p>
            <Progress value={60} className="h-2 mt-2" />
          </div>
          <Badge className="bg-pink-500 text-white">2/5</Badge>
        </div>
      </Card>
    </div>
  );
};