'use client';

import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { suggestOptimalTimeslots } from '@/app/actions';
import { useTimetable } from '@/hooks/use-timetable';
import { useToast } from '@/hooks/use-toast';

type AiSuggestionToolProps = {
  formValues: {
    start_time: string;
    end_time: string;
  };
};

export function AiSuggestionTool({ formValues }: AiSuggestionToolProps) {
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ suggestedTimeslots: string; reasoning: string } | null>(null);
  const { entries } = useTimetable();
  const { toast } = useToast();

  const handleSuggestion = async () => {
    setLoading(true);
    setResult(null);

    const start = new Date(`1970-01-01T${formValues.start_time}:00`);
    const end = new Date(`1970-01-01T${formValues.end_time}:00`);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const res = await suggestOptimalTimeslots({
      pastSchedulingData: JSON.stringify(entries),
      userPreferences: preferences || 'No specific preferences.',
      eventDuration: `${durationMinutes} minutes`,
    });

    if (res.success && res.data) {
      setResult(res.data);
    } else {
      toast({
        title: 'AI Suggestion Error',
        description: res.error,
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          <span>AI Schedule Assistant</span>
        </CardTitle>
        <CardDescription>
          Let AI suggest the best time for this event based on your schedule.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="preferences">Your Preferences</Label>
          <Textarea
            id="preferences"
            placeholder="e.g., I prefer mornings, avoid Fridays..."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          />
        </div>
        <Button onClick={handleSuggestion} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Suggest Times
        </Button>
        {result && (
          <Card className="bg-card">
            <CardHeader>
                <CardTitle className="text-lg">Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p className="font-semibold">Optimal Timeslots:</p>
                <p className="text-muted-foreground bg-primary/10 p-2 rounded-md">{result.suggestedTimeslots}</p>
                <p className="font-semibold pt-2">Reasoning:</p>
                <p className="text-muted-foreground">{result.reasoning}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
