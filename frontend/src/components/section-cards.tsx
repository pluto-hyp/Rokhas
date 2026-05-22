"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, FileTextIcon, UsersIcon, CheckCircleIcon } from "lucide-react"

interface SectionCardsProps {
  stats?: {
    totalPermits: number;
    approvedRate: number;
    activeUsers: number;
    pendingEvaluations: number;
  }
}

export function SectionCards({ stats }: SectionCardsProps) {
  const data = stats || {
    totalPermits: 0,
    approvedRate: 0,
    activeUsers: 0,
    pendingEvaluations: 0
  };

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card py-2">
        <CardHeader>
          <CardDescription>Total Dossiers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.totalPermits}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-primary/5 border-primary/20">
              <FileTextIcon className="size-3 mr-1" />
              Global
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total permits on platform
          </div>
          <div className="text-muted-foreground italic">
            Live from Rokhas API
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card py-2">
        <CardHeader>
          <CardDescription>Approval Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.approvedRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
              <TrendingUpIcon className="size-3 mr-1" />
              Efficient
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Positive decisions ratio
          </div>
          <div className="text-muted-foreground italic">
            Performance metric
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card py-2">
        <CardHeader>
          <CardDescription>Active Citizens</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.activeUsers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-600">
              <UsersIcon className="size-3 mr-1" />
              Registered
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Verified platform users
          </div>
          <div className="text-muted-foreground italic">
            Community reach
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card py-2">
        <CardHeader>
          <CardDescription>Pending Review</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.pendingEvaluations}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-600">
              <CheckCircleIcon className="size-3 mr-1" />
              Awaiting
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Dossiers in evaluation phase
          </div>
          <div className="text-muted-foreground italic">
            Current workload
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
