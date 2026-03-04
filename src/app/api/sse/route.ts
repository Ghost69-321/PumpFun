import { NextRequest, NextResponse } from 'next/server';
import { SSE_HEARTBEAT_INTERVAL } from '@/lib/constants';
import { addSSEClient, removeSSEClient } from '@/lib/sse-clients';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      addSSEClient(controller);

      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ connected: true })}\n\n`)
      );

      // Heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`)
          );
        } catch {
          clearInterval(heartbeatInterval);
          removeSSEClient(controller);
        }
      }, SSE_HEARTBEAT_INTERVAL);

      // Cleanup on stream close
      return () => {
        clearInterval(heartbeatInterval);
        removeSSEClient(controller);
      };
    },
    cancel(controller) {
      removeSSEClient(controller);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

