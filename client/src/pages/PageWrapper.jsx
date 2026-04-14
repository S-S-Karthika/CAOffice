/**
 * PageWrapper.jsx
 * Drop-in wrapper: injects SHELL_CSS + AppShell around any page body.
 * 
 * Usage:
 *   import PageWrapper from "./PageWrapper";
 *   export default function MyPage() {
 *     return (
 *       <PageWrapper activeKey="works" title="Works" subtitle="All client works">
 *         {... your existing content JSX ...}
 *       </PageWrapper>
 *     );
 *   }
 */
import { AppShell, SHELL_CSS } from "./AppShell";

export default function PageWrapper({ activeKey, title, subtitle, rightAction, hasDot, children }) {
  return (
    <>
      <style>{SHELL_CSS}</style>
      <AppShell activeKey={activeKey} title={title} subtitle={subtitle} rightAction={rightAction} hasDot={hasDot}>
        {children}
      </AppShell>
    </>
  );
}
