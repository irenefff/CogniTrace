import cssText from "data-text:~/style/main.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { ShieldCheck } from "lucide-react"
import { useRecording } from "~lib/use-recording"
import { useEffect, useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const TrustBadge = () => {
  const { isRecording, setIsRecording } = useRecording()
  const [count, setCount] = useState(0)
  
  // Use polling instead of useLiveQuery for reliable cross-frame updates
  useEffect(() => {
    const checkCount = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ type: "GET_EVENT_COUNT" });
        if (response && typeof response.count === 'number') {
           setCount(response.count);
        }
      } catch (e) {
        console.error("Count check failed", e);
      }
    };

    // Check immediately
    checkCount();

    // Poll every 1 second
    const interval = setInterval(() => {
        checkCount();
        console.log(`CogniTrace Badge [${window.location.origin}]: Polling Background...`);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] group">
      <div 
        onClick={() => setIsRecording(!isRecording)}
        className={`backdrop-blur-sm border border-blue-100 shadow-lg rounded-full p-2 flex items-center gap-2 hover:pl-4 transition-all duration-300 cursor-pointer ${isRecording ? 'bg-white/90' : 'bg-gray-100/90'}`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${isRecording ? 'bg-blue-600' : 'bg-gray-400'}`}>
           <ShieldCheck size={16} className="text-white" />
        </div>
        <div className="w-0 overflow-hidden group-hover:w-auto transition-all duration-300 whitespace-nowrap">
          <div className="flex flex-col pr-2">
            <span className="text-xs font-medium text-slate-700">
              {isRecording ? "CogniTrace Active" : "Recording Paused"}
            </span>
            <span className="text-[10px] text-slate-500">
              Recorded Events: {count}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrustBadge
