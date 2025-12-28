'use client'

// app/global-error.tsx
// Global error handler for root layout errors

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#FAF8F5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>💥</div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: '0.5rem'
          }}>
            Critical Error
          </h1>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            A critical error has occurred. Please try refreshing the page.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '0.5rem',
              textAlign: 'left'
            }}>
              <p style={{
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: '#991B1B',
                wordBreak: 'break-all',
                margin: 0
              }}>
                {error.message}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#8B7355',
                color: 'white',
                fontWeight: '600',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                color: '#1a1a1a',
                fontWeight: '600',
                border: '1px solid #e5e5e5',
                borderRadius: '0.5rem',
                textDecoration: 'none'
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
