'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a] text-white antialiased">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-6xl font-black text-red-500 mb-4">⚠️</h1>
            <h2 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-400 mb-8">
              A critical error occurred. Please try refreshing the page.
              {error.digest && (
                <span className="block text-xs text-gray-600 mt-2">
                  Error ID: {error.digest}
                </span>
              )}
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-[#00ff88] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#00cc6a] transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
