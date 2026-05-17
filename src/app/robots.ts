/**
 * This dynamic robots handler has been deactivated to resolve build-time data collection errors.
 * The production robots.txt is served statically from /public/robots.txt.
 * 
 * We return an empty export to satisfy the module system without triggering route generation.
 */
export default function robots() {
  return {};
}
