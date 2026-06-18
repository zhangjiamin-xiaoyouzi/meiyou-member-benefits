'use client';

import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';

const pathMap: Record<string, string> = {
  '/': '活动概览',
  '/templates': '模板管理',
  '/promo-patches': '营销策略库',
  '/activities': '活动列表',
  '/activities/new': '新建活动',
};

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; href: string; isCurrent: boolean }[] = [
    { label: '活动中心', href: '/', isCurrent: false },
  ];

  if (pathname === '/') {
    crumbs[0].isCurrent = true;
    return crumbs;
  }

  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i];
    const label = pathMap[currentPath] || segments[i];
    crumbs.push({
      label,
      href: currentPath,
      isCurrent: i === segments.length - 1,
    });
  }

  return crumbs;
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--color-meiyou-border)] bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-[var(--color-meiyou-divider)]" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.href} className="flex items-center gap-1.5">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.isCurrent ? (
                      <BreadcrumbPage className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href} className="text-sm text-[var(--color-meiyou-text-secondary)] hover:text-meiyou">
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 overflow-auto bg-meiyou-bg p-6 min-h-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
