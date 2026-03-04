/**
 * In-process SSE broadcast registry.
 *
 * NOTE: This only works in single-process (dev / single Node instance) deployments.
 * For multi-instance production deployments, replace with a Redis Pub/Sub channel.
 */

const clients = new Set<ReadableStreamDefaultController>();

export function addSSEClient(controller: ReadableStreamDefaultController) {
  clients.add(controller);
}

export function removeSSEClient(controller: ReadableStreamDefaultController) {
  clients.delete(controller);
}

export function broadcastSSEEvent(event: string, data: unknown) {
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
