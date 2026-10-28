/**
 * Page SEO metadata defaults.
 * Live overrides are edited in Superadmin and stored in data/page-meta.json
 * via lib/pageMetaStore (server-only). Use toNextMetadata() in generateMetadata.
 */
export {
  DEFAULT_PAGE_META,
  PAGE_META_ADMIN_ROWS,
  type PageMetaEntry,
  type PageMetaKey,
} from '@/lib/pageMetaDefaults';

import { DEFAULT_PAGE_META } from '@/lib/pageMetaDefaults';

/** Static defaults — prefer toNextMetadata(key) at request time for admin edits. */
export const pageMeta = DEFAULT_PAGE_META;
