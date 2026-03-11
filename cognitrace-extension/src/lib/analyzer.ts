import type { InputEvent } from "~types";

export interface AnalysisResult {
  entropy: number;
  pasteCount: number;
  totalEvents: number;
  activeTime: number; // in milliseconds
  integrityScore: number;
  sourceBreakdown: {
    original: number; // percentage
    pasted: number;   // percentage
  };
}

export class Analyzer {
  private events: InputEvent[] = [];
  
  constructor(events: InputEvent[]) {
    this.events = events;
  }

  public analyze(): AnalysisResult {
    if (this.events.length === 0) {
      return this.getEmptyResult();
    }

    const totalEvents = this.events.length;
    const pasteEvents = this.events.filter(e => e.type === 'paste');
    const pasteCount = pasteEvents.length;
    
    // Calculate Active Time (sum of flight times, capped at 2s gap)
    let activeTime = 0;
    
    // Filter only keydown/keyup events for active time calculation
    const timeEvents = this.events.filter(e => e.type === 'keydown' || e.type === 'keyup' || e.type === 'input');
    
    if (timeEvents.length > 1) {
        let lastTime = timeEvents[0].timestamp;
        
        for (let i = 1; i < timeEvents.length; i++) {
            const current = timeEvents[i];
            const gap = current.timestamp - lastTime;
            
            // Only count if gap is positive and less than 5 seconds (thinking pause cap)
            if (gap > 0 && gap < 5000) { 
                activeTime += gap;
            }
            lastTime = current.timestamp;
        }
    }
    
    // Fallback: If active time is 0 but we have events, estimate based on event count * average typing speed (e.g. 150ms per key)
    if (activeTime === 0 && totalEvents > 5) {
        activeTime = totalEvents * 150; 
    }

    // Entropy calculation (simplified for now based on flight time variance)
    const entropy = this.calculateEntropy();

    // Source Breakdown
    // Estimate original content vs pasted content
    let pastedChars = 0;
    pasteEvents.forEach(e => pastedChars += (e.pasteLen || 0));
    
    // Rough estimate: 1 keypress = 1 char (ignoring backspaces/nav for simplicity)
    const typedChars = this.events.filter(e => e.type === 'keydown' && e.keyType === 'char').length;
    
    // Avoid division by zero
    const totalContent = typedChars + pastedChars;
    let pastedPercent = 0;
    
    if (totalContent > 0) {
        pastedPercent = Math.round((pastedChars / totalContent) * 100);
    } else if (pasteCount > 0) {
        // If we have pastes but no content length (e.g. image paste or error), assume 100% paste
        pastedPercent = 100;
    }

    // Heuristic Integrity Score Calculation (Revised V2)
    // Goal: More gradual penalty based on volume, not just count.
    
    let integrityScore = 100;

    if (totalEvents > 0) {
        // Factor 1: Paste Volume (How much of the document is pasted?)
        // If 50% is pasted, score drops by 40 points.
        // If 100% is pasted, score drops by 80 points.
        const volumePenalty = pastedPercent * 0.8; 
        
        // Factor 2: Paste Frequency (How often do they paste?)
        // Penalty: 15 points per paste action. NO CAP.
        // This ensures every single violation drastically impacts the score.
        // 1 paste = -15
        // 3 pastes = -45
        // 7 pastes = Score 0 (Guaranteed fail)
        const frequencyPenalty = pasteCount * 15;
        
        integrityScore -= (volumePenalty + frequencyPenalty);
        
        // Bonus: High entropy (human-like variation) can recover some score
        // But only if paste percentage is low (< 30%)
        if (pastedPercent < 30 && entropy > 3.0) {
            integrityScore += 5;
        }
    } else {
        // No events yet
        integrityScore = 100;
    }
    
    integrityScore = Math.max(0, Math.min(100, Math.round(integrityScore)));

    return {
      entropy,
      pasteCount,
      totalEvents,
      activeTime,
      integrityScore,
      sourceBreakdown: {
        original: 100 - pastedPercent,
        pasted: pastedPercent
      }
    };
  }

  private calculateEntropy(): number {
    // Calculate Shannon entropy of flight times
    // Bin flight times into 50ms buckets
    const bins = new Map<number, number>();
    const flightTimes = this.events
        .filter(e => e.flightTime !== undefined)
        .map(e => e.flightTime!);

    if (flightTimes.length === 0) return 0;

    flightTimes.forEach(t => {
        const bin = Math.floor(t / 50) * 50;
        bins.set(bin, (bins.get(bin) || 0) + 1);
    });

    let entropy = 0;
    const total = flightTimes.length;
    
    bins.forEach(count => {
        const p = count / total;
        entropy -= p * Math.log2(p);
    });

    return entropy;
  }

  private getEmptyResult(): AnalysisResult {
    return {
      entropy: 0,
      pasteCount: 0,
      totalEvents: 0,
      activeTime: 0,
      integrityScore: 100,
      sourceBreakdown: { original: 100, pasted: 0 }
    };
  }
}
