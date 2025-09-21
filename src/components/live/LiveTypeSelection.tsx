import React from 'react';
import { Globe, Users, ArrowRight } from 'lucide-react';
import { mockCircles } from '@/data/circles';

interface LiveTypeSelectionProps {
  onTypeSelect: (type: 'random' | 'circle', circleId?: string, circleName?: string) => void;
}

const LiveTypeSelection: React.FC<LiveTypeSelectionProps> = ({ onTypeSelect }) => {
  const joinedCircles = mockCircles.filter(circle => circle.isJoined);

  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-1">Choose Live Type</h3>
        <p className="text-muted-foreground text-xs">
          Select where you want to broadcast
        </p>
      </div>

      <div className="space-y-3">
        {/* Random Live */}
        <button
          onClick={() => onTypeSelect('random')}
          className="w-full p-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-lg hover:bg-white/20 transition-all group text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-full flex items-center justify-center border border-blue-400/20">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-foreground text-sm">Random Live</h4>
                <p className="text-xs text-muted-foreground">
                  Broadcast to feed, relax & stories
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </button>

        {/* Circle Live */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground text-sm">Circle Live</h4>
            <span className="text-xs text-muted-foreground">
              {joinedCircles.length} available
            </span>
          </div>
          
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {joinedCircles.length > 0 ? (
              joinedCircles.map((circle) => (
                <button
                  key={circle.id}
                  onClick={() => onTypeSelect('circle', circle.id, circle.name)}
                  className="w-full p-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-lg hover:bg-white/20 transition-all group text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-full flex items-center justify-center border border-purple-400/20">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground text-xs">{circle.name}</h5>
                        <p className="text-xs text-muted-foreground">
                          {circle.members.toLocaleString()} members
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg">
                <div className="text-muted-foreground text-xs">
                  No circles available
                </div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  Join circles to go live in them
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTypeSelection;