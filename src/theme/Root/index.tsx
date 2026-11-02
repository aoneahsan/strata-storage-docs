import React, { useEffect, useRef, useState } from 'react';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import { defineStorage } from 'strata-storage';

type Release = { version: string; severity: 'normal' | 'urgent'; reason: string; updateUrl: string };
type Notice = { version: string; reason: string; startId: string };
type Decision = { kind: 'none' } | { kind: 'notice' | 'block'; release: Release };
const noticeKey = 'docs-release-notice';
const storage = defineStorage({ namespace: 'strata-storage-docs', keyPrefix: false, defaultStorages: ['localStorage', 'memory'] });
const local = { storage: 'localStorage' as const };

function versionParts(version: string): number[] | null {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) return null;
  const parts = version.split('.').map(Number);
  return parts.every(Number.isSafeInteger) ? parts : null;
}

function compare(left: string, right: string): number | null {
  const a = versionParts(left); const b = versionParts(right);
  if (!a || !b) return null;
  for (let index = 0; index < 3; index++) {
    if (a[index] !== b[index]) return a[index] < b[index] ? -1 : 1;
  }
  return 0;
}

function readNotice(): Notice | null {
  try {
    const value = storage.getSync<Notice>(noticeKey, local);
    if (value && typeof value === 'object' && typeof value.version === 'string' &&
        typeof value.reason === 'string' && typeof value.startId === 'string' &&
        compare(value.version, value.version) === 0 && value.reason.length <= 280) return value;
  } catch { /* A storage failure cannot block a reader. */ }
  return null;
}

function writeNotice(value: Notice | null): void {
  try {
    if (value) storage.setSync(noticeKey, value, local);
    else storage.removeSync(noticeKey, local);
  } catch { /* The notice remains visible for this page run. */ }
}

function parseRelease(value: unknown, channel: string): Release | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  if (row.channel !== channel || typeof row.version !== 'string' || compare(row.version, row.version) !== 0 ||
      (row.severity !== 'normal' && row.severity !== 'urgent') || typeof row.reason !== 'string' ||
      row.reason.length < 1 || row.reason.length > 280 || typeof row.updateUrl !== 'string') return null;
  try {
    const url = new URL(row.updateUrl);
    if (url.origin !== 'https://stratastorage-docs.aoneahsan.com' || url.username || url.password) return null;
    return { version: row.version, severity: row.severity, reason: row.reason, updateUrl: url.toString() };
  } catch { return null; }
}

function decide(running: string, release: Release | null, stored: Notice | null, startId: string): Decision {
  if (!release) {
    if (stored && stored.startId !== startId && compare(running, stored.version) === -1)
      return { kind: 'block', release: { version: stored.version, severity: 'normal', reason: stored.reason, updateUrl: '' } };
    return { kind: 'none' };
  }
  if (compare(running, release.version) !== -1) return { kind: 'none' };
  if (release.severity === 'urgent' || stored?.version === release.version && stored.startId !== startId)
    return { kind: 'block', release };
  return { kind: 'notice', release };
}

