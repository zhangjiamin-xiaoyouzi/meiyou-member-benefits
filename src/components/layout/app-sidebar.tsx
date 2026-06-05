'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Puzzle,
  Gift,
  CalendarDays,
  ChevronDown,
  Settings,
  Sparkles,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

type NavGroup = { title: string; icon: React.ComponentType<{ className?: string }>; children: { title: string; url: string; icon: React.ComponentType<{ className?: string }>; description?: string; disabled?: boolean }[] };
type NavLeaf = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };
type NavItem = NavGroup | NavLeaf;

const navItems: NavItem[] = [
  {
    title: '活动中心',
    icon: Sparkles,
    children: [

      {
        title: '模板管理（本期不做）',
        url: '/templates',
        icon: Puzzle,
        description: '研发定义的活动模板与组件',
        disabled: true,
      },
      {
        title: '活动列表',
        url: '/activities',
        icon: CalendarDays,
        description: '运营创建与管理活动',
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-[var(--color-meiyou-border)]">
      <SidebarHeader className="border-b border-[var(--color-meiyou-border)] px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-meiyou text-white text-sm font-bold">
            柚
          </div>
          <div>
            <span className="text-sm font-semibold text-[var(--color-meiyou-text-primary)]">美柚订阅管理</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) =>
                'children' in item ? (
                  <Collapsible
                    key={item.title}
                    defaultOpen
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className="hover:bg-meiyou-bg data-[active=true]:bg-meiyou-light data-[active=true]:text-meiyou"
                          isActive={item.children.some((c) => pathname === c.url || pathname.startsWith(c.url + '/'))}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={!child.disabled && (pathname === child.url || pathname.startsWith(child.url + '/'))}
                                className={`hover:bg-meiyou-bg data-[active=true]:bg-meiyou-light data-[active=true]:text-meiyou ${child.disabled ? 'opacity-50 cursor-default' : ''}`}
                              >
                                <Link href={child.url}>
                                  <child.icon className="h-4 w-4" />
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="hover:bg-meiyou-bg data-[active=true]:bg-meiyou-light data-[active=true]:text-meiyou"
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-[var(--color-meiyou-border)] p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-meiyou-bg text-[var(--color-meiyou-text-secondary)]">
              <Settings className="h-4 w-4" />
              <span className="text-sm">系统设置</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
