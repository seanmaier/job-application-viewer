import { Fragment } from 'react';
import type { ReactNode } from 'react';

/**
 * Renders a `<br />`-separated stack of lines, dropping any falsy entry
 * entirely (not just its content) so an empty/unset field never leaves a
 * stray blank line behind.
 */
export function joinLines(items: Array<ReactNode | false | null | undefined>): ReactNode {
  const visible = items.filter(Boolean);
  return visible.map((item, i) => (
    <Fragment key={i}>
      {item}
      {i < visible.length - 1 && <br />}
    </Fragment>
  ));
}
