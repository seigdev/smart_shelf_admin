'use client';

import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageTitle } from '@/components/common/page-title';
import { ActivityIcon, TrendingUpIcon, PackageIcon } from 'lucide-react';
import type { ChartConfig } from "@/components/ui/chart"; // Assuming ChartConfig might be needed if using ChartContainer

// Placeholder data
const usageTrendsData = [
  { month: 'Jan', itemsMoved: 400, requests: 240 },
  { month: 'Feb', itemsMoved: 300, requests: 139 },
  { month: 'Mar', itemsMoved: 200, requests: 380 },
  { month: 'Apr', itemsMoved: 278, requests: 300 },
  { month: 'May', itemsMoved: 189, requests: 480 },
  { month: 'Jun', itemsMoved: 239, requests: 380 },
];

const stockReportData = [
  { name: 'Electronics', stock: 4000, target: 2400 },
  { name: 'Books', stock: 3000, target: 1398 },
  { name: 'Clothing', stock: 2000, target: 5800 },
  { name: 'Home Goods', stock: 2780, target: 3908 },
  { name: 'Toys', stock: 1890, target: 4800 },
];

const activityLogsData = [
  { id: '1', activity: 'Item "Laptop Charger" added', user: 'Admin', timestamp: '2023-10-26 10:00 AM', details: 'Quantity: 50, Shelf: A3' },
  { id: '2', activity: 'Request #102 approved', user: 'Manager', timestamp: '2023-10-26 09:30 AM', details: 'Item: "Wireless Mouse", Quantity: 5' },
  { id: '3', activity: 'Stock updated for "Keyboard"', user: 'System', timestamp: '2023-10-26 08:15 AM', details: 'Quantity reduced by 2' },
  { id: '4', activity: 'User "JohnDoe" logged in', user: 'JohnDoe', timestamp: '2023-10-25 17:00 PM', details: 'IP: 192.168.1.10' },
];

const chartConfig = {
  itemsMoved: { label: "Items Moved", color: "hsl(var(--chart-1))" },
  requests: { label: "Requests", color: "hsl(var(--chart-2))" },
  stock: { label: "Current Stock", color: "hsl(var(--chart-1))" },
  target: { label: "Target Stock", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;


export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-background">
      <PageTitle title="Analytics Dashboard" description="Overview of your inventory and system activity." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,293</div>
            <p className="text-xs text-muted-foreground">+5.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Moved (This Month)</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <GitPullRequestIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">5 new since yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <BellIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">1 critical alert</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>Monthly items moved and requests.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageTrendsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend wrapperStyle={{fontSize: "12px"}}/>
                <Line type="monotone" dataKey="itemsMoved" name="Items Moved" stroke={chartConfig.itemsMoved.color} strokeWidth={2} dot={{ r: 4, fill: chartConfig.itemsMoved.color }} activeDot={{ r: 6 }}/>
                <Line type="monotone" dataKey="requests" name="Requests" stroke={chartConfig.requests.color} strokeWidth={2} dot={{ r: 4, fill: chartConfig.requests.color }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Reports</CardTitle>
            <CardDescription>Current stock levels by category.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockReportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend wrapperStyle={{fontSize: "12px"}}/>
                <Bar dataKey="stock" name="Current Stock" fill={chartConfig.stock.color} radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target Stock" fill={chartConfig.target.color} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Logs</CardTitle>
          <CardDescription>Latest system and user activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogsData.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.activity}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
