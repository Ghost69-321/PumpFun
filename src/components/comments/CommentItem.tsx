'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Comment } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { formatRelativeTime, shortenAddress } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

interface CommentItemProps {
  comment: Comment;
  onReplyPosted?: () => void;
}

export function CommentItem({ comment, onReplyPosted }: CommentItemProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [posting, setPosting] = useState(false);

  const displayName =
    comment.user?.username ||
    shortenAddress(comment.user?.walletAddress || '', 6);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/tokens/${comment.tokenId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: comment.tokenId,
          content: replyContent,
          parentId: comment.id,
        }),
      });

      if (res.ok) {
        setReplyContent('');
        setReplyOpen(false);
        onReplyPosted?.();
      } else {
        const data = await res.json();
        toast({ type: 'error', title: 'Failed to reply', description: data.error });
      }
    } catch {
      toast({ type: 'error', title: 'Error', description: 'Could not post reply' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Link href={`/profile/${comment.user?.walletAddress}`} className="shrink-0">
        <Avatar
          src={comment.user?.avatar}
          alt={displayName}
          fallback={comment.user?.walletAddress || '??'}
          size="sm"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/profile/${comment.user?.walletAddress}`}
            className="text-sm font-medium text-white hover:text-accent transition-colors"
          >
            {displayName}
          </Link>
          <span className="text-text-muted text-xs">{formatRelativeTime(comment.createdAt)}</span>
        </div>

        <p className="text-text-secondary text-sm break-words">{comment.content}</p>

        {/* Reply button */}
        {session && !comment.parentId && (
          <button
            onClick={() => setReplyOpen(!replyOpen)}
            className="text-text-muted text-xs mt-1 hover:text-accent transition-colors"
          >
            Reply
          </button>
        )}

        {/* Reply input */}
        {replyOpen && (
          <div className="mt-2 space-y-2">
            <Textarea
              placeholder={`Reply to ${displayName}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
              maxLength={500}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={handleReply} loading={posting}>
                Reply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setReplyOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l border-border">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
