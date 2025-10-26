import React, { useMemo, useState } from 'react';
import BaseCard from './BaseCard';
import type { LoungeConfig, LoungePost, ProfileConfig } from '../../index';

interface MembersLoungeCardProps {
  config: ProfileConfig;
  lounge: LoungeConfig;
  isRtl: boolean;
  mode?: 'edit' | 'view';
  onCreatePost?: () => void;
  onSelectPost?: (post: LoungePost) => void;
}

const FALLBACK_AVATAR = 'https://i.pravatar.cc/80?img=12';
const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=80';

const numberFormatter = new Intl.NumberFormat();

const formatDate = (value: string, locale: string) => {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return value;
  }
};

const chipClass =
  'inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600';

const MembersLoungeCard: React.FC<MembersLoungeCardProps> = ({
  config,
  lounge,
  isRtl,
  mode = 'edit',
  onCreatePost,
  onSelectPost,
}) => {
  const [query, setQuery] = useState('');
  const locale = isRtl ? 'he-IL' : 'en-US';

  const posts = lounge?.posts ?? [];

  const stats = useMemo(() => {
    const uniqueTags = new Set<string>();
    posts.forEach((post) => {
      (post.tags ?? []).forEach((tag) => uniqueTags.add(tag.toLowerCase()));
    });

    const pinned = posts.filter((post) => post.pinned).length;

    return {
      totalPosts: posts.length,
      uniqueTags: uniqueTags.size,
      pinned,
    };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return posts;

    return posts.filter((post) => {
      const haystack = [
        post.title,
        post.body,
        post.authorName,
        post.authorRole,
        ...(post.tags ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(trimmedQuery);
    });
  }, [posts, query]);

  const headline = lounge?.headline?.trim() || "Members' Lounge";
  const description =
    lounge?.description?.trim() ||
    'A dedicated space to highlight updates, resources, and celebrations for your members.';
  const searchPlaceholder =
    lounge?.searchPlaceholder?.trim() || 'Search posts, tags, or authors...';

  const handleCreate = () => {
    if (onCreatePost) {
      onCreatePost();
      return;
    }

    if (mode === 'edit') {
      window.alert('Use the editor controls to add a new lounge post.');
    }
  };

  const accentText = config.styles.colorSecondary || 'text-blue-600';
  const accentBorder = accentText.startsWith('text-')
    ? accentText.replace('text-', 'border-')
    : 'border-slate-300';

  return (
    <BaseCard variant="default" className="overflow-hidden" hoverable={false}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          aria-hidden="true"
        >
          <div className="absolute -top-12 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 blur-3xl" />
          <div className="absolute -bottom-10 left-4 h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 blur-3xl" />
        </div>

        <div className="relative space-y-6">
          <div className="space-y-3">
            <span className={`${chipClass} bg-white/80 text-slate-500 shadow-sm`}>
              <svg
                aria-hidden
                className="h-3.5 w-3.5 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 13l4 4L18 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Member exclusive
            </span>
            <div className={`text-3xl font-bold tracking-tight text-slate-800 ${config.styles.fontHeading}`}>
              {headline}
            </div>
            <p className={`text-sm text-slate-500 max-w-2xl ${config.styles.fontBody}`}>
              {description}
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Posts</dt>
              <dd className={`mt-1 text-2xl font-semibold ${accentText}`}>
                {numberFormatter.format(stats.totalPosts)}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Topics</dt>
              <dd className={`mt-1 text-2xl font-semibold ${accentText}`}>
                {numberFormatter.format(stats.uniqueTags)}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Pinned</dt>
              <dd className={`mt-1 text-2xl font-semibold ${accentText}`}>
                {numberFormatter.format(stats.pinned)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <input
                dir={isRtl ? 'rtl' : 'ltr'}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-full border border-slate-200/70 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="pointer-events-none absolute inset-y-0 flex items-center pl-4 text-slate-400">
                <svg
                  aria-hidden
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M20 20l-3.5-3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={mode === 'view' && !onCreatePost}
              >
                <svg
                  aria-hidden
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                New post
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        {filteredPosts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
            No posts match “{query.trim()}”. Try a different search or create a new update.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={post.coverImageUrl || FALLBACK_COVER}
                    alt={post.title}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute left-4 top-4 flex items-center gap-3 rounded-full bg-white/90 px-2 py-1 shadow">
                    <img
                      src={post.authorAvatarUrl || FALLBACK_AVATAR}
                      alt={post.authorName}
                      className="h-8 w-8 rounded-full border border-white shadow-sm"
                    />
                    <div className="min-w-[120px] text-xs">
                      <p className="font-semibold text-slate-800">{post.authorName}</p>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        {post.authorRole}
                      </p>
                    </div>
                  </div>
                  {post.pinned && (
                    <div className="absolute right-3 top-3 rounded-full bg-slate-900/85 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow">
                      Pinned
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className={`text-base font-semibold leading-snug text-slate-800 ${config.styles.fontHeading}`}>
                      {post.title}
                    </h3>
                    <span className="text-xs font-medium text-slate-400">
                      {formatDate(post.createdAt, locale)}
                    </span>
                  </div>
                  <p className={`text-sm text-slate-600 line-clamp-3 ${config.styles.fontBody}`}>
                    {post.body}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {(post.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <svg
                          aria-hidden
                          className="h-4 w-4 text-rose-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            d="M20.8 4.6a5 5 0 0 0-7.07 0L12 6.33l-1.73-1.73a5 5 0 0 0-7.07 7.07L12 21.2l8.8-9.53a5 5 0 0 0 0-7.07z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {numberFormatter.format(post.likes ?? 0)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <svg
                          aria-hidden
                          className="h-4 w-4 text-slate-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            d="M6 3h12v18l-6-3-6 3V3z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {numberFormatter.format(post.saves ?? 0)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectPost?.(post)}
                      className={`text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:text-slate-900 ${mode === 'view' && !onSelectPost ? 'cursor-default' : ''}`}
                      disabled={mode === 'view' && !onSelectPost}
                    >
                      View detail →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            className={`inline-flex items-center gap-2 rounded-full border ${accentBorder} px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50`}
          >
            View all posts
            <svg
              aria-hidden
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </BaseCard>
  );
};

export default MembersLoungeCard;
