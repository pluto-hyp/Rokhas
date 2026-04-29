"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Bell, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Users, 
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Building,
  Briefcase,
  Music,
  LayoutGrid
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// --- Mock Data ---
const RECENT_APPLICATIONS = [
  { ref: "RKH-2026-0841", applicant: "Youssef Bennani", type: "Commercial Construction", date: "Apr 27, 2026", status: "Pending" },
  { ref: "RKH-2026-0840", applicant: "Fatima Zahra Idrissi", type: "Restaurant License", date: "Apr 26, 2026", status: "Approved" },
  { ref: "RKH-2026-0839", applicant: "Karim El Fassi", type: "Residential Renovation", date: "Apr 25, 2026", status: "In Review" },
  { ref: "RKH-2026-0838", applicant: "Sara Cherkaoui", type: "Event Permit", date: "Apr 24, 2026", status: "Approved" },
  { ref: "RKH-2026-0837", applicant: "Omar Belhaj", type: "Business Registration", date: "Apr 23, 2026", status: "Rejected" },
];

const ACTIVITY_LOG = [
  { id: 1, type: "approved", text: "RKH-2026-0840 approved by Inspector Hassan", time: "2 minutes ago" },
  { id: 2, type: "submitted", text: "Youssef Bennani submitted new commercial permit", time: "1 hour ago" },
  { id: 3, type: "review", text: "RKH-2026-0839 document review completed", time: "3 hours ago" },
];

const CATEGORIES = [
  { name: "Construction", value: 1420, color: "var(--primary)" },
  { name: "Business", value: 592, color: "oklch(0.556 0 0)" },
  { name: "Events", value: 313, color: "oklch(0.708 0 0)" },
  { name: "Other", value: 516, color: "oklch(0.87 0 0)" },
];

// --- Components ---

const StatCard = ({ title, value, trend, trendValue, icon: Icon }: any) => (
  <Card className="relative overflow-hidden border border-border/40 shadow-none bg-white">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3 text-foreground" />
            ) : trend === "down" ? (
              <TrendingDown className="w-3 h-3 text-muted-foreground" />
            ) : null}
            <span className="text-[10px] font-bold text-foreground">
              {trendValue}
            </span>
            <span className="text-[10px] text-muted-foreground ml-1">this month</span>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-primary/5 text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DonutChart = ({ data, total }: { data: typeof CATEGORIES, total: string }) => {
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativeValue = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {data.map((item, i) => {
            const startAngle = (cumulativeValue / totalValue) * 360;
            const sliceAngle = (item.value / totalValue) * 360;
            cumulativeValue += item.value;
            
            const radius = 35;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(sliceAngle / 360) * circumference} ${circumference}`;
            const strokeDashoffset = -((startAngle / 360) * circumference);

            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-black leading-none text-foreground">{total}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Total</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-8 w-full">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-xs font-bold text-foreground">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardHome() {
  const { user } = useAuth();
  const role = user?.role || "citizen";

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-border/40 rounded-xl shadow-none cursor-pointer hover:bg-muted/50 transition-colors">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Apr 2026</span>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-border/40 bg-white">
            <Bell className="w-4 h-4" />
          </Button>
          <Button className="rounded-xl bg-primary text-primary-foreground gap-2 px-6 shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="font-bold">New Permit</span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {role === "authority" ? (
          <>
            <StatCard title="Total Permits" value="2,841" trend="up" trendValue="+8.4%" icon={FileText} />
            <StatCard title="Pending Review" value="143" trend="down" trendValue="+12" icon={Clock} />
            <StatCard title="Approved" value="2,519" trend="up" trendValue="88.7%" icon={CheckCircle2} />
            <StatCard title="Active Citizens" value="18.2k" trend="up" trendValue="+341" icon={Users} />
          </>
        ) : role === "architect" ? (
          <>
            <StatCard title="Client Projects" value="24" trend="up" trendValue="+2" icon={Users} />
            <StatCard title="Pending Submissions" value="5" trend="down" trendValue="-1" icon={Clock} />
            <StatCard title="Approved Plans" value="18" trend="up" trendValue="75%" icon={CheckCircle2} />
            <StatCard title="Upcoming Deadlines" value="3" trend="up" trendValue="High" icon={Calendar} />
          </>
        ) : (
          <>
            <StatCard title="My Applications" value="4" trend="up" trendValue="+1" icon={FileText} />
            <StatCard title="Under Review" value="2" trend="none" trendValue="0" icon={Clock} />
            <StatCard title="Issued Permits" value="2" trend="up" trendValue="+1" icon={CheckCircle2} />
            <StatCard title="Notifications" value="12" trend="up" trendValue="+3" icon={Bell} />
          </>
        )}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border/40 shadow-none bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-bold">Recent Permit Applications</CardTitle>
            <Button variant="link" className="text-primary font-bold text-xs p-0 h-auto">View all</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Ref No.</th>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Permit Type</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {RECENT_APPLICATIONS.map((app, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors cursor-pointer group">
                      <td className="px-6 py-4 text-xs font-bold text-muted-foreground">{app.ref}</td>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">{app.applicant}</td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{app.type}</td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{app.date}</td>
                      <td className="px-6 py-4 text-right">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-bold border-border/40 bg-white",
                            app.status === "Approved" ? "text-foreground" :
                            app.status === "Pending" ? "text-muted-foreground" :
                            app.status === "In Review" ? "text-foreground/80" :
                            "text-muted-foreground/60"
                          )}
                        >
                          <div className={cn(
                            "w-1 h-1 rounded-full mr-2 inline-block",
                            app.status === "Approved" ? "bg-primary" : "bg-muted-foreground"
                          )} />
                          {app.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 shadow-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-bold">Permit Categories</CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground h-auto p-0">Details</Button>
          </CardHeader>
          <CardContent className="p-8">
            <DonutChart data={CATEGORIES} total="2,841" />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border/40 shadow-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
            <Button variant="link" className="text-primary font-bold text-xs p-0 h-auto">View log</Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {ACTIVITY_LOG.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                    {activity.type === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : 
                     activity.type === 'submitted' ? <FileText className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 shadow-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-bold">Quick Services</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { title: "Construction Permit", desc: "Residential & commercial", icon: Building },
                { title: "Business License", desc: "New registration & renewal", icon: Briefcase },
                { title: "Event Planning", desc: "Public & private gatherings", icon: Music },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-muted/10 transition-all cursor-pointer group border border-border/40">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                      <service.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{service.title}</p>
                      <p className="text-xs text-muted-foreground">{service.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
