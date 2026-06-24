// The create-plugin copyFiles step only copies the APP plugin's logos. The
// bundled datasource references its own img/logo.svg, so copy it into dist after
// the webpack build (run from the `build` script).
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';

const src = 'src/datasource/img/logo.svg';
const destDir = 'dist/datasource/img';
if (existsSync(src) && existsSync('dist/datasource')) {
  mkdirSync(destDir, { recursive: true });
  copyFileSync(src, `${destDir}/logo.svg`);
  console.log('copied datasource logo -> dist/datasource/img/logo.svg');
}
