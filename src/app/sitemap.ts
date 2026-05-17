/**
 * This dynamic sitemap handler has been deactivated to resolve build-time data collection errors.
 * The production sitemap.xml is served statically from /public/sitemap.xml.
 * 
 * We return an empty array to satisfy the module system without triggering route generation.
 */
export default function sitemap() {
  return [];
}
