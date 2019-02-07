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
	  this.parentNode = null;
	  this.firstChild = null;
	  this.lastChild = null;
	  this.nextSibling = null;
	  this.previousSibling = null;
	}
	appendChild(child) {
		this.insertBefore(child, null);
		return child;
	}
	insertBefore(child, ref) {
		child.remove();
		child.parentNode = this;
		if (this.firstChild === null) {
		  this.firstChild = this.lastChild = child;
    } else if (ref === null) {
		  child.previousSibling = this.lastChild;
		  this.lastChild.nextSibling = child;
		  this.lastChild = child;
		} else {
		  const refPreviousSibling = ref.previousSibling;
		  if (refPreviousSibling !== null) {
        child.previousSibling = refPreviousSibling;
        refPreviousSibling.nextSibling = child;
		  } else {
		    this.firstChild = child;
		  }
		  ref.previousSibling = child;
		  child.nextSibling = ref;
		}
		return child;
	}
	removeChild(child) {
	  const childNextSibling = child.nextSibling;
	  const childPreviousSibling = child.previousSibling;
	  if (childNextSibling !== null) {
	    childNextSibling.previousSibling = childPreviousSibling;
	  } else {
	    this.lastChild = childPreviousSibling;
	  }
	  if (childPreviousSibling !== null) {
	    childPreviousSibling.nextSibling = childNextSibling;
	  } else {
	    this.firstChild = childNextSibling;
	  }
	  child.parentNode = null;
	  child.nextSibling = null;
	  child.previousSibling = null;
		return child;
	}
	remove() {
		const parentNode = this.parentNode;
		if (parentNode !== null) {
		  parentNode.removeChild(this);
    }
	}
}


class Text extends Node {
	constructor(text) {
		super(3, '#text');					// TEXT_NODE
		this.textContent = text;
	}
}

function serialize(el) {
 if (el.nodeType === 3) {
   return escape(el.textContent);
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
   for (let c = el.firstChild; c !== null; c = c.nextSibling) {
     s += serialize(c);
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
