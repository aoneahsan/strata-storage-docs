import React, { useEffect, useState } from 'react';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const VERIFY = 'https://fileshub.zaions.com/api/licensing/v1/licenses/verify';
const VERIFY_PAGE = 'https://stratastorage.aoneahsan.com/verify-license';

/**
 * Dormant white-label licence check. Our own docs build has no `WHITE_LABEL_KEY`, so this returns at once and makes
 * no request. A licensed docs build checks its key against the current host on start and when the tab comes back,
 * never on a timer. Failures and timeouts fail open; the answer is kept in memory only, and nothing is deleted.
 */
export default function LicenceCheck(): React.ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const key = String(siteConfig.customFields?.whiteLabelKey ?? '').trim();
  const [inactive, setInactive] = useState(false);

  useEffect(() => {
    if (!key) return undefined;
    let alive = true;
    const check = () => {
      const query = new URLSearchParams({ key, host: window.location.host });
      fetch(`${VERIFY}?${query.toString()}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) })
        .then((response) => (response.ok ? response.json() : null))
        .then((body: { data?: { verdict?: string; host_authorized?: boolean } } | null) => {
          const data = body?.data;
          if (!alive || !data) return;
          setInactive(['revoked', 'not_found', 'invalid_format'].includes(data.verdict ?? '') || data.host_authorized === false);
        })
        .catch(() => undefined);
    };
    const resume = () => { if (document.visibilityState === 'visible') check(); };
    check();
    document.addEventListener('visibilitychange', resume);
    return () => { alive = false; document.removeEventListener('visibilitychange', resume); };
  }, [key]);

  if (!inactive) return null;
  return (
    <section className="docs-release-gate" role="alertdialog" aria-modal="true" aria-labelledby="docs-licence-title">
      <div className="docs-release-panel docs-licence-panel">
        <h2 id="docs-licence-title"><Translate id="docs.licence.title">This licence is not active.</Translate></h2>
        <p><Translate id="docs.licence.body">These docs belong to a white-label build whose licence does not cover this site. The package itself keeps working.</Translate></p>
        <a className="button button--primary" href={`${VERIFY_PAGE}?key=${encodeURIComponent(key)}`}>
          <Translate id="docs.licence.action">Check the licence</Translate>
        </a>
      </div>
    </section>
  );
}
