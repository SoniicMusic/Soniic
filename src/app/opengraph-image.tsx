import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            fontSize: 60,
            color: 'white',
            background: 'linear-gradient(to right, #0f172a, #1e293b)',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 50,
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 40
            }}
          >
            {/* Icon Placeholder - Replace with actual logo */}
            <div style={{ 
              width: 100, 
              height: 100, 
              borderRadius: 100, 
              background: 'linear-gradient(45deg, #4f46e5, #8b5cf6)', 
              marginRight: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 'bold'
            }}>
              S
            </div>
            
            <div style={{ fontWeight: 'bold' }}>Soniic</div>
          </div>

          <div style={{ 
            fontSize: 32, 
            opacity: 0.8,
            textAlign: 'center',
            maxWidth: '70%',
            lineHeight: 1.4
          }}>
            One link that works on every music platform
          </div>
          
          <div style={{ 
            display: 'flex',
            marginTop: 50, 
            gap: 15
          }}>
            {['Spotify', 'Apple Music', 'Tidal', 'YouTube'].map((platform) => (
              <div key={platform} style={{ 
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 25,
                fontSize: 20
              }}>
                {platform}
              </div>
            ))}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
