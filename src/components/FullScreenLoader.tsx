import { div as MotionDiv } from '@/lib/motion'

interface FullScreenLoaderProps {
  isVisible: boolean
  message?: string
}

export default function FullScreenLoader({ isVisible, message = "Loading..." }: FullScreenLoaderProps) {
  if (!isVisible) return null

  return (
    <MotionDiv
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <MotionDiv
        className="flex flex-col items-center space-y-4 text-white"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {/* Spinning loader */}
        <div className="animate-spin h-12 w-12 border-4 border-white/30 border-t-white rounded-full"></div>
        
        {/* Loading message */}
        <p className="text-lg font-medium">{message}</p>
      </MotionDiv>
    </MotionDiv>
  )
}
