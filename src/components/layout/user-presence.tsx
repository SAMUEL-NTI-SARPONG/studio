
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/contexts/user-context';
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';

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

  const getPresenceText = () => {
    const count = presentUsers.length;
    if (count === 1) {
      return `${presentUsers[0].name} is online`;
    }
    if (count > 1) {
      return `${count} users online`;
    }
    return null;
  };

  const text = getPresenceText();
  if (!text) return null;

  return (
    <div className="flex items-center text-xs text-muted-foreground">
      <span className="relative flex h-2 w-2 mr-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span>{text}</span>
    </div>
  );
}
