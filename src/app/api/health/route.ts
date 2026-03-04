import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const startTime = Date.now();

export async function GET() {
  const status: {
    status: string;
    instanceUptime: number;
    timestamp: string;
    database: string;
    version: string;
  } = {
    status: 'ok',
    instanceUptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    database: 'unknown',
    version: process.env.npm_package_version || '0.1.0',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = 'connected';
  } catch {
    status.database = 'disconnected';
    status.status = 'degraded';
  }

  const httpStatus = status.status === 'ok' ? 200 : 503;

  return NextResponse.json(status, { status: httpStatus });
}
