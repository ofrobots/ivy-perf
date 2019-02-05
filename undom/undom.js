import {
	toLower,
	splice,
	findWhere,
	createAttributeFilter
} from './util';

/*
const NODE_TYPES = {
	ELEMENT_NODE: 1,
	ATTRIBUTE_NODE: 2,
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4,
	ENTITY_REFERENCE_NODE: 5,
	COMMENT_NODE: 6,
	PROCESSING_INSTRUCTION_NODE: 7,
	DOCUMENT_NODE: 9
};
*/


function isElement(node) {
	return node.nodeType===1;
}

class Node {
	constructor(nodeType, nodeName) {
		this.nodeType = nodeType;
		this.nodeName = nodeName;
		this.childNodes = null;
	  this.parentNode = null;
	}
	get nextSibling() {
		const p = this.parentNode;
		if (p === null) return;
		const c = p.childNodes;
		if (c === null) return;
		return c[findWhere(c, this, true, true) + 1];
	}
	get previousSibling() {
		const p = this.parentNode;
		if (p === null) return;
		const c = p.childNodes;
		if (c === null) return;
		return c[findWhere(c, this, true, true) - 1];
	}
	get firstChild() {
		const c = this.childNodes;
		return c === null ? undefined : c[0];
	}
	get lastChild() {
	  const c = this.childNodes;
	  return c === null ? undefined : c[c.length - 1];
	}
	appendChild(child) {
		this.insertBefore(child);
		return child;
	}
	insertBefore(child, ref) {
		child.remove();
		child.parentNode = this;
		const c = this.childNodes;
		if (c === null) {
		  this.childNodes = [child];
		} else if (ref) {
		  splice(c, ref, child, true);
		} else {
		  c.push(child);
		}
		return child;
	}
	replaceChild(child, ref) {
		if (ref.parentNode===this) {
			this.insertBefore(child, ref);
			ref.remove();
			return ref;
		}
	}
	removeChild(child) {
		splice(this.childNodes, child, false, true);
		return child;
	}
	remove() {
		const p = this.parentNode;
		if (p !== null) p.removeChild(this);
	}
}


class Text extends Node {
	constructor(text) {
		super(3, '#text');					// TEXT_NODE
		this.nodeValue = text;
	}
	set textContent(text) {
		this.nodeValue = text;
	}
	get textContent() {
		return this.nodeValue;
	}
}

function serialize(el) {
 if (el.nodeType === 3) {
   return escape(el.nodeValue);
 } else {
   const nodeName = el.nodeName;
   let s = '<' + nodeName;
   const attributes = el.attributes;
   if (attributes !== null) {
     for (const [key, value] of attributes) {
       s += ' ' + key + '="' + escapeAttr(value) + '"';
     }
   }
   s += '>';
   const c = el.childNodes;
   if (c !== null) {
    for (let i = 0; i < c.length; ++i) {
      s += serialize(c[i]);
    }
   }
   s += '</' + nodeName + '>';
   return s;
 }
}

function escape(s) {
  for (var i = 0; i < s.length; ++i) {
    switch (s.charCodeAt(i)) {
      case 38: // &
      case 60: // <
      case 62: // >
      case 160: // non-breaking space
        return s.replace(/[&<>\u00A0]/g, function(c) {
          switch(c) {
          case '&': return '&amp;';
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '\u00A0': return '&nbsp;';
          }
        });
      default:
        break;
    }
  }
  return s;
}

function escapeAttr(s) {
  for (var i = 0; i < s.length; ++i) {
    switch (s.charCodeAt(i)) {
      case 34: // "
      case 38: // &
      case 160: // non-breaking space
        return s.replace(/[&"\u00A0]/g, function(c) {
          switch(c) {
          case '&': return '&amp;';
          case '"': return '&quot;';
          case '\u00A0': return '&nbsp;';
          }
        });
      default:
        break;
    }
  }
  return s;
}

class Element extends Node {
	constructor(nodeType, nodeName) {
		super(nodeType || 1, nodeName);		// ELEMENT_NODE
		this.attributes = null;
		// this.__handlers = null;
		this.eventIndex = 0;
		// this.style = {};
	}

	get className() { return this.getAttribute('class'); }
	set className(val) { this.setAttribute('class', val); }

	get cssText() { return this.getAttribute('style'); }
	set cssText(val) { this.setAttribute('style', val); }

	get children() {
	  const c = this.childNodes;
		return c === null ? [] : c.filter(isElement);
	}

	setAttribute(key, value) {
		//this.setAttributeNS(null, key, value);
		let attributes = this.attributes;
		if (attributes === null) {
		  this.attributes = attributes = new Map();
		}
		attributes.set(key, value);
	}
	getAttribute(key) {
	  const attributes = this.attributes;
	  if (attributes === null) return null;
		return attributes.get(key);
	}
	removeAttribute(key) {
	  const attributes = this.attributes;
	  if (attributes !== null) attributes.delete(key);
	}

	addEventListener(type, handler) {
		let val = this.getAttribute('jsaction') || '';
		if (val) {
			val += ';';
		}
		let typeStr = type === 'click' ? '' : type + ':';
		val += `${typeStr}${this.nodeName}.${this.eventIndex++}`;
		this.setAttribute('tsaction', val);
		// (this.__handlers[toLower(type)] || (this.__handlers[toLower(type)] = [])).push(handler);
	}
	/*
	removeEventListener(type, handler) {
		splice(this.__handlers[toLower(type)], handler, false, true);
	}
	dispatchEvent(event) {
		let t = event.target = this,
			c = event.cancelable,
			l, i;
		do {
			event.currentTarget = t;
			l = t.__handlers && t.__handlers[toLower(event.type)];
			if (l) for (i=l.length; i--; ) {
				if ((l[i].call(t, event) === false || event._end) && c) {
					event.defaultPrevented = true;
				}
			}
		} while (event.bubbles && !(c && event._stop) && (t=t.parentNode));
		return l!=null;
	}*/
	toString() {
		return serialize(this);
	}
}

class Event {
	constructor(type, opts) {
		this.type = type;
		this.bubbles = !!(opts && opts.bubbles);
		this.cancelable = !!(opts && opts.cancelable);
	}
	stopPropagation() {
		this._stop = true;
	}
	stopImmediatePropagation() {
		this._end = this._stop = true;
	}
	preventDefault() {
		this.defaultPrevented = true;
	}
}

class Document extends Element {
	constructor() {
		super(9, '#document');			// DOCUMENT_NODE
		this.defaultView = new DefaultView(this);
	}

	get document() { return this; }

	createElement(type) {
		return new Element(null, type);
	}

	createElementNS(ns, type) {
		let element = this.createElement(type);
		element.namespace = ns;
		return element;
	}

	createTextNode(text) {
		return new Text(text);
	}
}


class DefaultView {
  constructor(document) { this.document = document; }
}

const CONSTRUCTORS = { Document, Node, Text, Element, SVGElement: Element, Event };
Object.assign(DefaultView.prototype, CONSTRUCTORS);
Object.assign(Document.prototype, CONSTRUCTORS);


/** Create a minimally viable DOM Document
 *	@returns {Document} document
 */
export default function createDocument() {
	let document = new Document();
	document.appendChild(
		document.documentElement = document.createElement('html')
	);
	document.documentElement.appendChild(
		document.head = document.createElement('head')
	);
	document.documentElement.appendChild(
		document.body = document.createElement('body')
	);
	return document;
}
