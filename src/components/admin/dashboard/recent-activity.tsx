import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  action: string
  entity: string
  createdAt: Date
  user: {
    name: string
    image?: string | null
  } | null
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions performed by administrators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No recent activity found.</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <Avatar className="size-9">
                  <AvatarImage src={activity.user?.image || ""} alt={activity.user?.name || "System"} />
                  <AvatarFallback>
                    {activity.user?.name?.charAt(0).toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-medium leading-none">
                    <span className="font-bold">{activity.user?.name || "System"}</span>{" "}
                    <span className="text-muted-foreground">
                      {activity.action.toLowerCase()} {activity.entity.toLowerCase()}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
