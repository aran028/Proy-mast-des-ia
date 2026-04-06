export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export function Skeleton({ className = '', ...props }: Readonly<SkeletonProps>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-800 ${className}`}
      {...props}
    />
  )
}
