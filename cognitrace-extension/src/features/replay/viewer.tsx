import { useEffect, useRef, useState } from "react";
import type { InputEvent } from "~types";
import { Play, Pause, FastForward, RotateCcw } from "lucide-react";

interface ReplayProps {
  events: InputEvent[];
}

export function ReplayViewer({ events }: ReplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const lastRenderIndexRef = useRef<number>(0);
  
  // Normalize event timeline to start at 0
  const normalizedEvents = events.length > 0 ? events.map(e => ({
    ...e,
    relativeTime: e.timestamp - events[0].timestamp
  })) : [];
  
  const totalDuration = normalizedEvents.length > 0 
    ? normalizedEvents[normalizedEvents.length - 1].relativeTime 
    : 0;

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    
    const elapsed = (time - startTimeRef.current) * playbackSpeed;
    
    // Find events that happened up to this point
    // This is a naive implementation; for large datasets, use binary search
    let currentIndex = lastRenderIndexRef.current;
    
    while (currentIndex < normalizedEvents.length) {
        if (normalizedEvents[currentIndex].relativeTime <= elapsed) {
            // Render this event
            drawEvent(normalizedEvents[currentIndex]);
            currentIndex++;
        } else {
            break;
        }
    }
    
    lastRenderIndexRef.current = currentIndex;
    
    // Update progress
    const currentProgress = Math.min(elapsed / totalDuration, 1);
    setProgress(currentProgress);

    if (currentIndex < normalizedEvents.length) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
    }
  };

  const drawEvent = (event: any) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Simple visualizer: draw dots for keystrokes
    // X axis: time (modulo width), Y axis: event type or random for visual effect
    const width = canvasRef.current!.width;
    const height = canvasRef.current!.height;
    
    const x = (event.relativeTime / 100) % width;
    const y = event.type === 'paste' ? height / 2 : Math.random() * height;
    
    ctx.fillStyle = event.type === 'paste' ? 'red' : 'rgba(37, 99, 235, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, event.type === 'paste' ? 4 : 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const startReplay = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    // Resume or restart
    if (progress >= 1) {
        // Restart
        const ctx = canvasRef.current?.getContext("2d");
        ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        lastRenderIndexRef.current = 0;
        startTimeRef.current = undefined; // Will be reset in animate
    } else {
        // Resume logic requires offsetting startTimeRef based on current progress
        // Simplifying for MVP: just restart from 0 if paused
        const ctx = canvasRef.current?.getContext("2d");
        ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        lastRenderIndexRef.current = 0;
        startTimeRef.current = undefined;
    }
    
    requestRef.current = requestAnimationFrame(animate);
  };

  const stopReplay = () => {
    setIsPlaying(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const reset = () => {
    stopReplay();
    setProgress(0);
    lastRenderIndexRef.current = 0;
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Writing Replay</h3>
      
      <div className="relative w-full h-32 bg-slate-50 rounded border border-gray-200 mb-3 overflow-hidden">
        <canvas 
            ref={canvasRef} 
            width={300} 
            height={128}
            className="w-full h-full"
        />
        {normalizedEvents.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                No events recorded
            </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
            <button 
                onClick={isPlaying ? stopReplay : startReplay}
                className="p-2 rounded hover:bg-gray-100 text-slate-700"
            >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={reset} className="p-2 rounded hover:bg-gray-100 text-slate-700">
                <RotateCcw size={16} />
            </button>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span>Speed:</span>
            {[1, 10, 20].map(speed => (
                <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-1 rounded ${playbackSpeed === speed ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                    {speed}x
                </button>
            ))}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200 rounded mt-2 overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
      </div>
    </div>
  );
}
