import { themes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { readFileSync } from 'node:fs';
import llmsFull from './plugins/llms-full';
import sitePages, { withLastmod } from './plugins/site-pages';
import releaseWorker from './plugins/release-worker';
import compareLinkPolicy from './plugins/compare-link-policy';

/** The docs site's own address. `static/CNAME` holds the same host for GitHub Pages. */
const SITE_URL = 'https://stratastorage-docs.aoneahsan.com';
const MARKETING_URL = 'https://stratastorage.aoneahsan.com';
const GITHUB_URL = 'https://github.com/aoneahsan/strata-storage';
const NPM_URL = 'https://www.npmjs.com/package/strata-storage';

/** The release notes' route: the blog plugin's `routeBasePath` below, with its leading slash. */
const BLOG_PATH = '/blog';
const DOCS_VERSION = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version as string;
const RELEASE_CHANNEL = process.env.DOCS_RELEASE_CHANNEL === 'test' ? 'docs_test' : 'docs';
const RELEASE_ENDPOINT = 'https://ttehmrpntwcligdzehue.supabase.co/functions/v1/release-check';

/** Internal docs files that must never ship: excluded from the docs plugin and from `/llms-full.txt` alike. */
const INTERNAL_FILES = ['MANUAL-TASKS.md', 'PACKAGES.md', 'REPORTED-ISSUES.md', 'RESOLVED-ISSUES.md'];

/** Each generated category index (an indexed URL, kept) → the docs folder it lists, for its sitemap lastmod. */
const CATEGORY_ROOTS = {
  '/category/api-reference': '/api',
  '/category/guides': '/guides',
  '/category/examples': '/examples',
  '/category/reference': '/reference',
};

const config: Config = {
  title: 'Strata Storage',
  tagline: 'Zero-dependency universal storage for web, Android, and iOS — one unified API',
  favicon: 'img/favicon.svg',

  url: SITE_URL,
  baseUrl: '/',
  customFields: { docsVersion: DOCS_VERSION, releaseChannel: RELEASE_CHANNEL, releaseEndpoint: RELEASE_ENDPOINT },

  organizationName: 'aoneahsan',
  projectName: 'strata-storage-docs',

  future: { v4: true },

  // The build is the link checker: a broken link, anchor or route fails it.
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',

  trailingSlash: false,

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    localeConfigs: { en: { htmlLang: 'en-US' } },
  },

  markdown: {
    // Parse `.md` as CommonMark (not MDX) so TypeScript generics like `Map<K, V>` and `{ ... }` object literals in
    // prose don't break compilation.
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'throw',
      onBrokenMarkdownImages: 'throw',
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: './docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/aoneahsan/strata-storage-docs/edit/main/',
          showLastUpdateTime: true,
          // The site speaks as the Strata Storage team, so no person's name is shown on a page.
          showLastUpdateAuthor: false,
          rehypePlugins: [compareLinkPolicy],
          // `exclude` REPLACES the plugin defaults, so the defaults are restated here.
          exclude: [
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/_*/**',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__tests__/**',
            ...INTERNAL_FILES,
          ],
        },
        blog: {
          path: 'blog',
          routeBasePath: 'blog',
          blogTitle: 'Strata Storage release notes',
          blogDescription: 'Every Strata Storage release, newest first: what changed and what to do about it.',
          blogSidebarTitle: 'Recent releases',
          showReadingTime: false,
          // A post's last update comes from git: shown under the post, and its sitemap lastmod. No name is shown.
          showLastUpdateTime: true,
          showLastUpdateAuthor: false,
          onInlineAuthors: 'throw',
          onInlineTags: 'throw',
          onUntruncatedBlogPosts: 'throw',
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            title: 'Strata Storage release notes',
            description: 'Every Strata Storage release, newest first.',
            copyright: 'Made by the Strata Storage team.',
            language: 'en-US',
          },
        },
        pages: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          // Every URL carries a truthful lastmod and nothing else: search engines ignore changefreq and priority.
          lastmod: 'date',
          changefreq: null,
          priority: null,
          filename: 'sitemap.xml',
          ignorePatterns: ['/tags/**', '/blog/tags/**', '/blog/archive', '/blog/authors/**', '/search'],
          // A page git cannot date (the release list, a category index, /sitemap, /feed) takes the newest date it lists.
          createSitemapItems: async ({ defaultCreateSitemapItems, ...params }) =>
            withLastmod(await defaultCreateSitemapItems(params), BLOG_PATH, CATEGORY_ROOTS),
        },
      } satisfies Preset.Options,
    ],
  ],

  // `/sitemap` and `/feed` for people, `/feed.xml` beside `/sitemap.xml` for machines, `/llms-full.txt` for LLMs.
  plugins: [sitePages({ blogPath: BLOG_PATH }), llmsFull({ skipFiles: INTERNAL_FILES }), releaseWorker({ version: DOCS_VERSION })],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en'],
        indexDocs: true,
        indexBlog: true,
        indexPages: false,
        docsRouteBasePath: '/',
        blogRouteBasePath: '/blog',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 60,
      },
    ],
  ],

  // 🔴 Never a canonical here: the theme emits one per route, and a global one doubles every page's (SA-P01).
  headTags: [
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: `${SITE_URL}/`,
            name: 'Strata Storage Documentation',
            description:
              'Documentation for Strata Storage, a zero-dependency universal storage library with one unified API across web, Android, and iOS.',
            publisher: { '@id': `${SITE_URL}/#organization` },
            inLanguage: 'en',
          },
          {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            name: 'Strata Storage Team',
            url: MARKETING_URL,
            email: 'aoneahsan@gmail.com',
            sameAs: [GITHUB_URL, NPM_URL],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'aoneahsan@gmail.com',
              contactType: 'developer support',
            },
          },
          {
            '@type': 'SoftwareSourceCode',
            '@id': `${SITE_URL}/#software`,
            name: 'Strata Storage',
            description:
              'Zero-dependency universal storage plugin providing a unified API for all storage operations across web, Android, and iOS — localStorage, IndexedDB, cookies, Cache API, SQLite, Preferences, and Keychain/Keystore, plus encryption, compression, TTL, querying, and cross-tab sync.',
            codeRepository: GITHUB_URL,
            programmingLanguage: ['TypeScript', 'Swift', 'Java'],
            runtimePlatform: ['Web', 'Android', 'iOS', 'Capacitor'],
            license: 'https://opensource.org/license/mit',
            author: { '@id': `${SITE_URL}/#organization` },
            url: NPM_URL,
            sameAs: [GITHUB_URL, NPM_URL],
            keywords:
              'storage, capacitor, ionic, react, vue, angular, localStorage, indexedDB, sqlite, keychain, preferences, zero-dependencies, cross-platform',
          },
        ],
      }),
    },
  ],

  themeConfig: {
    image: 'img/social-card.png',
    metadata: [
      {
        name: 'keywords',
        content:
          'strata storage, universal storage, capacitor storage, indexeddb, sqlite, keychain, encryption, ttl, cross-platform storage, zero dependency storage',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { property: 'og:type', content: 'website' },
    ],
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Strata Storage',
      logo: {
        alt: 'Strata Storage logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        { to: '/quick-start', label: 'Quick Start', position: 'left' },
        { to: '/api', label: 'API', position: 'left' },
        { to: BLOG_PATH, label: 'Releases', position: 'left' },
        { to: '/ai', label: 'For AI', position: 'left' },
        { href: MARKETING_URL, label: 'Website', position: 'right' },
        { href: NPM_URL, label: 'npm', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/' },
            { label: 'Installation', to: '/installation' },
            { label: 'Quick Start', to: '/quick-start' },
            { label: 'API Reference', to: '/api' },
            { label: 'For AI Agents', to: '/ai' },
          ],
        },
        {
          title: 'Support',
          items: [
            { label: 'Website', href: MARKETING_URL },
            { label: 'Contact / Support', href: `${MARKETING_URL}/contact` },
            { label: 'Email', href: 'mailto:aoneahsan@gmail.com' },
            { label: 'GitHub issues', href: `${GITHUB_URL}/issues` },
          ],
        },
        {
          title: 'Site',
          // Files written after the pages are built (feeds, sitemap, llms.txt) are invisible to the link checker, so
          // they use `pathname://`, which links to the file as it is without routing.
          items: [
            { label: 'Release notes', to: BLOG_PATH },
            { label: 'Feed', to: '/feed' },
            { label: 'Sitemap', to: '/sitemap' },
            { label: 'feed.xml', href: 'pathname:///feed.xml' },
            { label: 'sitemap.xml', href: 'pathname:///sitemap.xml' },
            { label: 'llms.txt', href: 'pathname:///llms.txt' },
          ],
        },
        {
          title: 'More',
          items: [{ label: 'npm', href: NPM_URL }, { label: 'GitHub', href: GITHUB_URL }],
        },
      ],
      copyright: `Made by the Strata Storage team · © ${new Date().getFullYear()} · Built with Docusaurus`,
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ['swift', 'kotlin', 'java', 'bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
