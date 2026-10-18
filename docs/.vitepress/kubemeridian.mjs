// KubeMeridian is archived. One rule for which pages belong to it (archived notice, social
// card), shared by the theme and the build helpers. KM_LAST_RELEASE feeds the notice and the
// homepage card; markdown cannot import it, so a new tag must also be updated by hand in
// guide/install.md, kubemeridian.md, about.md and the root README.md.
export const KM_LAST_RELEASE = 'v2.5.2';
export const KM_RELEASE_URL = `https://github.com/blackcheshire13/kubemeridian/releases/tag/${KM_LAST_RELEASE}`;

/** @param {string} relativePath page source path, e.g. "kubemeridian.md" or "guide/install.md" */
export function isKubeMeridianPage(relativePath) {
  return relativePath === 'kubemeridian.md' || relativePath.startsWith('guide/');
}
