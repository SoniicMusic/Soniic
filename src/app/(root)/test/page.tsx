import ShineBorder from "@/components/ui/shine-border";
import AudioPreview from "@/components/AudioPreview";

export default function test() {
    // Test preview URL (30-second sample from Apple Music)
    const testPreviewUrl = "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/f1/f3/c4/f1f3c4b0-3e4e-8f8a-7b2e-9c8d5a3e4f1b/mzaf_1234567890123456789.plus.aac.p.m4a";
    
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 space-y-8">
            <ShineBorder
                className="relative flex w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-lg border bg-background p-8"
                color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                borderRadius={8}
                borderWidth={2}
            >
                <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-2xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10 mb-6">
                    Audio Preview Test
                </span>
                
                {/* Test default variant */}
                <div className="w-full mb-6">
                    <h3 className="text-white text-sm mb-2">Default Variant:</h3>
                    <AudioPreview 
                        src={testPreviewUrl}
                        title="Test Track"
                        variant="default"
                    />
                </div>
            </ShineBorder>
            
            {/* Test circular overlay variant */}
            <div className="relative w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg overflow-hidden">
                <img 
                    src="https://via.placeholder.com/256x256/6B46C1/FFFFFF?text=Album+Art" 
                    alt="Test Album Art"
                    className="w-full h-full object-cover"
                />
                <AudioPreview 
                    src={testPreviewUrl}
                    title="Test Track Overlay"
                    variant="circular-overlay"
                />
            </div>
            
            <div className="text-white text-center max-w-md">
                <p className="text-sm opacity-70">
                    This page tests the AudioPreview component with Safari mobile fixes.
                    Try playing the audio on different devices and browsers.
                </p>
            </div>
        </div>
    );
}