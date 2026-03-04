'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  tokenId: string;
}

export function CommentSection({ tokenId }: CommentSectionProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/tokens/${tokenId}/comments`);
      const data = await res.json();
      if (data.items) setComments(data.items);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/tokens/${tokenId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, content }),
      });

      if (res.ok) {
        setContent('');
        await fetchComments();
        toast({ type: 'success', title: 'Comment posted!' });
      } else {
        const data = await res.json();
        toast({ type: 'error', title: 'Failed to post', description: data.error });
      }
    } catch {
      toast({ type: 'error', title: 'Error', description: 'Could not post comment' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comment input */}
      {session ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Share your thoughts about this token..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-text-muted text-xs">{content.length}/1000</span>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePost}
              loading={posting}
              disabled={!content.trim()}
            >
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-surface-2 rounded-lg p-3 text-center">
          <p className="text-text-muted text-sm">Connect your wallet to post comments</p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-3 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-surface-3 rounded" />
                <div className="h-3 w-full bg-surface-3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReplyPosted={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
