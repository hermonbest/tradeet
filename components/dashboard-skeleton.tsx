'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 min-h-screen">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="tradeet-card">
            <CardContent className="p-4">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-20 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <Card className="tradeet-card">
            <CardHeader className="pb-1 px-3 pt-3">
              <Skeleton className="h-3 w-16" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <Skeleton className="h-[120px] w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="tradeet-card">
            <CardContent className="p-4">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
