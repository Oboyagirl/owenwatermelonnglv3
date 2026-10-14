/**
 * Utility to resolve asset URLs across different hosting environments:
 * - Local development (http://localhost:3000)
 * - AI Studio preview (https://ais-dev-...run.app)
 * - GitHub Pages with repository subpath (https://<username>.github.io/<repo-name>/)
 * - GitHub Pages with custom domain (https://<custom-domain>/)
 */

export function resolveAssetUrl(url: string | undefined | null): string {
  if (!url) return '';

  const trimmed = url.trim();
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  // Remove all leading slashes
  const cleanPath = trimmed.replace(/^\/+/, '');

  // Using './' ensures that whether the app is hosted at domain root or a GitHub Pages subpath,
  // relative assets resolve against the current base URL.
  return `./${cleanPath}`;
}
