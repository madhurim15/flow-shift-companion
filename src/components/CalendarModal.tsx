import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  description?: string;
}

const CalendarModal = () => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      checkGoogleCalendarConnection();
    }
  }, [open, user]);

  const checkGoogleCalendarConnection = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('google-calendar-status');
      if (!error && data?.connected) {
        setIsConnected(true);
        fetchEvents();
      }
    } catch (error) {
      console.log('Google Calendar not yet connected');
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('google-calendar-connect');
      if (error) throw error;
      
      if (data?.authUrl) {
        window.open(data.authUrl, 'google-calendar-auth', 'width=500,height=600');
        // Listen for auth completion
        window.addEventListener('message', handleAuthComplete);
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Google Calendar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthComplete = (event: MessageEvent) => {
    if (event.data?.type === 'google-calendar-auth-success') {
      setIsConnected(true);
      fetchEvents();
      toast({
        title: "Connected!",
        description: "Successfully connected to Google Calendar."
      });
      window.removeEventListener('message', handleAuthComplete);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const { data, error } = await supabase.functions.invoke('google-calendar-events', {
        body: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      if (error) throw error;
      setEvents(data?.events || []);
    } catch (error) {
      toast({
        title: "Failed to fetch events",
        description: "Could not load calendar events. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (title: string, description?: string) => {
    try {
      const startTime = new Date(selectedDate);
      startTime.setHours(new Date().getHours() + 1);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      const { error } = await supabase.functions.invoke('google-calendar-create-event', {
        body: {
          summary: title,
          description,
          start: startTime.toISOString(),
          end: endTime.toISOString()
        }
      });

      if (error) throw error;
      
      fetchEvents(); // Refresh events
      toast({
        title: "Event created!",
        description: `"${title}" has been added to your calendar.`
      });
    } catch (error) {
      toast({
        title: "Failed to create event",
        description: "Could not create calendar event. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchEvents();
    }
  }, [selectedDate, isConnected]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gentle-hover">
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Calendar</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 overflow-hidden">
          {/* Calendar Picker */}
          <div className="flex-shrink-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border pointer-events-auto"
            />
          </div>

          {/* Events Panel */}
          <div className="flex-1 space-y-4 overflow-y-auto">
            {!isConnected ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Connect Google Calendar
                  </CardTitle>
                  <CardDescription>
                    Connect your Google Calendar to view and create events directly from FlowFocus.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={connectGoogleCalendar} 
                    disabled={loading}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {loading ? 'Connecting...' : 'Connect Google Calendar'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    Events for {selectedDate.toLocaleDateString()}
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => createEvent(`FlowFocus Session - ${new Date().toLocaleDateString()}`)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Event
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center text-muted-foreground py-4">
                    Loading events...
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No events for this day
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events.map((event) => (
                      <Card key={event.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{event.summary}</h4>
                            {event.description && (
                              <p className="text-sm text-muted-foreground">
                                {event.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarModal;