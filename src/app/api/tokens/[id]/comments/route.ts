import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { commentSchema } from '@/lib/validators';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get('page') || 1);
    const pageSize = Number(searchParams.get('pageSize') || 50);

    const items = await prisma.comment.findMany({
      where: { tokenId: params.id, parentId: null },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: { id: true, walletAddress: true, username: true, avatar: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, walletAddress: true, username: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const total = await prisma.comment.count({
      where: { tokenId: params.id, parentId: null },
    });

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error('GET /api/tokens/[id]/comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = commentSchema.safeParse({ ...body, tokenId: params.id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        tokenId: params.id,
        userId: session.user.id,
        content: parsed.data.content,
        parentId: parsed.data.parentId,
      },
      include: {
        user: {
          select: { id: true, walletAddress: true, username: true, avatar: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('POST /api/tokens/[id]/comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