function DocsReleaseGate() {
  const { siteConfig } = useDocusaurusContext();
  const { docsVersion, releaseChannel, releaseEndpoint } = siteConfig.customFields as Record<string, string>;
  const location = useLocation();
  const startId = useRef<string | null>(null);
  const worker = useRef<ServiceWorkerRegistration | null>(null);
  const pendingReload = useRef(false);
  const lastWorkerCheck = useRef(0);
  const button = useRef<HTMLButtonElement>(null);
  const [decision, setDecision] = useState<Decision>({ kind: 'none' });
  const blocked = decision.kind === 'block';

  useEffect(() => {
    let active = true;
    const openedAt = Date.now();
    startId.current = crypto.randomUUID();
    const saved = readNotice();
    setDecision(decide(docsVersion, null, saved, startId.current));

    async function checkRelease() {
      let release: Release | null = null;
      try {
        const response = await fetch(`${releaseEndpoint}?channel=${releaseChannel}`, { cache: 'no-store' });
        if (response.ok) {
          const body: unknown = await response.json();
          if (body && typeof body === 'object' && 'release' in body)
            release = parseRelease(body.release, releaseChannel);
        }
      } catch { /* Offline checks fail open except a prior normal notice. */ }
      if (!active || !startId.current) return;
      const stored = readNotice();
      const next = decide(docsVersion, release, stored, startId.current);
      if (next.kind === 'notice') writeNotice({ version: next.release.version, reason: next.release.reason, startId: startId.current });
      else if (next.kind === 'none' && (release || stored && compare(docsVersion, stored.version) !== -1)) writeNotice(null);
      setDecision(next);
    }
    async function checkWorker(force = false) {
      if (!worker.current || !force && Date.now() - lastWorkerCheck.current < 60_000) return;
      lastWorkerCheck.current = Date.now();
      try {
        await worker.current.update();
        worker.current.waiting?.postMessage({ type: 'SKIP_WAITING' });
      } catch { /* The record gate still checks independently. */ }
    }
    const hadController = { value: Boolean(navigator.serviceWorker?.controller) };
    function controllerChanged() {
      if (!hadController.value) { hadController.value = true; return; }
      if (Date.now() - openedAt < 10_000 || document.visibilityState === 'hidden') window.location.reload();
      else pendingReload.current = true;
    }
    function resumed() {
      if (document.visibilityState !== 'visible') return;
      void checkRelease();
      void checkWorker();
    }
    function hidden() {
      if (document.visibilityState === 'hidden' && pendingReload.current) window.location.reload();
      else resumed();
    }
    void checkRelease();
    const releaseTimer = window.setInterval(() => void checkRelease(), 15 * 60_000);
    const workerTimer = window.setInterval(() => void checkWorker(true), 30 * 60_000);
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('focus', resumed);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', controllerChanged);
      window.requestAnimationFrame(() => {
        void navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then((registration) => {
          worker.current = registration;
          void checkWorker(true);
        }).catch(() => { /* Layer 2 still works. */ });
      });
    }
    return () => {
      active = false;
      window.clearInterval(releaseTimer);
      window.clearInterval(workerTimer);
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('focus', resumed);
      navigator.serviceWorker?.removeEventListener('controllerchange', controllerChanged);
    };
  }, [docsVersion, releaseChannel, releaseEndpoint]);

  useEffect(() => {
    if (pendingReload.current) window.location.reload();
    else if (worker.current && Date.now() - lastWorkerCheck.current >= 60_000) void worker.current.update();
  }, [location.pathname]);

  useEffect(() => {
    if (!blocked) return;
    const gate = document.querySelector('.docs-release-gate');
    const prior = Array.from(gate?.parentElement?.children ?? []).filter((element) => element !== gate)
      .map((element) => ({ element: element as HTMLElement, inert: (element as HTMLElement).inert }));
    prior.forEach(({ element }) => { element.inert = true; });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    button.current?.focus();
    return () => {
      prior.forEach(({ element, inert }) => { element.inert = inert; });
      document.body.style.overflow = overflow;
    };
  }, [blocked]);

  if (decision.kind === 'none') return null;
  const release = decision.release;
  async function update() {
    try {
      await worker.current?.update();
      worker.current?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    } finally {
      window.setTimeout(() => window.location.reload(), 8_000);
      if (release.updateUrl) window.location.assign(release.updateUrl);
      else window.location.reload();
    }
  }
  return (
    <section className={blocked ? 'docs-release-gate' : 'docs-release-notice'}
      role={blocked ? 'alertdialog' : 'status'} aria-modal={blocked ? 'true' : undefined}
      aria-live={blocked ? 'assertive' : 'polite'} aria-labelledby="docs-release-title"
      aria-describedby="docs-release-reason">
      <div className="docs-release-panel">
        <p><Translate id="docs.release.version">Required version</Translate>: {release.version}</p>
        <h2 id="docs-release-title">{blocked
          ? <Translate id="docs.release.block">Update required now.</Translate>
          : <Translate id="docs.release.notice">Update required next start.</Translate>}</h2>
        <p id="docs-release-reason">{release.reason}</p>
        <button ref={button} type="button" onClick={() => void update()}>
          <Translate id="docs.release.action">Update</Translate>
        </button>
      </div>
    </section>
  );
}

export default function Root({ children }: { children: React.ReactNode }): React.ReactNode {
  return <>{children}<DocsReleaseGate /></>;
}
