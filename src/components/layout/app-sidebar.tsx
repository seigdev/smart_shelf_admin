
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BoxesIcon,
  BrainIcon,
  FileTextIcon,
  GitBranchPlusIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  BellIcon,
  MailIcon,
  ShieldIcon,
  PlusCircleIcon,
  ListOrderedIcon,
  LayoutPanelLeftIcon, // Or LibrarySquareIcon, ArchiveIcon
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { ShelfPilotLogo } from '@/components/icons/shelf-pilot-logo';

const mainDashboardNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
];

const inventoryNavItems = [
  { href: '/inventory', label: 'Browse Inventory', icon: BoxesIcon },
  { href: '/inventory/add', label: 'Add Item', icon: PlusCircleIcon },
];

const shelfManagementNavItems = [
  { href: '/inventory/shelves', label: 'View Shelves', icon: ListOrderedIcon },
  { href: '/inventory/shelves/add', label: 'Register Shelf', icon: LayoutPanelLeftIcon },
  { href: '/inventory/optimize-shelf', label: 'Optimize Placement', icon: BrainIcon },
];

const requestsNavItems = [
 { href: '/requests', label: 'Requests', icon: GitBranchPlusIcon },
];

const adminNavItems = [
  { href: '/users', label: 'User Management', icon: UsersIcon },
  { href: '/invoices', label: 'Invoices', icon: FileTextIcon },
];

const systemNavItems = [
  { href: '/settings', label: 'Configuration', icon: SettingsIcon },
  { href: '/alerts', label: 'Alerts', icon: BellIcon },
  { href: '/notifications', label: 'Notifications', icon: MailIcon },
  { href: '/security', label: 'Security', icon: ShieldIcon },
];

export function AppSidebar() {
  const pathname = usePathname();

  const renderNavItems = (items: { href: string; label: string; icon: React.ElementType }[]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <Link href={item.href} passHref legacyBehavior>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
            tooltip={item.label}
            className="justify-start"
          >
            <a>
              <item.icon />
              <span>{item.label}</span>
            </a>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="flex items-center justify-start p-2 sticky top-0 bg-sidebar z-10 group-data-[collapsible=icon]:justify-center">
        <Link href="/dashboard" className="flex items-center gap-2 p-2 overflow-hidden group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:gap-0">
          <ShelfPilotLogo className="h-6 w-6 text-sidebar-primary shrink-0" />
          <span className="font-semibold text-lg text-sidebar-foreground group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-opacity duration-200">
            ShelfPilot
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderNavItems(mainDashboardNavItems)}
            </SidebarGroupContent>
          </SidebarGroup>
           <SidebarGroup>
            <SidebarGroupLabel>Inventory</SidebarGroupLabel>
            <SidebarGroupContent>{renderNavItems(inventoryNavItems)}</SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Shelf Management</SidebarGroupLabel>
            <SidebarGroupContent>{renderNavItems(shelfManagementNavItems)}</SidebarGroupContent>
          </SidebarGroup>
           <SidebarGroup>
            <SidebarGroupLabel>Operations</SidebarGroupLabel>
            <SidebarGroupContent>{renderNavItems(requestsNavItems)}</SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>{renderNavItems(adminNavItems)}</SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>{renderNavItems(systemNavItems)}</SidebarGroupContent>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
