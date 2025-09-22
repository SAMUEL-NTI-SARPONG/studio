
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Clipboard, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const appDescription = `
Welcome to Legend: Your Collaborative Timetable

Legend is a modern, real-time scheduling application designed to help you and your team organize your time seamlessly. Think of it as a digital whiteboard for your week, but smarter. Everyone can see the same schedule, add events, and see changes happen instantly. It even works when you're offline, so you never have to worry about losing your changes.

Core Features and How to Use Them

1. The Main Timetable View

This is your mission control. The screen is organized into a simple grid:
- Days of the Week: At the top, you can switch between Sunday and Saturday. The app will automatically open to the current day.
- Hourly Grid: The main part of the screen is a vertical timeline divided into hours. This is where your events live.
- Current Time Indicator: A thin red line moves down the grid throughout the day, giving you an at-a-glance view of the current time.

2. Creating and Managing Events

Events are the heart of your timetable. They can be for everyone ("General") or just for you ("Personal").

- Adding an Event:
  - Click the big plus (+) button at the bottom-right corner of the screen.
  - A window will pop up allowing you to create a new event. You can set the Title, add a Description, and choose a Start and End Time.
  - You can designate the event as "General" (visible to everyone) or "Personal" (linked to your account).

- Editing and Deleting Events:
  - To edit or delete an event you created, simply click on it. A window will appear with all the event details, allowing you to make changes or use the "Delete" button.
  - You cannot edit or delete events created by other people or "General" events you didn't create.

- Viewing Event Details (The Popover):
  - Clicking on any event will open a small pop-up window (a "popover") with more information.
  - This window shows you the event's full title, time, and description. It also shows who created the event and who is "Engaged" with it.

3. Collaboration and User Identity

Legend is built for teams.

- Online Users: In the header, you can see the avatars of other users who are currently online, letting you know who you're collaborating with in real-time.

- Personal Colors:
  - To make it easy to see who's doing what, each user has a unique color for their personal events.
  - You can set your own name and color by clicking your profile avatar (the circle with your initial in the top-right corner) and selecting "Profile".
  - When you change your color, all of your past and future personal events will instantly update for everyone to see.

- Engaging with Events:
  - See an event you're involved in? Click on it and hit the "Engage" button. Your avatar will appear on the event, letting others know you're participating. You can click "Engaged" again to disengage.

4. Powerful Time-Saving Tools

- Filter View:
  - In the top-right header, there's a toggle switch. Activating it filters the timetable to only show hours that have events, hiding all the empty time slots. This is great for getting a quick, compact overview of a busy day.

- Copy Schedule:
  - Have a day with a recurring schedule? Instead of re-creating it, click the Copy icon (looks like two overlapping pages) in the header.
  - This lets you copy all the events from the current day to any other day (or multiple days) of the week in a single click.

- Clear Schedule:
  - Need to start fresh? Click your profile avatar and find the "Clear Schedule" section.
  - You can choose to delete just your personal events or the general events, and you can clear them for just the current day or for all days at once.

5. Always-On Functionality

- Real-Time Updates: When you and others are online, any changes made by one person are instantly visible to everyone else without needing to refresh the page.

- Offline Mode:
  - If your internet connection drops, the app will notify you that you're offline.
  - You can continue to add, edit, and delete events as normal. Your changes are saved securely in your browser.
  - When you reconnect, the app automatically syncs all the changes you made while offline to the server, ensuring your schedule is up-to-date.
`.trim();

export default function GuidePage() {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(appDescription).then(() => {
      setHasCopied(true);
      toast({
        title: 'Copied to Clipboard!',
        description: 'The application guide has been copied.',
        variant: 'achievement',
      });
      setTimeout(() => setHasCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
       toast({
        title: 'Error',
        description: 'Could not copy text to clipboard.',
        variant: 'destructive',
      });
    });
  };

  const handleDownload = () => {
    const blob = new Blob([appDescription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legend-app-guide.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
     toast({
        title: 'Download Started',
        description: 'The guide is being downloaded as a .txt file.',
      });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl">Application Guide</CardTitle>
                <CardDescription className="mt-1">
                  A complete overview of all features in the Legend application.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleCopy}>
                  {hasCopied ? <Check className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
                  {hasCopied ? 'Copied!' : 'Copy'}
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap font-sans">
            {appDescription}
          </div>
        </CardContent>
      </Card>
      <style jsx>{`
        .prose {
            line-height: 1.6;
        }
        .prose h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        .prose ul {
            padding-left: 1.5em;
            list-style-type: disc;
        }
        .prose li {
            margin-bottom: 0.5em;
        }
        .prose strong {
            font-weight: 600;
        }
      `}</style>
    </div>
  );
}
