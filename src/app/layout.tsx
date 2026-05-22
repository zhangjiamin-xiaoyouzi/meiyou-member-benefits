import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { AdminLayout } from '@/components/layout/admin-layout';

export const metadata: Metadata = {
  title: {
    default: '美柚订阅后台 - 活动管理',
    template: '%s | 美柚订阅后台',
  },
  description: '美柚会员订阅后台活动管理系统，支持模板配置、营销策略管理、活动发布',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
