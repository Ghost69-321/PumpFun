'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import { timeAgo, shortenAddress } from '@/lib/utils';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username?: string;
    walletAddress?: string;
    avatar?: string;
  };
}

interface CommentSectionProps {
  tokenId: string;
}

export function CommentSection({ tokenId }: CommentSectionProps) {
  const { publicKey, connected } = useWallet();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [tokenId]);

  async function fetchComments() {
    try {
      const res = await fetch(`/api/tokens/${tokenId}/comments`);
      if (res.ok) setComments(await res.json());
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!connected || !publicKey) {
      toast.error('Connect your wallet to comment');
      return;
    }
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/tokens/${tokenId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          walletAddress: publicKey.toString(),
        }),
      });

      if (res.ok) {
        setNewComment('');
        fetchComments();
        toast.success('Comment posted!');
      }
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Comments</h3>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            placeholder={connected ? 'Write a comment...' : 'Connect wallet to comment'}
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={loading || !connected || !newComment.trim()}
            className="px-4 py-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-700 text-black font-semibold text-sm rounded-lg transition-colors"
          >
            Post
          </button>
        </div>
      </form>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs flex-shrink-0">
                👤
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-green-400">
                    {comment.user.username || shortenAddress(comment.user.walletAddress || '')}
                  </span>
                  <span className="text-xs text-gray-600">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-300">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
