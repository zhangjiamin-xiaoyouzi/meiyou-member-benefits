'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
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
  SidebarGroupLabel,
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

const navItems = [
  {
    title: '活动概览',
    url: '/',
    icon: LayoutGrid,
  },
  {
    title: '活动中心',
    icon: Sparkles,
    children: [
      {
        title: '模板管理',
        url: '/templates',
        icon: Puzzle,
        description: '研发定义的活动模板与组件',
      },
      {
        title: '营销策略库',
        url: '/promo-patches',
        icon: Gift,
        description: '优惠、加赠等策略补丁',
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
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white text-sm font-bold">
            Mei
          </div>
            <span className="text-sm font-semibold text-slate-900">订阅管理系统</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) =>
                item.children ? (
                  <Collapsible
                    key={item.title}
                    defaultOpen
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className="hover:bg-slate-100 data-[active=true]:bg-rose-50 data-[active=true]:text-rose-600"
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
                                isActive={pathname === child.url || pathname.startsWith(child.url + '/')}
                                className="hover:bg-slate-100 data-[active=true]:bg-rose-50 data-[active=true]:text-rose-600"
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
                      className="hover:bg-slate-100 data-[active=true]:bg-rose-50 data-[active=true]:text-rose-600"
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
      <SidebarFooter className="border-t border-slate-200 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-slate-100 text-slate-500">
              <Settings className="h-4 w-4" />
              <span className="text-sm">系统设置</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
