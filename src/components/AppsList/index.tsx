import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import { CURRENT_SURFACE, PLATFORMS } from '@site/src/data/platforms';
import styles from './styles.module.css';

/** The `/apps` cards: every released surface, from `src/data/platforms.ts`. */
export default function AppsList(): ReactNode {
  return (
    <div className={styles.grid}>
      {PLATFORMS.map((platform) => {
        const current = platform.id === CURRENT_SURFACE;
        return (
          <article key={platform.id} className={styles.card}>
            <span className={styles.kicker}>{platform.name}</span>
            <Heading as="h2" className={styles.title}>{platform.title}</Heading>
            <p>{platform.text}</p>
            {current
              ? <span className={styles.here}>You're reading it</span>
              : <Link className={platform.primary ? 'button button--primary' : 'button button--secondary'} href={platform.href}>{platform.cta}</Link>}
          </article>
        );
      })}
    </div>
  );
}
