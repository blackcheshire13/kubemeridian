// KubeMeridian is archived. One rule for which pages belong to it (archived notice, social
// card) and one place for the last release — shared by the theme and the build helpers.
export const KM_LAST_RELEASE = 'v2.5.2';
export const KM_RELEASE_URL = `https://github.com/blackcheshire13/kubemeridian/releases/tag/${KM_LAST_RELEASE}`;

/** @param {string} relativePath page source path, e.g. "kubemeridian.md" or "guide/install.md" */
export function isKubeMeridianPage(relativePath) {
  return relativePath === 'kubemeridian.md' || relativePath.startsWith('guide/');
}
