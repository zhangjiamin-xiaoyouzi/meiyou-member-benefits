import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 标准环境变量配置，无需依赖 Coze 平台
// 支持 .env 文件或系统环境变量
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.COZE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL 环境变量未设置，请在 .env 文件中配置');
}
if (!SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY 环境变量未设置，请在 .env 文件中配置');
}

function getSupabaseClient(token?: string): SupabaseClient {
  const key = token ? SUPABASE_ANON_KEY : (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

  const globalOptions: Record<string, any> = {};
  if (token) {
    globalOptions.headers = { Authorization: `Bearer ${token}` };
  }

  return createClient(SUPABASE_URL, key, {
    global: globalOptions,
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export { getSupabaseClient };
