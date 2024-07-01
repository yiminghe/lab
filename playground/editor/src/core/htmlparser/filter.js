/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
KISSY.Editor.add('htmlparser-filter', function () {
  var S = KISSY,
    KE = S.Editor,
    KEN = KE.NODE,
    FALSE = false,
    NULL = null;

  /**
   * @constructor
   * @param rules {Object}
   */
  function Filter(rules) {
    this._ = {
      elementNames: [],
      attributeNames: [],
      elements: { $length: 0 },
      attributes: { $length: 0 },
    };

    if (rules) this.addRules(rules, 10);
  }

  S.augment(Filter, {
    addRules: function (rules, priority) {
      if (typeof priority != 'number') priority = 10;

      // Add the elementNames.
      addItemsToList(this._.elementNames, rules.elementNames, priority);

      // Add the attributeNames.
      addItemsToList(this._.attributeNames, rules.attributeNames, priority);

      // Add the elements.
      addNamedItems(this._.elements, rules.elements, priority);

      // Add the attributes.
      addNamedItems(this._.attributes, rules.attributes, priority);

      // Add the text.
      this._.text =
        transformNamedItem(this._.text, rules.text, priority) || this._.text;

      // Add the comment.
      this._.comment =
        transformNamedItem(this._.comment, rules.comment, priority) ||
        this._.comment;

      // Add root fragment.
      this._.root =
        transformNamedItem(this._.root, rules.root, priority) || this._.root;
    },

    onElementName: function (name) {
      return filterName(name, this._.elementNames);
    },

    onAttributeName: function (name) {
      return filterName(name, this._.attributeNames);
    },

    onText: function (text) {
      var textFilter = this._.text;
      return textFilter ? textFilter.filter(text) : text;
    },

    onComment: function (commentText, comment) {
      var textFilter = this._.comment;
      return textFilter ? textFilter.filter(commentText, comment) : commentText;
    },

    onFragment: function (element) {
      var rootFilter = this._.root;
      return rootFilter ? rootFilter.filter(element) : element;
    },

    onElement: function (element) {
      // We must apply filters set to the specific element name as
      // well as those set to the generic $ name. So, add both to an
      // array and process them in a small loop.
      var filters = [
          this._.elements['^'],
          this._.elements[element.name],
          this._.elements.$,
        ],
        filter,
        ret;

      for (var i = 0; i < 3; i++) {
        filter = filters[i];
        if (filter) {
          ret = filter.filter(element, this);

          if (ret === FALSE) return NULL;

          if (ret && ret != element) return this.onNode(ret);

          // The non-root element has been dismissed by one of the filters.
          if (element.parent && !element.name) break;
        }
      }

      return element;
    },

    onNode: function (node) {
      var type = node.type;

      return type == KEN.NODE_ELEMENT
        ? this.onElement(node)
        : type == KEN.NODE_TEXT
        ? new KE.HtmlParser.Text(this.onText(node.value))
        : NULL;
    },

    onAttribute: function (element, name, value) {
      var filter = this._.attributes[name];

      if (filter) {
        var ret = filter.filter(value, element, this);

        if (ret === FALSE) return FALSE;

        if (typeof ret != 'undefined') return ret;
      }

      return value;
    },
  });
  function filterName(name, filters) {
    for (var i = 0; name && i < filters.length; i++) {
      var filter = filters[i];
      name = name.replace(filter[0], filter[1]);
    }
    return name;
  }

  function addItemsToList(list, items, priority) {
    if (typeof items == 'function') items = [items];

    var i,
      j,
      listLength = list.length,
      itemsLength = items && items.length;

    if (itemsLength) {
      // Find the index to insert the items at.
      for (i = 0; i < listLength && list[i].pri < priority; i++) {
        /*jsl:pass*/
      }

      // Add all new items to the list at the specific index.
      for (j = itemsLength - 1; j >= 0; j--) {
        var item = items[j];
        if (item) {
          item.pri = priority;
          list.splice(i, 0, item);
        }
      }
    }
  }

  function addNamedItems(hashTable, items, priority) {
    if (items) {
      for (var name in items) {
        var current = hashTable[name];

        hashTable[name] = transformNamedItem(current, items[name], priority);

        if (!current) hashTable.$length++;
      }
    }
  }

  function transformNamedItem(current, item, priority) {
    if (item) {
      item.pri = priority;

      if (current) {
        // If the current item is not an Array, transform it.
        if (!current.splice) {
          if (current.pri > priority) current = [item, current];
          else current = [current, item];

          current.filter = callItems;
        } else addItemsToList(current, item, priority);

        return current;
      } else {
        item.filter = item;
        return item;
      }
    }
    return undefined;
  }

  // Invoke filters sequentially on the array, break the iteration
  // when it doesn't make sense to continue anymore.
  function callItems(currentEntry) {
    var isNode =
      currentEntry.type || currentEntry instanceof KE.HtmlParser.Fragment;

    for (var i = 0; i < this.length; i++) {
      // Backup the node info before filtering.
      if (isNode) {
        var orgType = currentEntry.type,
          orgName = currentEntry.name;
      }

      var item = this[i],
        ret = item.apply(window, arguments);

      if (ret === FALSE) return ret;

      // We're filtering node (element/fragment).
      if (isNode) {
        // No further filtering if it's not anymore
        // fitable for the subsequent filters.
        if (ret && (ret.name != orgName || ret.type != orgType)) {
          return ret;
        }
      }
      // Filtering value (nodeName/textValue/attrValue).
      else {
        // No further filtering if it's not
        // any more values.
        if (typeof ret != 'string') return ret;
      }

      ret != undefined && (currentEntry = ret);
    }
    return currentEntry;
  }

  KE.HtmlParser.Filter = Filter;
  var FilterP = Filter.prototype;
  KE.Utils.extern(FilterP, {
    addRules: FilterP.addRules,
    onElementName: FilterP.onElementName,
    onAttributeName: FilterP.onAttributeName,
    onText: FilterP.onText,
    onComment: FilterP.onComment,
    onFragment: FilterP.onFragment,
    onElement: FilterP.onElement,
    onNode: FilterP.onNode,
    onAttribute: FilterP.onAttribute,
  });
  KE.HtmlParser['Filter'] = Filter;
});
