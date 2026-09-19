import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-surface-raised rounded ${className}`.trim()}
      {...props}
    />
  )
}

export interface JobCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const JobCardSkeleton: React.FC<JobCardSkeletonProps> = ({
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-surface border border-border-soft rounded-xl p-5 space-y-4 shadow-sm ${className}`.trim()}
      {...props}
    >
      {/* Title & match score placeholder */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-4 w-2/5" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Salary & location placeholder */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Row of tags */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-18 rounded-full" />
      </div>
    </div>
  )
}
