// KubeMeridian is archived: its plugin source and user guide live at the last release tag,
// and the site keeps one archive page. KM_LAST_RELEASE feeds the archived notice; markdown
// cannot import it, so kubemeridian.md and the root README.md repeat it by hand.
export const KM_LAST_RELEASE = 'v2.5.2';
export const KM_RELEASE_URL = `https://github.com/blackcheshire13/kubemeridian/releases/tag/${KM_LAST_RELEASE}`;

/** @param {string} relativePath page source path, e.g. "kubemeridian.md" */
export function isKubeMeridianPage(relativePath) {
  return relativePath === 'kubemeridian.md';
}
