
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ConnectionStatus() {
  const supabase = createClient();
  const [status, setStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'>('CONNECTED');

  useEffect(() => {
    const channel = supabase.channel('connection-status-channel');
    
    const handleOpen = () => setStatus('CONNECTED');
    const handleClose = () => setStatus('DISCONNECTED');
    const handleError = () => setStatus('RECONNECTING');

    channel
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {})
      .subscribe((status, err) => {
        if(status === 'SUBSCRIBED') {
          handleOpen();
        } else if (status === 'CHANNEL_ERROR') {
          handleError();
        } else if(status === 'TIMED_OUT') {
           handleClose();
        }
      });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const statusInfo = {
    CONNECTED: { color: 'bg-green-500', text: 'Real-time connection active' },
    DISCONNECTED: { color: 'bg-red-500', text: 'Disconnected, attempting to reconnect...' },
    RECONNECTING: { color: 'bg-yellow-500', text: 'Reconnecting...' },
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={cn(
              'h-3 w-3 rounded-full transition-colors',
              statusInfo[status].color
            )}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusInfo[status].text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
