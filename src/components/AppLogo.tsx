/** The app icon (the same file as the favicon), shown next to a page title. Decorative: the title names the page. */
export function AppLogo({ size = 22 }: { size?: number }) {
  return <img src="/favicon.svg" alt="" aria-hidden="true" width={size} height={size} className="shrink-0 block" />;
}
