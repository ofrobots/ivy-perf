import {getRendererFactory} from './server_renderer_factory';

const createDocument = require('./undom/undom').default;

// Faster server renders w/ Prod mode (dev mode never needed)
(global as any).ngDevMode = false;

// * NOTE :: leave this as require() since this file is built Dynamically from
// webpack
const {AppComponent, TohComponent, renderComponent, DomSanitizerImpl} = require('./dist/server/main');

let appComponent = TohComponent;
if (typeof process !== 'undefined') {
  if (process.argv.length > 2 && process.argv[2] === 'hw') {
    appComponent = AppComponent;
  }
}

export function render(): Document {
  const doc: Document = createDocument();
  const host = doc.createElement('app-root');
  doc.body.appendChild(host);

  const rendererFactory = getRendererFactory(doc);
  const sanitizer = new DomSanitizerImpl(doc);
  renderComponent(appComponent, {rendererFactory, host, sanitizer});
  return doc;
}

// Do a sanity check on the output.
(function test() {
  console.log(render().documentElement.toString());
})();

// Time X iterations.
console.time('timer');
for (let i = 0; i < 100000; i++) {
  const output = render().documentElement.toString();
}
console.timeEnd('timer');
