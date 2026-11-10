// Placeholders shown while content loads, shaped like what will appear, so
// the page doesn't jump once it's there. The sweep animation lives in
// index.css (.skeleton) and stops with reduced motion.
import type { ReactNode } from 'react';

/** One placeholder block; size and shape come from `className`. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded ${className}`} />;
}

/** Announces the loading state to screen readers; the blocks inside are hidden from them. */
function Loading({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-label="Loading" className={className}>
      {children}
    </div>
  );
}

// ---- Whole pages, while the user's data loads after login --------------------

const darkBar = 'bg-[color:var(--ink)] flex items-center justify-between px-4 sm:px-6 py-2 min-h-[52px] shrink-0';

function DashboardSkeleton() {
  return (
    <Loading className="min-h-screen bg-[color:var(--bg)] pt-6 px-4 pb-32 max-w-[1220px] mx-auto sm:pt-12 sm:px-8 flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-8">
        <Skeleton className="h-6 w-48" />
        <div className="hidden sm:flex gap-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-16" />)}
        </div>
      </div>
      <div className="flex gap-2 mb-8">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-7 w-24" />)}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[56px] flex-1 min-w-[108px]" />)}
      </div>
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-28 max-sm:hidden" />
        <Skeleton className="h-8 w-28 max-sm:hidden" />
      </div>
      <div className="flex flex-col">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-6 py-4 border-b border-[color:var(--rule)]">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3.5 w-48 max-sm:hidden" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3.5 w-20 ml-auto max-sm:hidden" />
          </div>
        ))}
      </div>
    </Loading>
  );
}

function FormFieldSkeleton({ wide = true }: { wide?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className={`h-9 ${wide ? 'w-full' : 'w-1/2'}`} />
    </div>
  );
}

/** A white sheet like the CV / cover letter preview, with text lines on it. */
function DocumentSheetSkeleton() {
  return (
    <div className="bg-white/[0.04] rounded w-full max-w-[794px] aspect-[1/1.414] mx-auto p-[6%] flex flex-col gap-4">
      <Skeleton className="h-8 w-2/5" />
      <Skeleton className="h-3 w-1/3" />
      <div className="h-px bg-[color:var(--rule)] my-2" />
      <div className="grid grid-cols-[1fr_2.2fr] gap-8">
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-3 w-4/5" />)}
        </div>
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} className={`h-3 ${i % 3 === 2 ? 'w-3/5' : 'w-full'}`} />)}
        </div>
      </div>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <Loading className="h-dvh bg-[color:var(--bg)] flex flex-col">
      <div className={darkBar}>
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-48 max-sm:hidden" />
        <Skeleton className="h-7 w-28" />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden lg:grid lg:grid-cols-[420px_1fr]">
        <div className="h-full py-6 px-4 sm:py-8 sm:px-7 flex flex-col gap-5 lg:border-r-[1.5px] border-[color:var(--rule)]">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton wide={false} />
          <FormFieldSkeleton />
        </div>
        <div className="h-full bg-[#1a2236] p-8 max-lg:hidden overflow-hidden">
          <DocumentSheetSkeleton />
        </div>
      </div>
    </Loading>
  );
}

function ApplicationSkeleton() {
  return (
    <Loading className="min-h-screen bg-[color:var(--bg)]">
      <div className={darkBar}>
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-7 w-20" />)}
        </div>
      </div>
      <div className="p-4 sm:p-10">
        <DocumentSheetSkeleton />
      </div>
    </Loading>
  );
}

/** The page about to open, guessed from the URL, while the app loads its data. */
export function AppSkeleton() {
  const path = window.location.pathname.replace(/\/$/, '');
  if (/^\/application\/[^/]+\/edit$/.test(path)) return <EditorSkeleton />;
  if (/^\/application\/[^/]+$/.test(path)) return <ApplicationSkeleton />;
  return <DashboardSkeleton />;
}

// ---- Parts of a page -------------------------------------------------------

/** The version history dialog's list and diff panes. */
export function VersionHistorySkeleton() {
  return (
    <Loading className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-[300px_1fr]">
      <div className="flex flex-col max-md:border-b md:border-r border-white/8 max-md:max-h-[35%] overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="px-4 py-3 flex flex-col gap-2 border-b border-white/5">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className={`h-3 ${i % 2 ? 'w-3/5' : 'w-4/5'}`} />
          </div>
        ))}
      </div>
      <div className="p-5 flex flex-col gap-6">
        <div className="flex justify-between">
          <Skeleton className="h-3.5 w-56" />
          <Skeleton className="h-7 w-36" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        ))}
      </div>
    </Loading>
  );
}

/** The latest change in the edit form's change bar: badge, time and message. */
export function LatestChangeSkeleton() {
  return (
    <Loading className="flex flex-col gap-1.5 pt-0.5">
      <Skeleton className="h-3 w-4/5" />
    </Loading>
  );
}

/** Rows of the API token list on the account page. */
export function TokenListSkeleton() {
  return (
    <Loading className="flex flex-col gap-2">
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center justify-between gap-3 border border-[color:var(--rule)] rounded-[5px] px-3 py-2.5">
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-2.5 w-64 max-w-full" />
          </div>
          <Skeleton className="h-6 w-14" />
        </div>
      ))}
    </Loading>
  );
}
