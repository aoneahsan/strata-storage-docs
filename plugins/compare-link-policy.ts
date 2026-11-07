/**
 * Rehype plugin for the comparison guides under `docs/compare/`. A link to another project exists so readers can
 * check us, so it opens separately and passes no ranking signal. Other docs pages are not touched.
 */
const OWNED_HOSTS = ['stratastorage-docs.aoneahsan.com', 'stratastorage.aoneahsan.com'];

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/**
 * Whether a link leaves the project's own sites.
 *
 * @param href - the link's address
 * @returns true for an absolute http(s) link to any other host
 */
function isThirdParty(href: unknown): boolean {
  if (typeof href !== 'string' || !/^https?:\/\//.test(href)) return false;
  return !OWNED_HOSTS.includes(new URL(href).hostname);
}

/**
 * Applies the policy to every link below a node.
 *
 * @param node - the node to walk
 */
function applyPolicy(node: HastNode): void {
  if (node.tagName === 'a' && node.properties && isThirdParty(node.properties.href)) {
    node.properties.target = '_blank';
    node.properties.rel = 'noopener noreferrer nofollow';
  }
  node.children?.forEach(applyPolicy);
}

/** @returns the transformer Docusaurus runs on each docs page */
export default function compareLinkPolicy() {
  return (tree: HastNode, file: { path?: string }): void => {
    if (file.path?.replaceAll('\\', '/').includes('/docs/compare/')) applyPolicy(tree);
  };
}
