
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/contexts/user-context';
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Presence = {
  user_id: string;
  name: string;
  avatar_url: string;
};

export function UserPresence() {
  const { user } = useUser();
  const supabase = createClient();
  const [presentUsers, setPresentUsers] = useState<Presence[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = channel;

    const handleSync = () => {
      const state: RealtimePresenceState<Presence> = channel.presenceState();
      const users: Presence[] = Object.values(state)
        .map((node: any) => node[0])
        .filter(p => p.user_id !== user.id); // Exclude self
      setPresentUsers(users);
    };

    channel
      .on('presence', { event: 'sync' }, handleSync)
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setPresentUsers(prev => {
          const newUsers = newPresences
            .filter(p => p.user_id !== user.id && !prev.some(u => u.user_id === p.user_id))
            .map(p => p as Presence);
          return [...prev, ...newUsers];
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setPresentUsers(prev => prev.filter(p => !leftPresences.some(l => l.user_id === p.user_id)));
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          name: user.name,
          avatar_url: user.avatarUrl,
        });
      }
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, supabase]);

  if (!user || presentUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center pl-4 border-l border-border">
      <TooltipProvider>
        <div className="flex -space-x-3">
          {presentUsers.slice(0, 3).map((p) => (
            <Tooltip key={p.user_id}>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-card hover:z-10 transition-transform hover:scale-110">
                  <AvatarImage src={p.avatar_url} alt={p.name} />
                  <AvatarFallback>{p.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{p.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {presentUsers.length > 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border-2 border-card">
                  +{presentUsers.length - 3}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{presentUsers.slice(3).map(p => p.name).join(', ')}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
