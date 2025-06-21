
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Coffee, Focus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  startPomodoroSession, 
  completePomodoroSession, 
  interruptPomodoroSession,
  formatTime,
  getRandomMessage,
  focusMessages,
  breakMessages,
  FOCUS_DURATION,
  BREAK_DURATION,
  type PomodoroSession
} from '@/utils/pomodoroUtils';

type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'focus' | 'break';

const PomodoroTimer = () => {
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Update message when session type changes
    updateMessage();
  }, [sessionType]);

  useEffect(() => {
    // Set up exit prevention when timer is running
    if (timerState === 'running') {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "Leaving now won't help—you can stop after this tiny win";
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [timerState]);

  const updateMessage = () => {
    const messages = sessionType === 'focus' ? focusMessages : breakMessages;
    setCurrentMessage(getRandomMessage(messages));
  };

  const startTimer = async () => {
    try {
      if (timerState === 'idle') {
        // Start new session
        const session = await startPomodoroSession(sessionType);
        setCurrentSession(session);
        setStartTime(new Date());
      }
      
      setTimerState('running');
      updateMessage();
      
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: sessionType === 'focus' ? "Focus session started 🎯" : "Break time! ☕",
        description: currentMessage
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: "Couldn't start session",
        description: "Please try again in a moment",
        variant: "destructive"
      });
    }
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState('paused');
  };

  const resetTimer = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Log interruption if session was active
    if (currentSession && startTime) {
      const actualDuration = Math.floor((Date.now() - startTime.getTime()) / 1000);
      try {
        await interruptPomodoroSession(currentSession.id!, actualDuration, 'manually_reset');
      } catch (error) {
        console.error('Error logging interruption:', error);
      }
    }

    setTimerState('idle');
    setTimeLeft(sessionType === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
    setCurrentSession(null);
    setStartTime(null);
    updateMessage();
  };

  const handleTimerComplete = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Log completion
    if (currentSession && startTime) {
      const actualDuration = Math.floor((Date.now() - startTime.getTime()) / 1000);
      try {
        await completePomodoroSession(currentSession.id!, actualDuration);
      } catch (error) {
        console.error('Error logging completion:', error);
      }
    }

    setTimerState('idle');
    
    if (sessionType === 'focus') {
      toast({
        title: "Focus session complete! 🌟",
        description: "Amazing work! Ready for a 5-minute break?",
      });
      setSessionType('break');
      setTimeLeft(BREAK_DURATION);
    } else {
      toast({
        title: "Break complete! ✨",
        description: "Feeling refreshed? Ready for another focus session?",
      });
      setSessionType('focus');
      setTimeLeft(FOCUS_DURATION);
    }

    setCurrentSession(null);
    setStartTime(null);
    updateMessage();
  };

  const switchSessionType = (type: SessionType) => {
    if (timerState !== 'idle') {
      resetTimer();
    }
    setSessionType(type);
    setTimeLeft(type === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
    updateMessage();
  };

  const progress = sessionType === 'focus' 
    ? ((FOCUS_DURATION - timeLeft) / FOCUS_DURATION) * 100
    : ((BREAK_DURATION - timeLeft) / BREAK_DURATION) * 100;

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <Card className="p-8 text-center space-y-6">
        {/* Session Type Selector */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={sessionType === 'focus' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => switchSessionType('focus')}
            disabled={timerState === 'running'}
            className="flex-1 flex items-center gap-2"
          >
            <Focus className="h-4 w-4" />
            Focus
          </Button>
          <Button
            variant={sessionType === 'break' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => switchSessionType('break')}
            disabled={timerState === 'running'}
            className="flex-1 flex items-center gap-2"
          >
            <Coffee className="h-4 w-4" />
            Break
          </Button>
        </div>

        {/* Timer Display */}
        <div className="space-y-4">
          <div className="relative">
            <div className="text-6xl font-mono font-light">
              {formatTime(timeLeft)}
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  sessionType === 'focus' ? 'bg-primary' : 'bg-green-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground min-h-[2.5rem] flex items-center justify-center">
            {currentMessage}
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex gap-3 justify-center">
          {timerState === 'idle' && (
            <Button
              onClick={startTimer}
              size="lg"
              className="flex items-center gap-2"
            >
              <Play className="h-5 w-5" />
              Start {sessionType === 'focus' ? 'Focus' : 'Break'}
            </Button>
          )}

          {timerState === 'running' && (
            <Button
              onClick={pauseTimer}
              size="lg"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pause className="h-5 w-5" />
              Pause
            </Button>
          )}

          {timerState === 'paused' && (
            <Button
              onClick={startTimer}
              size="lg"
              className="flex items-center gap-2"
            >
              <Play className="h-5 w-5" />
              Resume
            </Button>
          )}

          {timerState !== 'idle' && (
            <Button
              onClick={resetTimer}
              size="lg"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Encouraging Note */}
      <Card className="p-4 bg-flow-gentle/10 border-flow-gentle/20">
        <p className="text-sm text-center text-muted-foreground">
          {sessionType === 'focus' 
            ? "Every minute of focused attention is building something meaningful ✨"
            : "Rest is productive too - you're recharging beautifully 🌸"
          }
        </p>
      </Card>
    </div>
  );
};

export default PomodoroTimer;
