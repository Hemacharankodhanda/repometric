import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RepoMetric Health Score';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { owner: string; repo: string } }) {
  const { owner, repo } = params;

  // Mock deterministic score based on repo name
  const repoName = `${owner}/${repo}`.toLowerCase();
  let score = 74;
  let grade = 'GOOD';
  let badgeBg = '#60A5FA';

  if (repoName.includes('react')) {
    score = 68;
    grade = 'NEEDS WORK';
    badgeBg = '#FBBF24';
  } else if (repoName.includes('express')) {
    score = 82;
    grade = 'GOOD';
    badgeBg = '#60A5FA';
  } else if (
    repoName.includes('tailwind') ||
    repoName.includes('uv') ||
    repoName.includes('shadcn')
  ) {
    score = 94;
    grade = 'EXEMPLARY';
    badgeBg = '#D6F954';
  }

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFDF8',
        border: '16px solid #141413',
        padding: '48px',
        boxSizing: 'border-box',
        fontFamily: 'sans-serif',
        justifyContent: 'space-between',
      }}
    >
      {/* Top bar: Brand Wordmark and Repo tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Tilly mini icon */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: '#D6F954',
              border: '3px solid #141413',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '22px',
            }}
          >
            T
          </div>
          <span
            style={{
              fontSize: '32px',
              fontWeight: 900,
              letterSpacing: '-1px',
              color: '#141413',
            }}
          >
            repometric
          </span>
        </div>

        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#F3EFE6',
            border: '3px solid #141413',
            borderRadius: '8px',
            fontSize: '20px',
            fontFamily: 'monospace',
            fontWeight: 700,
            color: '#141413',
          }}
        >
          {owner}/{repo}
        </div>
      </div>

      {/* Center: Large Score & Mini Treemap */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '48px',
        }}
      >
        {/* Left: Score Box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            border: '4px solid #141413',
            borderRadius: '16px',
            padding: '36px 44px',
            boxShadow: '8px 8px 0px #141413',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
            <span
              style={{
                fontSize: '110px',
                fontWeight: 900,
                lineHeight: '1',
                color: '#141413',
                letterSpacing: '-4px',
              }}
            >
              {score}
            </span>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#5E5D59',
              }}
            >
              / 100
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              padding: '6px 16px',
              backgroundColor: badgeBg,
              border: '3px solid #141413',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '20px',
              color: '#141413',
              transform: 'rotate(-2deg)',
            }}
          >
            {grade}
          </div>
        </div>

        {/* Right: Stylized Mini Treemap Visual */}
        <div
          style={{
            width: '460px',
            height: '240px',
            border: '4px solid #141413',
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            padding: '12px',
            display: 'flex',
            gap: '8px',
            boxShadow: '8px 8px 0px #141413',
          }}
        >
          {/* Col 1 */}
          <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                flex: 3,
                backgroundColor: '#60A5FA',
                border: '3px solid #141413',
                borderRadius: '8px',
                padding: '8px',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              src/ (TypeScript)
            </div>
            <div
              style={{
                flex: 2,
                backgroundColor: '#D6F954',
                border: '3px solid #141413',
                borderRadius: '8px',
                padding: '8px',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              tests/
            </div>
          </div>

          {/* Col 2 */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                flex: 2,
                backgroundColor: '#FBBF24',
                border: '3px solid #141413',
                borderRadius: '8px',
                padding: '8px',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              docs/
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: '#F87171',
                border: '3px solid #141413',
                borderRadius: '8px',
                padding: '8px',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              .github/
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '3px solid #141413',
          paddingTop: '20px',
          fontSize: '18px',
          color: '#5E5D59',
          fontWeight: 700,
        }}
      >
        <span>Deterministic health scoring • Interactive Repo Map • 100% Free</span>
        <span style={{ color: '#141413' }}>repometric.dev</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
