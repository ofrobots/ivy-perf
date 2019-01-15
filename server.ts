import * as domino from 'domino';
import * as fs from 'fs';
import {join} from 'path';
import {getRendererFactory} from './server_renderer_factory';

// Faster server renders w/ Prod mode (dev mode never needed)
(global as any).ngDevMode = false;

const DIST_FOLDER = join(process.cwd(), 'dist/browser');

// * NOTE :: leave this as require() since this file is built Dynamically from
// webpack
const {AppComponent, renderComponent} = require('./dist/server/main');

function render(): Document {
  const doc: Document = domino.createDocument('<app-root></app-root>');
  const rendererFactory = getRendererFactory(doc);
  renderComponent(AppComponent, {rendererFactory});
  return doc;
}

// Do a sanity check on the output.
(function test() {
  console.log(render().documentElement.outerHTML);
})();

// Time X iterations.
console.time('timer');
for (let i = 0; i < 10000; i++) {
  const output = render().documentElement.outerHTML;
}
console.timeEnd('timer');
