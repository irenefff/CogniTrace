import { useStorage } from "@plasmohq/storage/hook"

export const useRecording = () => {
  const [isRecording, setIsRecording] = useStorage<boolean>("is_recording", false)
  return { isRecording, setIsRecording }
}
