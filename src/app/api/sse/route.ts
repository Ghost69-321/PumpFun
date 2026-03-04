import { NextRequest, NextResponse } from 'next/server';
import { SSE_HEARTBEAT_INTERVAL } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Global event emitter for SSE (in production, use Redis pub/sub)
const clients = new Set<ReadableStreamDefaultController>();

function broadcastToClients(event: string, data: unknown) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  clients.forEach((controller) => {
    try {
      controller.enqueue(encoder.encode(message));
    } catch {
      clients.delete(controller);
    }
  });
}

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);

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
          clients.delete(controller);
        }
      }, SSE_HEARTBEAT_INTERVAL);

      // Cleanup on close
      return () => {
        clearInterval(heartbeatInterval);
        clients.delete(controller);
      };
    },
    cancel(controller) {
      clients.delete(controller);
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
