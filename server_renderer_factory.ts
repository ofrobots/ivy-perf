import {ObjectOrientedRenderer3, RendererFactory3} from '@angular/core/src/render3/interfaces/renderer';

export function getRendererFactory(doc: Document): RendererFactory3 {
  return {
    createRenderer: (hostElement: any, rendererType: any) => {
      return doc;
    }
  };
}
