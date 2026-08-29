import React, { useState } from 'react';
import { Track, TrackComment, ThemeMode } from '../types';
import { X, Heart, Send, MessageCircle, Clock, Sparkles } from 'lucide-react';

interface CommentDrawerProps {
  track: Track;
  themeMode: ThemeMode;
  currentPlaybackTime: number;
  onClose: () => void;
  onAddComment: (comment: { content: string; timestamp: string }) => void;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  track,
  themeMode,
  currentPlaybackTime,
  onClose,
  onAddComment,
}) => {
  const [inputText, setInputText] = useState('');
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const isDark = themeMode === 'dark';

  const formatSecToTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentFormattedTime = formatSecToTime(currentPlaybackTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onAddComment({
      content: inputText.trim(),
      timestamp: includeTimestamp ? currentFormattedTime : '0:00',
    });

    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="comment-drawer"
        className={`w-full max-w-lg max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border ${
          isDark
            ? 'bg-neutral-900/95 border-neutral-800 text-neutral-100'
            : 'bg-white/95 border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-sm sm:text-base">
              댓글 ({track.comments.length}개)
            </h3>
            <span className="text-xs text-neutral-400 truncate max-w-[160px]">
              · {track.title}
            </span>
          </div>
          <button
            id="btn-close-comments"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {track.comments.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-sm">
              첫 번째 댓글을 남겨보세요! ✨
            </div>
          ) : (
            track.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 group">
                <img
                  src={comment.userAvatar}
                  alt={comment.userName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-neutral-500/20 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{comment.userName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-rose-500/10 text-rose-500">
                      {comment.timestamp}
                    </span>
                    <span className="text-[10px] text-neutral-400">{comment.timeAgo}</span>
                  </div>
                  <p className="text-xs sm:text-sm mt-1 leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-0.5 pt-1">
                  <button className="text-neutral-400 hover:text-rose-500 transition-colors p-1">
                    <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                  <span className="text-[10px] text-neutral-400 font-medium">{comment.likeCount}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form input */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-neutral-500/10 bg-neutral-500/5">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setIncludeTimestamp(!includeTimestamp)}
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-all ${
                includeTimestamp
                  ? 'bg-rose-500 text-white'
                  : isDark
                  ? 'bg-neutral-800 text-neutral-400'
                  : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              <Clock className="w-3 h-3" />
              {includeTimestamp ? `현재 구간 (${currentFormattedTime}) 태그됨` : '시간 태그 없음'}
            </button>
            <span className="text-[11px] text-neutral-400 flex items-center gap-1 ml-auto">
              <Sparkles className="w-3 h-3 text-amber-400" />
              10대 음악 토론 공간
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              id="input-comment"
              placeholder="이 비트, 피쳐링에 대한 솔직한 생각을 남겨보세요..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={`flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm outline-none transition-all ${
                isDark
                  ? 'bg-neutral-800 focus:bg-neutral-750 text-neutral-100 placeholder-neutral-500 border border-neutral-700'
                  : 'bg-neutral-100 focus:bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300'
              }`}
            />
            <button
              type="submit"
              id="btn-submit-comment"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white transition-all shadow-md shadow-rose-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
