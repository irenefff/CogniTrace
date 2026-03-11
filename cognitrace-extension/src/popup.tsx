import { useRecording } from "~lib/use-recording"
import "~style/main.css";

function IndexPopup() {
  const { isRecording, setIsRecording } = useRecording()

  return (
    <div className="w-64 p-4 bg-white dark:bg-slate-900">
      <h1 className="text-xl font-bold mb-4 text-blue-600">CogniTrace</h1>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Recording</span>
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`px-3 py-1 rounded-full text-white ${
            isRecording ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          {isRecording ? "ON" : "OFF"}
        </button>
      </div>
      <div className="mt-4 pt-4 border-t">
        <button 
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT })}
        >
          Open Dashboard
        </button>
      </div>
    </div>
  );
}

export default IndexPopup;
