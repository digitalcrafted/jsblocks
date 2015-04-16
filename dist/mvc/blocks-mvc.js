/*!
 * jsblocks JavaScript Library v@VERSION
 * http://jsblocks.com/
 *
 * Copyright 2014, Antonio Stoilkov
 * Released under the MIT license
 * http://jsblocks.org/license
 *
 * Date: @DATE
 */
(function(global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(global, true);
  } else {
    factory(global);
  }

  // Pass this if window is not defined yet
}(typeof window !== 'undefined' ? window : this, function(global, noGlobal) {
  var toString = Object.prototype.toString;
  var slice = Array.prototype.slice;
  var hasOwn = Object.prototype.hasOwnProperty;
  var support = {};
  var core = {};

  /**
  * @namespace blocks
  */
  var blocks = function (value) {
    if (core.expressionsCreated) {
      if (arguments.length === 0) {
        return core.staticExpression;
      }
      return core.createExpression(value);
      //return core.createExpression(blocks.unwrap(value));
    }
    return value;
  };

  blocks.version = '0.1.8';
  blocks.core = core;

  /**
   * Works like [jQuery extend](@link )
   * @memberof blocks
   * @param {Object} obj
   * @param {...Object} objects
   * @returns {Object}
   */
  blocks.extend = function() {
    var src, copyIsArray, copy, name, options, clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false;

    // Handle a deep copy situation
    if (typeof target === 'boolean') {
      deep = target;
      target = arguments[1] || {};
      // skip the boolean and the target
      i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== 'object' && !blocks.isFunction(target)) {
      target = {};
    }

    for (; i < length; i++) {
      // Only deal with non-null/undefined values
      if ((options = arguments[i]) != null) {
        // Extend the base object
        for (name in options) {
          src = target[name];
          copy = options[name];

          // Prevent never-ending loop
          if (target === copy) {
            continue;
          }

          // Recurse if we're merging plain objects or arrays
          if (deep && copy && (blocks.isPlainObject(copy) || (copyIsArray = blocks.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && blocks.isArray(src) ? src : [];
            } else {
              clone = src && blocks.isPlainObject(src) ? src : {};
            }

            // Never move original objects, clone them
            target[name] = blocks.extend(deep, clone, copy);

          } else {
            target[name] = copy;
          }
        }
      }
    }

    // Return the modified object
    return target;
  };

  /**
   * @callback iterateCallback
   * @param {*} value - The value
   * @param {(number|string)} indexOrKey - Index or key
   * @param {(Array|Object)} collection - The collection that is being iterated
   */

  /**
   * Iterates over the collection
   *
   * @memberof blocks
   * @param {(Array|Object)} collection - The array or object to iterate over
   * @param {Function} callback - The callback that will be executed for each element in the collection
   * @param {*} [thisArg] - Optional this context for the callback
   *
   * @example {javascript}
   * blocks.each([3, 1, 4], function (value, index, collection) {
   *   // value is the current item (3, 1 and 4)
   *   // index is the current index (0, 1 and 2)
   *   // collection points to the array passed to the function - [3, 1, 4]
   * });
   */
  blocks.each = function(collection, callback, thisArg) {
    if (collection == null) {
      return;
    }

    var length = collection.length;
    var indexOrKey = -1;
    var isArray = typeof length == 'number';

    callback = parseCallback(callback, thisArg);

    if (isArray) {
      while (++indexOrKey < length) {
        if (callback(collection[indexOrKey], indexOrKey, collection) === false) {
          break;
        }
      }
    } else {
      for (indexOrKey in collection) {
        if (callback(collection[indexOrKey], indexOrKey, collection) === false) {
          break;
        }
      }
    }
  };

  /**
   * Iterates over the collection from end to start
   *
   * @memberof blocks
   * @param {(Array|Object)} collection - The array or object to iterate over
   * @param {Function} callback - The callback that will be executed for each element in the collection
   * @param {*} [thisArg] - Optional this context for the callback
   *
   * @example {javascript}
   * blocks.eachRight([3, 1, 4], function (value, index, collection) {
   *   // value is the current item (4, 1 and 3)
   *   // index is the current index (2, 1 and 0)
   *   // collection points to the array passed to the function - [3, 1, 4]
   * });
   */
  blocks.eachRight = function(collection, callback, thisArg) {
    if (collection == null) {
      return;
    }

    var length = collection.length,
      indexOrKey = collection.length,
      isCollectionAnArray = typeof length == 'number';

    callback = parseCallback(callback, thisArg);

    if (isCollectionAnArray) {
      while (--indexOrKey >= 0) {
        callback(collection[indexOrKey], indexOrKey, collection);
      }
    } else {
      for (indexOrKey in collection) {
        callback(collection[indexOrKey], indexOrKey, collection);
      }
    }
  };

  blocks.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(type) {
    blocks['is' + type] = function(obj) {
      return toString.call(obj) == '[object ' + type + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable 'Arguments' type.
  if (!blocks.isArguments(arguments)) {
    blocks.isArguments = function(obj) {
      return !!(obj && hasOwn.call(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof(/./) !== 'function') {
    blocks.isFunction = function(obj) {
      return !!(obj && typeof obj === 'function');
    };
  }

  /**
   * Determines if a value is an array.
   * Returns false for array like objects (for example arguments object)
   *
   * @memberof blocks
   * @param {*} value - The value to check if it is an array
   * @returns {boolean} - Whether the value is an array
   *
   * @example {javascript}
   * blocks.isArray([1, 2, 3]);
   * // -> true
   *
   * function calculate() {
   *   blocks.isArray(arguments);
   *   // -> false
   * }
   */
  blocks.isArray = Array.isArray || function(value) {
    return toString.call(value) == '[object Array]';
  };

  blocks.extend(blocks, {

    /**
     * Represents a dummy empty function
     *
     * @memberof blocks
     * @returns {Function} - Empty function
     *
     * @example {javascript}
     * function max(collection, callback) {
     *   callback = callback || blocks.noop;
     * }
     */
    noop: function() {},

    /**
     * The method helps create inheritance easily and avoid working with prototypes directly.
     * Extends a Class or creates new Class type.
     *
     * @memberof blocks
     * @param {Function} [BaseClass] - Optionally provide the Class from which to extend
     * @param {} Class - The new Class constructor that will be created
     * @param {Object} prototype - The object that will be the prototype of the new Class
     * @returns {Object} - The class that was created
     *
     * @example {javascript}
     * var Mammal = blocks.inherit(function (name) {
     *   this.name = name;
     * }, {
     *   message: function () {
     *     return 'This mammal is ' + this.name;
     *   }
     * });
     *
     * var Monkey = blocks.inherit(Mammal, function () {
     *   this._super('Monkey');
     * }, {
     *   helloMessage: function () {
     *     return 'I am monkey';
     *   }
     * });
     *
     * var monkey = new Monkey();
     * monkey.helloMessage();
     * // -> 'I am monkey';
     *
     * monkey.message();
     * // -> 'This mammal is Monkey'
     */
    inherit: function(BaseClass, Class, prototype) {
      if ((arguments.length < 3 && blocks.isPlainObject(Class)) || arguments.length == 1) {
        prototype = Class;
        Class = BaseClass;
        BaseClass = undefined;
      }

      if (BaseClass) {
        Class.prototype = objectCreate(BaseClass.prototype);
        Class.prototype.constructor = Class;
        blocks.extend(Class.prototype, prototype);
        Class.prototype.__Class__ = BaseClass;
        Class.prototype._super = _super;
      } else if (prototype) {
        Class.prototype = prototype;
      }

      return Class;
    },

    /**
     * Determines the true type of an object
     *
     * @memberof blocks
     * @param {*} value - The value for which to determine its type
     * @returns {string} - Returns the type of the value as a string
     *
     * @example {javascript}
     * blocks.type('a string');
     * // -> string
     *
     * blocks.type(314);
     * // -> number
     *
     * blocks.type([]);
     * // -> array
     *
     * blocks.type({});
     * // -> object
     *
     * blocks.type(blocks.noop);
     * // -> function
     *
     * blocks.type(new RegExp());
     * // -> regexp
     *
     * blocks.type(undefined);
     * // -> undefined
     *
     * blocks.type(null);
     * // -> null
     */
    type: function(value) {
      if (value instanceof Array) {
        return 'array';
      }
      if (typeof value == 'string' || value instanceof String) {
        return 'string';
      }
      if (typeof value == 'number' || value instanceof Number) {
        return 'number';
      }
      if (value instanceof Date) {
        return 'date';
      }
      if (toString.call(value) === '[object RegExp]') {
        return 'regexp';
      }
      if (value === null) {
        return 'null';
      }
      if (value === undefined) {
        return 'undefined';
      }

      if (blocks.isFunction(value)) {
        return 'function';
      }

      if (blocks.isBoolean(value)) {
        return 'boolean';
      }

      return 'object';
    },

    /**
     * Determines if a specific value is the specified type
     *
     * @memberof blocks
     * @param {*} value - The value
     * @param {string} type - The type
     * @returns {boolean} - If the value is from the specified type
     *
     * @example {javascript}
     * blocks.is([], 'array');
     * // -> true
     *
     * blocks.is(function () {}, 'object');
     * // -> false
     */
    is: function(value, type) {
      if (arguments.length > 1 && blocks.isFunction(type)) {
        return type.prototype.isPrototypeOf(value);
      }
      return blocks.type(value) == type;
    },

    /**
     * Checks if a variable has the specified property.
     * Uses hasOwnProperty internally
     *
     * @memberof blocks
     * @param {*} obj - The object to call hasOwnPrototype for
     * @param {String} key - The key to check if exists in the object
     * @returns {boolean} Returns if the key exists in the provided object
     *
     * @example {javascript}
     * blocks.has({
     *   price: undefined
     * }, 'price');
     * // -> true
     *
     * blocks.has({
     *   price: 314
     * }, 'ratio');
     * // -> false
     */
    has: function(obj, key) {
      return !!(obj && hasOwn.call(obj, key));
    },

    /**
     * @memberof blocks
     * @param {*} value
     * @returns {boolean}
     */
    hasValue: function(value) {
      return value != null && (!blocks.isNumber(value) || !isNaN(value));
    },

    toString: function(value) {
      // TODO: Implement and make tests
      var result = '';
      if (blocks.hasValue(value)) {
        result = value.toString();
      }
      return result;
    },

    /**
     * Unwraps a JSBlocks value to its raw representation.
     * Unwraps blocks.observable() and blocks() values.
     *
     * @memberof blocks
     * @param {*} value - The value that will be unwrapped
     * @returns {*} The unwrapped value
     *
     * @example {javascript}
     * blocks.unwrap(blocks.observable(314));
     * // -> 314
     *
     * blocks.unwrap(blocks([3, 1, 4]));
     * // -> [3, 1, 4]
     *
     * blocks.unwrap('a string or any other value will not be changed');
     * // -> 'a string or any other value will not be changed'
     */
    unwrap: function(value) {
      if (core.expressionsCreated && core.isExpression(value)) {
        return value.value();
      }

      if (blocks.unwrapObservable) {
        return blocks.unwrapObservable(value);
      }
      return value;
    },

    /**
     * Unwraps a jQuery instance and returns the first element
     *
     * @param {*} element - If jQuery element is specified it will be unwraped
     * @returns {*} - The unwraped value
     *
     * @example {javascript}
     * var articles = $('.article');
     * blocks.$unwrap()
     */
    $unwrap: function(element, callback, thisArg) {
      callback = parseCallback(callback, thisArg);

      if (element && element.jquery) {
        if (callback) {
          element.each(function () {
            callback(this);
          });
        }
        element = element[0];
      } else {
        if (callback) {
          callback(element);
        }
      }

      return element;
    },

    /**
     * Converts a value to an array. Arguments object is converted to array
     * and primitive values are wrapped in an array. Does nothing when value
     * is already an array
     *
     * @memberof blocks
     * @param {*} value - The value to be converted to an array
     * @returns {Array} - The array
     *
     * @example {javascript}
     * blocks.toArray(3);
     * // -> [3]
     *
     * function calculate() {
     *   var numbers = blocks.isArray(arguments);
     * }
     *
     * blocks.toArray([3, 1, 4]);
     * // -> [3, 1, 4]
     */
    toArray: function(value) {
      // TODO: Think if it should be removed permanantely.
      // Run tests after change to observe difference
      //if (value == null) {
      //    return [];
      //}
      if (blocks.isArguments(value)) {
        return slice.call(value);
      }
      if (blocks.isElements(value)) {
        // TODO: if not IE8 and below use slice.call
        /* jshint newcap: false */
        var result = Array(value.length);
        var index = -1;
        var length = value.length;
        while (++index < length) {
          result[index] = value[index];
        }
        return result;
      }
      if (!blocks.isArray(value)) {
        return [value];
      }
      return value;
    },

    /**
     * Converts an integer or string to a unit.
     * If the value could not be parsed to a number it is not converted
     *
     * @memberof blocks
     * @param {[type]} value - The value to be converted to the specified unit
     * @param {String} [unit='px'] - Optionally provide a unit to convert to.
     * Default value is 'px'
     *
     * @example {javascript}
     *
     * blocks.toUnit(230);
     * // -> 230px
     *
     * blocks.toUnit(230, '%');
     * // -> 230%
     *
     * blocks.toUnit('60px', '%');
     * // -> 60%
     */
    toUnit: function(value, unit) {
      var unitIsSpecified = unit;
      unit = unit || 'px';

      if (blocks.isNaN(parseFloat(value))) {
        return value;
      }

      if (blocks.isString(value) && blocks.isNaN(parseInt(value.charAt(value.length - 1), 10))) {
        if (unitIsSpecified) {
          return value.replace(/[^0-9]+$/, unit);
        }
        return value;
      }
      return value + unit;
    },

    /**
     * Clones value. If deepClone is set to true the value will be cloned recursively
     *
     * @memberof blocks
     * @param {*} value -
     * @param {boolean} [deepClone] - Description
     * @returns {*} Description
     *
     * @example {javascript}
     * var array = [3, 1, 4];
     * var cloned = blocks.clone(array);
     * // -> [3, 1, 4]
     * var areEqual = array == cloned;
     * // -> false
     */
    clone: function(value, deepClone) {
      if (value == null) {
        return value;
      }

      var type = blocks.type(value);
      var clone;
      var key;

      if (type == 'array') {
        return value.slice(0);
      } else if (type == 'object') {
        if (value.constructor === Object) {
          clone = {};
        } else {
          clone = new value.constructor();
        }

        for (key in value) {
          clone[key] = deepClone ? blocks.clone(value[key], true) : value[key];
        }
        return clone;
      } else if (type == 'date') {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate(),
          value.getHours(), value.getMinutes(), value.getSeconds(), value.getMilliseconds());
      } else if (type == 'string') {
        return value.toString();
      } else if (type == 'regexp') {
        var flags = '';
        if (value.global) {
          flags += 'g';
        }
        if (value.ignoreCase) {
          flags += 'i';
        }
        if (value.multiline) {
          flags += 'm';
        }
        clone = new RegExp(value.source, flags);
        clone.lastIndex = value.lastIndex;
        return clone;
      }

      return value;
    },

    /**
     * Determines if the specified value is a HTML elements collection
     *
     * @memberof blocks
     * @param {*} value - The value to check if it is elements collection
     * @returns {boolean} - Returns whether the value is elements collection
     */
    isElements: function(value) {
      var isElements = false;
      if (value) {
        if (typeof HTMLCollection != 'undefined') {
          isElements = value instanceof window.HTMLCollection;
        }
        if (typeof NodeList != 'undefined' && !isElements) {
          isElements = value instanceof NodeList;
        }
        if (!isElements && blocks.isString(value.item)) {
          try {
            value.item(0);
            isElements = true;
          } catch (e) {}
        }
      }
      return isElements;
    },

    /**
     * Determines if the specified value is a HTML element
     *
     * @memberof blocks
     * @param {*} value - The value to check if it is a HTML element
     * @returns {boolean} - Returns whether the value is a HTML element
     *
     * @example {javascript}
     * blocks.isElement(document.body);
     * // -> true
     *
     * blocks.isElement({});
     * // -> false
     */
    isElement: function(value) {
      return !!(value && value.nodeType === 1);
    },

    /**
     * Determines if a the specified value is a boolean.
     *
     * @memberof blocks
     * @param {*} value - The value to be checked if it is a boolean
     * @returns {boolean} - Whether the value is a boolean or not
     *
     * @example {javascript}
     * blocks.isBoolean(true);
     * // -> true
     *
     * blocks.isBoolean(new Boolean(false));
     * // -> true
     *
     * blocks.isBoolean(1);
     * // -> false
     */
    isBoolean: function(value) {
      return value === true || value === false || toString.call(value) == '[object Boolean]';
    },

    /**
     * Determines if the specified value is an object
     *
     * @memberof blocks
     * @param {[type]} obj - The value to check for if it is an object
     * @returns {boolean} - Returns whether the value is an object
     */
    isObject: function(obj) {
      return obj === Object(obj);
    },

    /**
     * Determines if a value is a object created using {} or new Object
     *
     * @memberof blocks
     * @param {*} obj - The value that will be checked
     * @returns {boolean} - Whether the value is a plain object or not
     *
     * @example {javascript}
     * blocks.isPlainObject({ property: true });
     * // -> true
     *
     * blocks.isPlainObject(new Object());
     * // -> true
     *
     * function Car () {
     *
     * }
     *
     * blocks.isPlainObject(new Car());
     * // -> false
     */
    isPlainObject: function(obj) {
      var key;

      // Must be an Object.
      // Because of IE, we also have to check the presence of the constructor property.
      // Make sure that DOM nodes and window objects don't pass through, as well
      if (!obj || typeof obj !== 'object' || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.window == obj) {
        return false;
      }

      try {
        // Not own constructor property must be Object
        if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
          return false;
        }
      } catch (e) {
        // IE8,9 Will throw exceptions on certain host objects #9897
        return false;
      }

      // Support: IE<9
      // Handle iteration over inherited properties before own properties.
      if (support.ownPropertiesAreLast) {
        for (key in obj) {
          return hasOwn.call(obj, key);
        }
      }

      // Own properties are enumerated firstly, so to speed up,
      // if last one is own, then all properties are own.
      // jshint noempty: false
      // Disable JSHint error: Empty blocks. This option warns when you have an empty block in your code.
      for (key in obj) {}

      return key === undefined || hasOwn.call(obj, key);
    },

    isFinite: function(value) {
      return isFinite(value) && !blocks.isNaN(parseFloat(value));
    },

    isNaN: function(value) {
      return blocks.isNumber(value) && value != +value;
    },

    isNull: function(value) {
      return value === null;
    },

    isUndefined: function(value) {
      return value === undefined;
    },

    nothing: {},

    /**
     *
     *
     * @param {Object} obj 
     * @param {String} path
     * @param {*} defaultValue
     * @returns {[type]}              [description]
     */
    access: function(obj, path, defaultValue) {
      var index = 0;
      var name;

      defaultValue = arguments.length > 2 ? defaultValue : blocks.nothing;
      path = path.split('.');
      name = path[0];

      while (name) {
        if (obj == null) {
          return defaultValue;
        }
        obj = obj[name];
        name = path[++index];
      }
      return obj;
    },

    /**
     * Description
     * @param {Array} array -
     * @param {Number} indexA -
     * @param {Number} indexB -
     * @returns {Array}
     */
    swap: function(array, indexA, indexB) {
      var length = array.length;
      if (indexA >= 0 && indexB >= 0 && indexA < length && indexB < length) {
        array[indexA] = array[indexB] + (array[indexB] = array[indexA], 0);
      }
      return array;
    },

    /**
     *
     * @param {Array} array -
     * @param {Number} sourceIndex -
     * @param {Number} targetIndex -
     * @returns {Array}
     */
    move: function(array, sourceIndex, targetIndex) {
      if (sourceIndex != targetIndex) {
        if (sourceIndex <= targetIndex) {
          targetIndex++;
        }
        array.splice(targetIndex, 0, array[sourceIndex]);
        if (sourceIndex > targetIndex) {
          sourceIndex++;
        }
        array.splice(sourceIndex, 1);
      }
      return array;
    },

    /**
     * Changes the this binding to a function and optionally passes additional parameters to the
     * function
     *
     * @memberof blocks
     * @param {Function} func - The function for which to change the this binding and optionally
     * add arguments
     * @param {*} thisArg - The new this binding context value
     * @param {...*} [args] - Optional arguments that will be passed to the function
     * @returns {Function} - The newly created function having the new this binding and optional
     * arguments
     *
     * @example {javascript}
     * var alert = blocks.bind(function () {
     *   alert(this);
     * }, 'Hello bind method!');
     *
     * alert();
     * // -> alerts 'Hello bind method'
     *
     * var alertAll = blocks.bind(function (firstName, lastName) {
     *   alert('My name is ' + firstName + ' ' + lastName);
     * }, null, 'John', 'Doe');
     *
     * alertAll();
     * // -> alerts 'My name is John Doe'
     */
    bind: function(func, thisArg) {
      var Class = function() {};
      var args = slice.call(arguments, 2);
      var bound;

      bound = function() {
        if (!(this instanceof bound)) {
          return func.apply(thisArg, args.concat(slice.call(arguments)));
        }
        Class.prototype = func.prototype;
        var self = new Class();
        //Class.prototype = null;
        var result = func.apply(self, args.concat(slice.call(arguments)));
        if (Object(result) === result) {
          return result;
        }
        return self;
      };
      return bound;
    },

    /**
     * Determines if two values are deeply equal.
     * Set deepEqual to false to stop recusively equality checking
     *
     * @memberof blocks
     * @param {*} a - The first object to be campared
     * @param {*} b - The second object to be compared
     * @param {boolean} [deepEqual] - Determines if the equality check will recursively check all
     * child properties
     * @returns {boolean} - Whether the two values are equal
     *
     * @example {javascript}
     * blocks.equals([3, 4], [3, 4]);
     * // -> true
     *
     * blocks.equals({ value: 7 }, { value: 7, result: 1});
     * // -> false
     */
    equals: function(a, b, deepEqual) {
      // TODO: deepEqual could accept a Number which represents the levels it could go in the recursion
      a = blocks.unwrap(a);
      b = blocks.unwrap(b);
      return equals(a, b, [], [], deepEqual);
    }
  });

  // Internal recursive comparison function for `isEqual`.
  function equals(a, b, aStack, bStack, deepEqual) {
    if (deepEqual !== false) {
      deepEqual = true;
    }

    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) {
      return a !== 0 || 1 / a == 1 / b;
    }

    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) {
      return a === b;
    }

    // Unwrap any wrapped objects.
    if (a instanceof blocks) {
      a = a._wrapped;
    }
    if (b instanceof blocks) {
      b = b._wrapped;
    }

    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) {
      return false;
    }

    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `'5'` is
        // equivalent to `new String('5')`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a === 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
        // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
          a.global == b.global &&
          a.multiline == b.multiline &&
          a.ignoreCase == b.ignoreCase;
    }

    if (typeof a != 'object' || typeof b != 'object') {
      return false;
    }

    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) {
        return bStack[length] == b;
      }
    }

    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor,
      bCtor = b.constructor;
    if (aCtor !== bCtor && !(blocks.isFunction(aCtor) && (aCtor instanceof aCtor) &&
        blocks.isFunction(bCtor) && (bCtor instanceof bCtor)) &&
      ('constructor' in a && 'constructor' in b)) {
      return false;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    var size = 0,
      result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = (deepEqual ? equals(a[size], b[size], aStack, bStack, deepEqual) : a[size] === b[size]))) {
            break;
          }
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (blocks.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = blocks.has(b, key) && (deepEqual ? equals(a[key], b[key], aStack, bStack, deepEqual) : a[key] === b[key]))) {
            break;
          }
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (blocks.has(b, key) && !(size--)) {
            break;
          }
        }
        result = !size;
      }
    }

    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  }

  blocks.at = function (index) {
    return {
      index: index,
      prototypeIndentification: '__blocks.at__'
    };
  };

  blocks.first = function () {
    return blocks.first;
  };

  blocks.last = function () {
    return blocks.last;
  };

  function _super(name, args) {
    var func;
    if (blocks.isString(name)) {
      func = this.__Class__.prototype[name];
    } else {
      args = name;
      func = this.__Class__;
    }

    return func.apply(this, args || []);
  }

  var objectCreate = Object.create || function(prototype) {
    var Class = function() {};
    Class.prototype = prototype;
    return new Class();
  };

  for (var key in [support]) {
    break;
  }
  support.ownPropertiesAreLast = key != '0';

  function parseCallback(callback, thisArg) {
    if (thisArg != null) {
      var orgCallback = callback;
      callback = function(value, index, collection) {
        return orgCallback.call(thisArg, value, index, collection);
      };
    }
    return callback;
  }

  (function () {
    // @debug-code
  })();

  (function () {
    
(function () {


  function parseCallback(callback, thisArg) {
    //callback = parseExpression(callback);
    if (thisArg != null) {
      var orgCallback = callback;
      callback = function (value, index, collection) {
        return orgCallback.call(thisArg, value, index, collection);
      };
    }
    return callback;
  }

  var Events = (function () {
    function createEventMethod(eventName) {
      return function (callback, context) {
        if (arguments.length > 1) {
          Events.on(this, eventName, callback, context);
        } else {
          Events.on(this, eventName, callback);
        }
        return this;
      };
    }

    var methods = {
      on: function (eventName, callback, context) {
        if (arguments.length > 2) {
          Events.on(this, eventName, callback, context);
        } else {
          Events.on(this, eventName, callback);
        }
        return this;
      },

      off: function (eventName, callback) {
        Events.off(this, eventName, callback);
      },

      trigger: function (eventName) {
        Events.trigger(this, eventName, blocks.toArray(arguments).slice(1, 100));
      }
    };
    methods._trigger = methods.trigger;

    return {
      register: function (object, eventNames) {
        eventNames = blocks.isArray(eventNames) ? eventNames : [eventNames];
        for (var i = 0; i < eventNames.length; i++) {
          var methodName = eventNames[i];
          if (methods[methodName]) {
            object[methodName] = methods[methodName];
          } else {
            object[methodName] = createEventMethod(methodName);
          }
        }
      },

      on: function (object, eventNames, callback, context) {
        eventNames = blocks.toArray(eventNames).join(' ').split(' ');

        var i = 0;
        var length = eventNames.length;
        var eventName;

        if (!callback) {
          return;
        }

        if (!object._events) {
          object._events = {};
        }
        for (; i < length; i++) {
          eventName = eventNames[i];
          if (!object._events[eventName]) {
            object._events[eventName] = [];
          }
          object._events[eventName].push({
            callback: callback,
            context: context
          });
        }
      },

      off: function (object, eventName, callback) {
        if (blocks.isFunction(eventName)) {
          callback = eventName;
          eventName = undefined;
        }

        if (eventName !== undefined || callback !== undefined) {
          blocks.each(object._events, function (events, currentEventName) {
            if (eventName !== undefined && callback === undefined) {
              object._events[eventName] = [];
            } else {
              blocks.each(events, function (eventData, index) {
                if (eventData.callback == callback) {
                  object._events[currentEventName].splice(index, 1);
                  return false;
                }
              });
            }
          });
        } else {
          object._events = undefined;
        }
      },

      trigger: function (object, eventName) {
        var eventsData;
        var context;
        var result = true;
        var args;

        if (object && object._events) {
          eventsData = object._events[eventName];

          if (eventsData && eventsData.length > 0) {
            args = Array.prototype.slice.call(arguments, 2);

            blocks.each(eventsData, function iterateEventsData(eventData) {
              if (eventData) {
                context = object;
                if (eventData.context !== undefined) {
                  context = eventData.context;
                }
                if (eventData.callback.apply(context, args) === false) {
                  result = false;
                }
              }
            });
          }
        }

        return result;
      },

      has: function (object, eventName) {
        return !!blocks.access(object, '_events.' + eventName + '.length');
      }
    };
  })();

  // Implementation of blocks.domReady event
  (function () {
    blocks.isDomReady = false;

    //blocks.elementReady = function (element, callback, thisArg) {
    //  callback = parseCallback(callback, thisArg);
    //  if (element) {
    //    callback();
    //  } else {
    //    blocks.domReady(callback);
    //  }
    //};

    blocks.domReady = function (callback, thisArg) {
      if (typeof document == 'undefined' || typeof window == 'undefined' ||
        (window.__mock__ && document.__mock__)) {
        return;
      }

      callback = parseCallback(callback, thisArg);
      if (blocks.isDomReady || document.readyState == 'complete' ||
        (window.jQuery && window.jQuery.isReady)) {
        blocks.isDomReady = true;
        callback();
      } else {
        Events.on(blocks.core, 'domReady', callback);
        handleReady();
      }
    };

    function handleReady() {
      if (document.readyState === 'complete') {
        setTimeout(ready);
      } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', completed, false);
        window.addEventListener('load', completed, false);
      } else {
        document.attachEvent('onreadystatechange', completed);
        window.attachEvent('onload', completed);

        var top = false;
        try {
          top = window.frameElement == null && document.documentElement;
        } catch (e) { }

        if (top && top.doScroll) {
          (function doScrollCheck() {
            if (!blocks.isDomReady) {
              try {
                top.doScroll('left');
              } catch (e) {
                return setTimeout(doScrollCheck, 50);
              }

              ready();
            }
          })();
        }
      }
    }

    function completed() {
      if (document.addEventListener || event.type == 'load' || document.readyState == 'complete') {
        ready();
      }
    }

    function ready() {
      if (!blocks.isDomReady) {
        blocks.isDomReady = true;
        Events.trigger(blocks.core, 'domReady');
        Events.off(blocks.core, 'domReady');
      }
    }
  })();

    var slice = Array.prototype.slice;

    var trimRegExp = /^\s+|\s+$/gm;


  function keys(array) {
    var result = {};
    blocks.each(array, function (value) {
      result[value] = true;
    });
    return result;
  }
    var classAttr = 'class';

    var queries = (blocks.queries = {});


  var isMouseEventRegEx = /^(?:mouse|pointer|contextmenu)|click/;
  var isKeyEventRegEx = /^key/;

  function returnFalse() {
    return false;
  }

  function returnTrue() {
    return true;
  }

  function Event(e) {
    this.originalEvent = e;
    this.type = e.type;

    this.isDefaultPrevented = e.defaultPrevented ||
        (e.defaultPrevented === undefined &&
        // Support: IE < 9, Android < 4.0
        e.returnValue === false) ?
        returnTrue :
        returnFalse;

    this.timeStamp = e.timeStamp || +new Date();
  }

  Event.PropertiesToCopy = {
    all: 'altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which'.split(' '),
    mouse: 'button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '),
    keyboard: 'char charCode key keyCode'.split(' ')
  };

  Event.CopyProperties = function (originalEvent, event, propertiesName) {
    blocks.each(Event.PropertiesToCopy[propertiesName], function (propertyName) {
      event[propertyName] = originalEvent[propertyName];
    });
  };

  Event.prototype = {
    preventDefault: function () {
        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;

        if (e.preventDefault) {
            // If preventDefault exists, run it on the original event
            e.preventDefault();
        } else {
            // Support: IE
            // Otherwise set the returnValue property of the original event to false
            e.returnValue = false;
        }
    },

    stopPropagation: function () {
        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;

        // If stopPropagation exists, run it on the original event
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        // Support: IE
        // Set the cancelBubble property of the original event to true
        e.cancelBubble = true;
    },

    stopImmediatePropagation: function () {
        var e = this.originalEvent;

        this.isImmediatePropagationStopped = returnTrue;

        if (e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
        }

        this.stopPropagation();
    }
  };

  Event.fix = function (originalEvent) {
    var type = originalEvent.type;
    var event = new Event(originalEvent);

    Event.CopyProperties(originalEvent, event, 'all');

    // Support: IE<9
    // Fix target property (#1925)
    if (!event.target) {
        event.target = originalEvent.srcElement || document;
    }

    // Support: Chrome 23+, Safari?
    // Target should not be a text node (#504, #13143)
    if (event.target.nodeType === 3) {
        event.target = event.target.parentNode;
    }

    // Support: IE<9
    // For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
    event.metaKey = !!event.metaKey;

    if (isMouseEventRegEx.test(type)) {
        Event.fixMouse(originalEvent, event);
    } else if (isKeyEventRegEx.test(type) && event.which == null) {
        Event.CopyProperties(originalEvent, event, 'keyboard');
        // Add which for key events
        event.which = originalEvent.charCode != null ? originalEvent.charCode : originalEvent.keyCode;
    }

    return event;
  };

  Event.fixMouse = function (originalEvent, event) {
    var button = originalEvent.button;
    var fromElement = originalEvent.fromElement;
    var body;
    var eventDoc;
    var doc;

    Event.CopyProperties(originalEvent, event, 'mouse');

    // Calculate pageX/Y if missing and clientX/Y available
    if (event.pageX == null && originalEvent.clientX != null) {
        eventDoc = event.target.ownerDocument || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = originalEvent.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = originalEvent.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
    }

    // Add relatedTarget, if necessary
    if (!event.relatedTarget && fromElement) {
        event.relatedTarget = fromElement === event.target ? originalEvent.toElement : fromElement;
    }

    // Add which for click: 1 === left; 2 === middle; 3 === right
    // Note: button is not normalized, so don't use it
    if (!event.which && button !== undefined) {
        /* jshint bitwise: false */
        event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
    }
  };

  //var event = blocks.Event();
  //event.currentTarget = 1; // the current element from which is the event is fired
  //event.namespace = ''; // the namespace for the event

  function addListener(element, eventName, callback) {
    if (element.addEventListener && eventName != 'propertychange') {
      element.addEventListener(eventName, function (event) {
        callback.call(this, Event.fix(event));
      }, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + eventName, function (event) {
        callback.call(this, Event.fix(event));
      });
    }
  }

  function getClassIndex(classAttribute, className) {
    if (!classAttribute || typeof classAttribute !== 'string' || className == null) {
      return -1;
    }

    classAttribute = ' ' + classAttribute + ' ';
    return classAttribute.indexOf(' ' + className + ' ');
  }

  var ampRegEx = /&/g;
  var quotRegEx = /"/g;
  var singleQuoteRegEx = /'/g;
  var lessThanRegEx = /</g;
  var greaterThanRegEx = />/g;
  function escapeValue(value) {
    return String(value)
      .replace(ampRegEx, '&amp;')
      .replace(quotRegEx, '&quot;')
      .replace(singleQuoteRegEx, '&#39;')
      .replace(lessThanRegEx, '&lt;')
      .replace(greaterThanRegEx, '&gt;');
    // return document
    //   .createElement('a')
    //   .appendChild(document.createTextNode(value))
    //     .parentNode
    //     .innerHTML;
  }
    var dataIdAttr = 'data-id';


  function resolveKeyValue(nameOrObject, value, callback) {
    if (typeof nameOrObject == 'string') {
      callback(nameOrObject, value);
    } else if (blocks.isPlainObject(nameOrObject)) {
      blocks.each(nameOrObject, function (val, key) {
        callback(key, val);
      });
    }
  }

  function createFragment(html) {
    var fragment = document.createDocumentFragment();
    var temp = document.createElement('div');
    var count = 1;
    var table = '<table>';
    var tableEnd = '</table>';
    var tbody = '<tbody>';
    var tbodyEnd = '</tbody>';
    var tr = '<tr>';
    var trEnd = '</tr>';

    html = html.toString();

    if ((html.indexOf('<option') != -1) && html.indexOf('<select') == -1) {
      html = '<select>' + html + '</select>';
      count = 2;
    } else if (html.indexOf('<table') == -1) {
      if (html.match(/<(tbody|thead|tfoot)/)) {
        count = 2;
        html = table + html + tableEnd;
      } else if (html.indexOf('<tr') != -1) {
        count = 3;
        html = table + tbody + html + tbodyEnd + tableEnd;
      } else if (html.match(/<(td|th)/)) {
        count = 4;
        html = table + tbody + tr + html + trEnd + tbodyEnd + tableEnd;
      }
    }


    temp.innerHTML = 'A<div>' + html + '</div>';

    while (count--) {
      temp = temp.lastChild;
    }

    while (temp.firstChild) {
      fragment.appendChild(temp.firstChild);
    }

    return fragment;
  }
    var parameterQueryCache = {};


  var ElementsData = (function () {
    var data = {};
    var globalId = 1;
    var freeIds = [];

    function getDataId(element) {
      var result = element ? VirtualElement.Is(element) ? element._attributes[dataIdAttr] :
        element.nodeType == 1 ? element.getAttribute(dataIdAttr) :
          element.nodeType == 8 ? /\s+(\d+):[^\/]/.exec(element.nodeValue) :
            null :
        null;

      return blocks.isArray(result) ? result[1] : result;
    }

    function setDataId(element, id) {
      if (VirtualElement.Is(element)) {
        element.attr(dataIdAttr, id);
      } else if (element.nodeType == 1) {
        element.setAttribute(dataIdAttr, id);
      }
    }

    return {
      id: function (element) {
        return getDataId(element);
      },

      /* @if SERVER */
      reset: function () {
        data = {};
        globalId = 1;
        freeIds = [];
      },
      /* @endif */

      collectGarbage: function () {
        blocks.each(data, function (value) {
          if (value && value.dom && !document.body.contains(value.dom)) {
            ElementsData.clear(value.id, true);
          }
        });
      },

      createIfNotExists: function (element) {
        var currentData = data[element && getDataId(element)];
        var id;

        if (!currentData) {
          id = freeIds.pop() || globalId++;
          if (element) {
            setDataId(element, id);
          }

          // if element is not defined then treat it as expression
          if (!element) {
            currentData = data[id] = {
              id: id
            };
          } else {
            currentData = data[id] = {
              id: id,
              virtual: VirtualElement.Is(element) ? element : null,
              animating: 0,
              observables: {},
              preprocess: VirtualElement.Is(element)
            };
          }
        }

        return currentData;
      },

      data: function (element, name, value) {
        var result = data[getDataId(element) || element];
        if (!result) {
          return;
        }
        if (arguments.length == 1) {
          return result;
        } else if (arguments.length > 2) {
          result[name] = value;
        }
        return result[name];
      },

      clear: function (element, force) {
        var id = getDataId(element) || element;
        var currentData = data[id];

        if (currentData && (!currentData.haveData || force)) {
          blocks.each(currentData.observables, function (value) {
            for (var i = 0; i < value._elements.length; i++) {
              if (value._elements[i].elementId == data.id) {
                value._elements.splice(i, 1);
                i--;
              }
            }
          });
          data[id] = undefined;
          //if (!force) {
          //  freeIds.push(id);
          //}
          if (VirtualElement.Is(element)) {
            element.attr(dataIdAttr, null);
          } else if (element.nodeType == 1) {
            element.removeAttribute(dataIdAttr);
          }
        }
      }
    };
  })();

  var Observer = (function () {
    var stack = [];

    return {
      startObserving: function () {
        stack.push([]);
      },

      stopObserving: function () {
        return stack.pop();
      },

      currentObservables: function () {
        return stack[stack.length - 1];
      },

      registerObservable: function (newObservable) {
        var observables = stack[stack.length - 1];
        var alreadyExists = false;

        if (observables) {
          blocks.each(observables, function (observable) {
            if (observable === newObservable) {
              alreadyExists = true;
              return false;
            }
          });
          if (!alreadyExists) {
            observables.push(newObservable);
          }
        }
      }
    };
  })();

  var Expression = {
    Create: function (text, attributeName, element) {
      var index = -1;
      var endIndex = 0;
      var result = [];
      var character;
      var startIndex;
      var match;

      while (text.length > ++index) {
        character = text.charAt(index);

        if (character == '{' && text.charAt(index + 1) == '{') {
          startIndex = index + 2;
        } else if (character == '}' && text.charAt(index + 1) == '}') {
          if (startIndex) {
            match = text.substring(startIndex, index);
            if (!attributeName) {
              match = match
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, '\'')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
            }

            character = text.substring(endIndex, startIndex - 2);
            if (character) {
              result.push(character);
            }

            result.push({
              expression: match,
              attributeName: attributeName
            });

            endIndex = index + 2;
          }
          startIndex = 0;
        }
      }

      character = text.substring(endIndex);
      if (character) {
        result.push(character);
      }

      result.text = text;
      result.attributeName = attributeName;
      result.element = element;
      return match ? result : null;
    },

    GetValue: function (context, elementData, expression) {
      var value = '';

      if (!context) {
        return expression.text;
      }

      blocks.each(expression, function (chunk) {
        if (typeof chunk == 'string') {
          value += chunk;
        } else {
          value += Expression.Execute(context, elementData, chunk, expression).value;
        }
      });

      return value;
    },

    Execute: function (context, elementData, expressionData, entireExpression) {
      var expression = expressionData.expression;
      var attributeName = expressionData.attributeName;
      var expressionObj;
      var observables;
      var result;
      var value;
      var func;

      // jshint -W054
      // Disable JSHint error: The Function constructor is a form of eval
      func = parameterQueryCache[expression] = parameterQueryCache[expression] ||
        new Function('c', 'with(c){with($this){ return ' + expression + '}}');

      Observer.startObserving();

      /* @if DEBUG */ {
        try {
          value = func(context);
        } catch (ex) {
          blocks.debug.expressionFail(expression, entireExpression.element);
        }
      } /* @endif */

      value = func(context);

      result = blocks.unwrap(value);
      result = result == null ? '' : result.toString();
      result = escapeValue(result);

      observables = Observer.stopObserving();

      //for (key in elementData.observables) {
        //  blocks.observable.cache[key]._expressions.push({
        //    length: elementData.length,
        //    element: currentElement,
        //    expression: elementData.expression,
        //    context: elementData.context
        //  });
        //}

      if (blocks.isObservable(value) || observables.length) {
        if (!attributeName) {
          elementData = ElementsData.createIfNotExists();
        }
        if (elementData) {
          elementData.haveData = true;

          expressionObj = {
            length: result.length,
            attr: attributeName,
            context: context,
            elementId: elementData.id,
            expression: expression,
            entire: entireExpression
          };

          blocks.each(observables, function (observable) {
            if (!observable._expressionKeys[elementData.id]) {
              observable._expressionKeys[elementData.id] = true;
              observable._expressions.push(expressionObj);
            }
          });
        }
        if (!attributeName) {
          result = '<!-- ' + elementData.id + ':blocks -->' + result;
        }
      }

      return {
        value: result,
        elementData: elementData
      };
    }
  };

  var browser = {};

  function parseVersion(matches) {
    if (matches) {
      return parseFloat(matches[1]);
    }
    return undefined;
  }

  if (typeof document !== 'undefined') {
    blocks.extend(browser, {
      IE: document && (function () {
        var version = 3;
        var div = document.createElement('div');
        var iElems = div.getElementsByTagName('i');

        /* jshint noempty: false */
        // Disable JSHint error: Empty block
        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
        while (
          div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
          iElems[0]
          ) { }
        return version > 4 ? version : undefined;
      }()),

      Opera: (window && window.navigator && window.opera && window.opera.version && parseInt(window.opera.version(), 10)) || undefined,

      Safari: window && window.navigator && parseVersion(window.navigator.userAgent.match(/^(?:(?!chrome).)*version\/([^ ]*) safari/i)),

      Firefox: window && window.navigator && parseVersion(window.navigator.userAgent.match(/Firefox\/([^ ]*)/))
    });
  }

  function on(element, eventName, handler) {
    if (Workarounds[eventName]) {
      Workarounds[eventName](element, handler, function (eventName, callback) {
        addListener(element, eventName, callback);
      });
    } else {
      addListener(element, eventName, handler);
    }
  }

  var Workarounds = {
    input: function (element, handler, subscribe) {
      var timeout;

      function call(e) {
        clearTimeout(timeout);
        handler(e);
      }

      function deferCall() {
        if (!timeout) {
          timeout = setTimeout(call, 4);
        }
      }

      if (browser.IE < 10) {
        subscribe('propertychange', function (e) {
          if (e.originalEvent.propertyName === 'value') {
            call(e);
          }
        });

        if (browser.IE == 8) {
          subscribe('keyup', call);
          subscribe('keydown', call);
        }
        if (browser.IE >= 8) {
          globalSelectionChangeHandler(element, call);
          subscribe('dragend', deferCall);
        }
      } else {
        subscribe('input', call);

        if (browser.Safari < 7 && element.tagName.toLowerCase() == 'textarea') {
          subscribe('keydown', deferCall);
          subscribe('paste', deferCall);
          subscribe('cut', deferCall);
        } else if (browser.Opera < 11) {
          subscribe('keydown', deferCall);
        } else if (browser.Firefox < 4.0) {
          subscribe('DOMAutoComplete', call);
          subscribe('dragdrop', call);
          subscribe('drop', call);
        }
      }
    }
  };

  var globalSelectionChangeHandler = (function () {
    var isRegistered = false;

    function selectionChangeHandler(e) {
      var element = this.activeElement;
      var handler = element && ElementsData.data(element, 'selectionchange');
      if (handler) {
        handler(e);
      }
    }

    return function (element, handler) {
      if (!isRegistered) {
        addListener(element.ownerDocument, 'selectionchange', selectionChangeHandler);
        isRegistered = true;
      }
      ElementsData.createIfNotExists(element).selectionChange = handler;
    };
  })();

  function HtmlElement(element) {
    if (!HtmlElement.prototype.isPrototypeOf(this)) {
      return new HtmlElement(element);
    }
    this._element = element;
  }

  var Empty;
  HtmlElement.Empty = function () {
    if (!Empty) {
      Empty = {};
      for (var key in HtmlElement.prototype) {
        Empty[key] = blocks.noop;
      }
    }
    return Empty;
  };

  HtmlElement.ValueTagNames = {
   input: true,
   textarea: true,
   select: true
  };

  HtmlElement.ValueTypes = {
   file: true,
   hidden: true,
   password: true,
   text: true,

   // New HTML5 Types
   color: true,
   date: true,
   datetime: true,
   'datetime-local': true,
   email: true,
   month: true,
   number: true,
   range: true,
   search: true,
   tel: true,
   time: true,
   url: true,
   week: true
  };

  HtmlElement.Props = {
   'for': true,
   'class': true,
   value: true,
   checked: true,
   tabindex: true,
   className: true,
   htmlFor: true
  };

  HtmlElement.PropFix = {
   'for': 'htmlFor',
   'class': 'className',
   tabindex: 'tabIndex'
  };

  HtmlElement.AttrFix = {
   className: 'class',
   htmlFor: 'for'
  };

  HtmlElement.prototype = {
   addClass: function (className) {
     setClass('add', this._element, className);
   },

   removeClass: function (className) {
     setClass('remove', this._element, className);
   },

   html: function (html) {
     html = html.toString();
     if (browser.IE < 10) {
       while (this._element.firstChild) {
         this._element.removeChild(this._element.firstChild);
       }
       this._element.appendChild(createFragment(html));
     } else {
       this._element.innerHTML = html;
     }
   },

   attr: function (attributeName, attributeValue) {
     var isProperty = HtmlElement.Props[attributeName];
     var element = this._element;
     attributeName = HtmlElement.PropFix[attributeName.toLowerCase()] || attributeName;

     if (blocks.core.skipExecution &&
       blocks.core.skipExecution.element === element &&
       blocks.core.skipExecution.attributeName == attributeName) {
       return;
     }

     if (attributeName == 'checked') {
       if (attributeValue != 'checked' &&
         typeof attributeValue == 'string' &&
         element.getAttribute('type') == 'radio' &&
         attributeValue != element.value && element.defaultValue != null && element.defaultValue !== '') {

         attributeValue = false;
       } else {
         attributeValue = !!attributeValue;
       }
     }

     if (arguments.length === 1) {
       return isProperty ? element[attributeName] : element.getAttribute(attributeName);
     } else if (attributeValue != null) {
       if (attributeName == 'value' && element.tagName.toLowerCase() == 'select') {
         attributeValue = keys(blocks.toArray(attributeValue));
         blocks.each(element.children, function (child) {
           child.selected = !!attributeValue[child.value];
         });
       } else {
         if (isProperty) {
           element[attributeName] = attributeValue;
         } else {
           element.setAttribute(attributeName, attributeValue);
         }
       }
     } else {
       if (isProperty) {
         if (attributeName == 'value' && element.tagName.toLowerCase() == 'select') {
           element.selectedIndex = -1;
         } else if (element[attributeName]) {
           element[attributeName] = '';
         }
       } else {
         element.removeAttribute(attributeName);
       }
     }
   },

   removeAttr: function (attributeName) {
     this.attr(attributeName, null);
   },

   css: function (name, value) {
     // IE7 will thrown an error if you try to set element.style[''] (with empty string)
     if (!name) {
       return;
     }

     var element = this._element;

     if (name == 'display') {
       animation.setVisibility(element, value == 'none' ? false : true);
     } else {
       element.style[name] = value;
     }
   },

   on: function (eventName, handler) {
     on(this._element, eventName, handler);
   },

   off: function () {

   }
  };


  function VirtualElement(tagName) {
    if (!VirtualElement.prototype.isPrototypeOf(this)) {
      return new VirtualElement(tagName);
    }

    this._tagName = tagName ? tagName.toString().toLowerCase() : null;
    this._attributes = {};
    this._attributeExpressions = [];
    this._parent = null;
    this._children = [];
    this._isSelfClosing = false;
    this._haveAttributes = true;
    this._innerHTML = null;
    this._renderMode = VirtualElement.RenderMode.All;
    this._haveStyle = false;
    this._style = {};
    this._changes = null;

    if (blocks.isElement(tagName)) {
      this._el = HtmlElement(tagName);
    } else {
      this._el = HtmlElement.Empty();
    }
  }

  blocks.VirtualElement = blocks.inherit(VirtualElement, {
    tagName: function (tagName) {
      if (tagName) {
        this._tagName = tagName;
        return this;
      }
      return this._tagName;
    },

    html: function (html) {
      if (arguments.length > 0) {
        html = html == null ? '' : html;
        this._innerHTML = html;
        this._children = [];
        this._el.html(html);
        return this;
      }
      return this._innerHTML || '';
    },

    text: function (text) {
      if (arguments.length > 0) {
        if (text != null) {
          text = escapeValue(text);
          this.html(text);
        }
        return this;
      }
      return this.html();
    },

    parent: function () {
      return this._parent;
    },

    children: function (value) {
      if (typeof value === 'number') {
        return this._children[value];
      }
      return this._children;
    },

    // Note!
    // The attributes could be optimized by using array instead of object
    // firstly this could sound insane. However, when generating the html
    // output for each elements the attributes object is looped with for...in
    // loop which is slow because the browser should construct an internal collection
    // to loop for.
    // However, this should be investigated further in order to be sure it is an
    // optimization rather than the opposite
    attr: function (attributeName, attributeValue) {
      var _this = this;
      var returnValue;

      if (typeof attributeName == 'string') {
        var tagName = this._tagName;
        var type = this._attributes.type;
        var rawAttributeValue = attributeValue;
        var elementData = ElementsData.data(this);

        attributeName = blocks.unwrapObservable(attributeName);
        attributeName = HtmlElement.AttrFix[attributeName] || attributeName;
        attributeValue = blocks.unwrapObservable(attributeValue);

        if (blocks.isObservable(rawAttributeValue) && attributeName == 'value' && HtmlElement.ValueTagNames[tagName] && (!type || HtmlElement.ValueTypes[type])) {
          elementData.subscribe = tagName == 'select' ? 'change' : 'input';
          elementData.valueObservable = rawAttributeValue;
        } else if (blocks.isObservable(rawAttributeValue) &&
          attributeName == 'checked' && (type == 'checkbox' || type == 'radio')) {

          elementData.subscribe = 'click';
          elementData.valueObservable = rawAttributeValue;
        }

        if (arguments.length == 1) {
          returnValue = this._attributes[attributeName];
          return returnValue === undefined ? null : returnValue;
        }

        if (attributeName == 'checked' && attributeValue != null && !this._fake) {
          if (this._attributes.type == 'radio' &&
            typeof attributeValue == 'string' &&
            attributeValue != this._attributes.value && this._attributes.value != null) {

            attributeValue = null;
          } else {
            attributeValue = attributeValue ? 'checked' : null;
          }
        } else if (attributeName == 'disabled') {
          attributeValue = attributeValue ? 'disabled' : null;
        }

        if (tagName == 'textarea' && attributeName == 'value' && this._el == HtmlElement.Empty()) {
          this.html(attributeValue);
        } else if (attributeName == 'value' && tagName == 'select') {
          this._values = keys(blocks.toArray(attributeValue));
          this._el.attr(attributeName, attributeValue);
        } else {
          if (this._changes) {
            this._changes.attributes.push([attributeName, this._attributes[attributeName]]);
          }
          this._haveAttributes = true;
          this._attributes[attributeName] = attributeValue;
          this._el.attr(attributeName, attributeValue);
        }
      } else if (blocks.isPlainObject(attributeName)) {
        blocks.each(attributeName, function (val, key) {
          _this.attr(key, val);
        });
      }

      return this;
    },

    removeAttr: function (attributeName) {
      this._attributes[attributeName] = null;
      this._el.removeAttr(attributeName);
      return this;
    },

    css: function (propertyName, value) {
      var _this = this;

      if (typeof propertyName == 'string') {
        propertyName = blocks.unwrap(propertyName);
        value = blocks.unwrap(value);

        if (!propertyName) {
          return;
        }

        propertyName = propertyName.toString().replace(/-\w/g, function (match) {
          return match.charAt(1).toUpperCase();
        });

        if (arguments.length === 1) {
          value = this._style[propertyName];
          return value === undefined ? null : value;
        }

        if (propertyName == 'display') {
          value = value == 'none' || (!value && value !== '') ? 'none' : '';
        }

        if (this._changes) {
          this._changes.styles.push([propertyName, this._style[propertyName]]);
        }
        this._haveStyle = true;
        if (!VirtualElement.CssNumbers[propertyName]) {
          value = blocks.toUnit(value);
        }
        this._style[propertyName] = value;
        this._el.css(propertyName, value);
      } else if (blocks.isPlainObject(propertyName)) {
        blocks.each(propertyName, function (val, key) {
          _this.css(key, val);
        });
      }

      return this;
    },

    addChild: function (element, index) {
      var children = this._template || this._children;
      if (element) {
        element._parent = this;
        if (this._childrenEach || this._each) {
          element._each = true;
        } else if (this._el._element) {
          if (typeof index === 'number') {
            this._el.element.insertBefore(
              createFragment(element.render(blocks.domQuery(this))), this._el.element.childNodes[index]);
          } else {
            this._el._element.appendChild(
              createFragment(element.render(blocks.domQuery(this))));
          }
        }
        if (typeof index === 'number') {
          children.splice(index, 0, element);
        } else {
          children.push(element);
        }
      }
      return this;
    },

    addClass: function (className) {
      setClass('add', this, className);
      this._el.addClass(className);
      return this;
    },

    removeClass: function (className) {
      setClass('remove', this, className);
      this._el.removeClass(className);
      return this;
    },

    toggleClass: function (className, condition) {
      if (condition === false) {
        this.removeClass(className);
      } else {
        this.addClass(className);
      }
    },

    hasClass: function (className) {
      return getClassIndex(this._attributes[classAttr], className) != -1;
    },

    renderBeginTag: function () {
      var html;

      //executeFormatQueries(this);

      html = '<' + this._tagName;
      if (this._haveAttributes) {
        html += this._renderAttributes();
      }
      if (this._haveStyle) {
        html += generateStyleAttribute(this._style);
      }
      html += this._isSelfClosing ? ' />' : '>';

      return html;
    },

    renderEndTag: function () {
      if (this._isSelfClosing) {
        return '';
      }
      return '</' + this._tagName + '>';
    },

    render: function (domQuery) {
      var html = '';
      var childHtml = '';
      var htmlElement = this._el;

      this._el = HtmlElement.Empty();

      this._execute(domQuery);

      this._el = htmlElement;

      if (this._renderMode != VirtualElement.RenderMode.None) {
        if (this._renderMode != VirtualElement.RenderMode.ElementOnly) {
          if (this._innerHTML != null) {
            childHtml = this._innerHTML;
          } else {
            childHtml = this.renderChildren(domQuery);
          }
        }

        html += this.renderBeginTag();

        html += childHtml;

        html += this.renderEndTag();
      }

      return html;
    },

    renderChildren: function (domQuery) {
      var html = '';
      var children = this._template || this._children;
      var length = children.length;
      var index = -1;
      var child;

      while (++index < length) {
        child = children[index];
        if (typeof child == 'string') {
          html += child;
        } else if (VirtualElement.Is(child)) {
          child._each = child._each || this._each;
          html += child.render(domQuery);
        } else if (domQuery) {
          html += Expression.GetValue(domQuery._context, null, child);
        } else {
          html += Expression.GetValue(null, null, child);
        }
      }

      return html;
    },

    sync: function (domQuery) {
      this._execute(domQuery);

      var children = this._children;
      var length = children.length;
      var index = -1;
      var htmlElement;
      var lastVirtual;
      var child;

      this.renderBeginTag();

      if (this._innerHTML || this._childrenEach) {
        this.renderEndTag();
        return;
      }

      while (++index < length) {
        child = children[index];
        if (VirtualElement.Is(child)) {
          child._each = child._each || this._each;

          child.sync(domQuery);

          htmlElement = null;
          lastVirtual = child;
        } else if (typeof child != 'string' && domQuery) {
          htmlElement = (htmlElement && htmlElement.nextSibling) || (lastVirtual && lastVirtual._el._element.nextSibling);
          if (!htmlElement) {
            if (this._el._element.nodeType == 1) {
              htmlElement = this._el._element.childNodes[0];
            } else {
              htmlElement = this._el._element.nextSibling;
            }
          }
          if (htmlElement) {
            htmlElement.parentNode.insertBefore(createFragment(Expression.GetValue(domQuery._context, null, child)), htmlElement);
            htmlElement.parentNode.removeChild(htmlElement);
          }
        }
      }

      this.renderEndTag();
    },

    _execute: function (domQuery) {
      if (!domQuery) {
        return;
      }
      if (this._each) {
        this._revertChanges();
        this._trackChanges();
        this._el = HtmlElement.Empty();
      }

      if (this._renderMode != VirtualElement.RenderMode.None) {
        ElementsData.createIfNotExists(this);
        domQuery.applyContextToElement(this);
        this._executeAttributeExpressions(domQuery._context);
        domQuery.executeElementQuery(this);
        ElementsData.clear(this);
      }
    },

    _renderAttributes: function () {
      var attributes = this._attributes;
      var html = '';
      var key;
      var value;

      if (this._tagName == 'option' && this._parent._values) {
        attributes.selected = this._parent._values[attributes.value] ? 'selected' : null;
      }

      for (key in attributes) {
        value = attributes[key];
        if (value === '') {
          html += ' ' + key;
        } else if (value != null) {
          html += ' ' + key + '="' + value + '"';
        }
      }

      return html;
    },

    _createAttributeExpressions: function (serverData) {
      var attributeExpressions = this._attributeExpressions;
      var dataId = this._attributes[dataIdAttr];
      var each = this._each;
      var expression;

      blocks.each(this._attributes, function (attributeValue, attributeName) {
        if (!each && serverData && serverData[dataId + attributeName]) {
          expression = Expression.Create(serverData[dataId + attributeName], attributeName);
        } else {
          expression = Expression.Create(attributeValue, attributeName);
        }
        if (expression) {
          attributeExpressions.push(expression);
        }
      });
    },

    _executeAttributeExpressions: function (context) {
      var element = this._each || HtmlElement.Empty() === this._el ? this : this._el;
      var elementData = ElementsData.data(this);

      blocks.each(this._attributeExpressions, function (expression) {
        element.attr(expression.attributeName, Expression.GetValue(context, elementData, expression));
      });
    },

    _revertChanges: function () {
      if (!this._changes) {
        return;
      }
      var elementStyles = this._style;
      var elementAttributes = this._attributes;
      var changes = this._changes;
      var styles = changes.styles;
      var attributes = changes.attributes;
      var length = Math.max(styles.length, attributes.length);
      var i = length - 1;
      var style;
      var attribute;

      for (; i >= 0; i--) {
        style = styles[i];
        attribute = attributes[i];
        if (style) {
          elementStyles[style[0]] = style[1];
        }
        if (attribute) {
          elementAttributes[attribute[0]] = attribute[1];
        }
      }

      this._attributes[classAttr] = changes[classAttr];
      this._tagName = changes.tagName;
      this._innerHTML = changes.html;
      this._renderMode = VirtualElement.RenderMode.All;
    },

    _trackChanges: function () {
      this._changes = {
        styles: [],
        attributes: [],
        'class': this._attributes[classAttr],
        html: this._innerHTML,
        tagName: this._tagName
      };
    },

    _removeRelation: function () {
      this._el = HtmlElement.Empty();
    }
  });

  VirtualElement.Is = function (value) {
    return VirtualElement.prototype.isPrototypeOf(value);
  };

  VirtualElement.RenderMode = {
    All: 0,
    ElementOnly: 2,
    None: 4
  };

  VirtualElement.CssNumbers = {
    'columnCount': true,
    'fillOpacity': true,
    'flexGrow': true,
    'flexShrink': true,
    'fontWeight': true,
    'lineHeight': true,
    'opacity': true,
    'order': true,
    'orphans': true,
    'widows': true,
    'zIndex': true,
    'zoom': true
  };

  function generateStyleAttribute(style) {
    var html = ' style="';
    var haveStyle = false;
    var key;
    var value;

    for (key in style) {
      value = style[key];
      if (value || value === 0) {
        haveStyle = true;
        key = key.replace(/[A-Z]/g, replaceStyleAttribute);
        html += key;
        html += ':';
        html += value;
        html += ';';
      }
    }
    html += '"';
    return haveStyle ? html : '';
  }

  //function generateStyleValue(style) {
  //  var html = '';
  //  var haveStyle = false;
  //  var key;
  //  var value;
  //
  //  for (key in style) {
  //    value = style[key];
  //    if (value != null) {
  //      haveStyle = true;
  //      key = key.replace(/[A-Z]/g, replaceStyleAttribute);
  //      html += key;
  //      html += ':';
  //      html += value;
  //      html += ';';
  //    }
  //  }
  //  html += '';
  //  return html;
  //}

  function replaceStyleAttribute(match) {
    return '-' + match.toLowerCase();
  }


  var classListMultiArguments = true;
  if (typeof document !== 'undefined') {
    var element = document.createElement('div');
    if (element.classList) {
      element.classList.add('a', 'b');
      classListMultiArguments = element.className == 'a b';
    }
  }

  function setClass(type, element, classNames) {
    if (classNames != null) {
      classNames = blocks.isArray(classNames) ? classNames : classNames.toString().split(' ');
      var i = 0;
      var classAttribute;
      var className;
      var index;

      if (VirtualElement.Is(element)) {
        classAttribute = element._attributes[classAttr];
      } else if (element.classList) {
        if (classListMultiArguments) {
          element.classList[type].apply(element.classList, classNames);
        } else {
          blocks.each(classNames, function (value) {
            element.classList[type](value);
          });
        }
        return;
      } else {
        classAttribute = element.className;
      }
      classAttribute = classAttribute || '';

      for (; i < classNames.length; i++) {
        className = classNames[i];
        index = getClassIndex(classAttribute, className);
        if (type == 'add') {
          if (index < 0) {
            if (classAttribute !== '') {
              className = ' ' + className;
            }
            classAttribute += className;
          }
        } else if (index != -1) {
          classAttribute = (classAttribute.substring(0, index) + ' ' +
          classAttribute.substring(index + className.length + 1, classAttribute.length)).replace(trimRegExp, '');
        }
      }

      if (VirtualElement.Is(element)) {
        element._attributes[classAttr] = classAttribute;
      } else {
        element.className = classAttribute;
      }
    }
  }

  var animation = {
    insert: function (parentElement, index, chunk) {
      index = getIndexOffset(parentElement, index);
      var insertPositionNode = parentElement.childNodes[index];
      var childNodesCount;
      var firstChild;

      blocks.each(chunk, function (node) {
        childNodesCount = node.nodeType == 11 ? node.childNodes.length : 0;
        firstChild = node.childNodes ? node.childNodes[0] : undefined;

        if (insertPositionNode) {
          //checkItemExistance(insertPositionNode);
          parentElement.insertBefore(node, insertPositionNode);
        } else {
          //checkItemExistance(parentElement.childNodes[parentElement.childNodes.length - 1]);
          parentElement.appendChild(node);
        }

        if (childNodesCount) {
          while (childNodesCount) {
            animateDomAction('add', firstChild);
            firstChild = firstChild.nextSibling;
            childNodesCount--;
          }
        } else {
          animateDomAction('add', node);
        }
      });
    },

    remove: function (parentElement, index, count) {
      var i = 0;
      var node;

      index = getIndexOffset(parentElement, index);

      for (; i < count; i++) {
        node = parentElement.childNodes[index];
        if (node) {
          if (animateDomAction('remove', node)) {
            index++;
          }
        }
      }
    },

    setVisibility: function (element, visible) {
      if (visible) {
        animation.show(element);
      } else {
        animation.hide(element);
      }
    },

    show: function (element) {
      animateDomAction('show', element);
    },

    hide: function (element) {
      animateDomAction('hide', element);
    }
  };

  function getIndexOffset(parentElement, index) {
    var elementData = ElementsData.data(parentElement);
    if (elementData && elementData.animating > 0) {
      var childNodes = parentElement.childNodes;
      var childIndex = 0;
      var currentIndex = 0;
      var className;

      while (index != currentIndex) {
        if (!childNodes[childIndex]) {
          return Number.POSITIVE_INFINITY;
        }
        className = childNodes[childIndex].className;
        childIndex++;

        if (getClassIndex(className, 'b-hide') == -1) {
          currentIndex++;
        }
      }

      if (!childNodes[childIndex]) {
        return Number.POSITIVE_INFINITY;
      }

      className = childNodes[childIndex].className;

      while (getClassIndex(className, 'b-hide') != -1) {
        childIndex++;
        if (!childNodes[childIndex]) {
          return Number.POSITIVE_INFINITY;
        }
        className = childNodes[childIndex].className;
      }

      return childIndex;
    }

    return index;
  }

  function animateDomAction(type, element) {
    var animating = false;
    var elementData = ElementsData.createIfNotExists(element);
    var parentElementData = ElementsData.createIfNotExists(element.parentNode);
    var animateCallback = elementData.animateCallback;
    var cssType = type == 'remove' ? 'hide' : type == 'add' ? 'show' : type;
    var disposeCallback = type == 'remove' ? function disposeElement() {
      ElementsData.clear(element, true);
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    } : type == 'hide' ? function hideElement() {
      element.style.display = 'none';
    } : blocks.noop;
    var readyCallback = function () {
      elementData.animating -= 1;
      parentElementData.animating -= 1;
      if (!elementData.animating) {
        disposeCallback();
      }
    };

    if (element.nodeType != 1) {
      disposeCallback();
      return;
    }

    if (cssType == 'show') {
      element.style.display = '';
    }

    if (elementData.preprocess) {
      disposeCallback();
      return;
    }

    if (animateCallback) {
      animating = true;
      elementData.animating += 1;
      parentElementData.animating += 1;
      var context = blocks.context(element);
      var thisArg = context.$view || context.$root;
      animateCallback.call(thisArg, element, readyCallback, cssType);
    }
    return animating || cssAnimate(cssType, element, disposeCallback, readyCallback);
  }

  function cssAnimate(type, element, disposeCallback, readyCallback) {
    if (typeof window == 'undefined' || window.ontransitionend === undefined) {
      disposeCallback();
      return;
    }
    setClass('add', element, 'b-' + type);

    var computedStyle = window.getComputedStyle(element);
    var prefix = '';
    var eventName;
    if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
      prefix = '-webkit-';
      eventName = 'webkitAnimationEnd';
    } else {
      eventName = 'animationend';
    }

    var transitionDuration = parseFloat(computedStyle['transition-duration']) || 0;
    var transitionDelay = parseFloat(computedStyle['transition-delay']) || 0;
    var animationDuration = parseFloat(computedStyle[prefix + 'animation-duration']) || 0;
    var animationDelay = parseFloat(computedStyle[prefix + 'animation-delay']) || 0;

    if (transitionDuration <= 0 && transitionDelay <= 0 &&
      animationDuration <= 0 && animationDelay <= 0) {

      setClass('remove', element, 'b-' + type);
      disposeCallback();
      return;
    }

    ElementsData.createIfNotExists(element).animating += 1;
    ElementsData.createIfNotExists(element.parentNode).animating += 1;

    setTimeout(function () {
      setClass('add', element, 'b-' + type + '-end');
      element.addEventListener('transitionend', end, false);
      element.addEventListener(eventName, end, false);
    }, 1);

    function end() {
      setClass('remove', element, 'b-' + type);
      setClass('remove', element, 'b-' + type + '-end');
      readyCallback();
      element.removeEventListener('transitionend', end, false);
      element.removeEventListener(eventName, end, false);
    }

    return true;
  }
    var dataQueryAttr = 'data-query';



  function HtmlCommentElement(commentElement) {
    if (!HtmlCommentElement.prototype.isPrototypeOf(this)) {
      return new HtmlCommentElement(commentElement);
    }

    this._element = commentElement;
  }

  HtmlCommentElement.prototype = blocks.clone(HtmlElement.Empty());

  blocks.extend(HtmlCommentElement.prototype, {
    html: function (html) {
      // var commentElement = this._element.nextSibling;
      // var parentNode = commentElement.parentNode;
      // parentNode.insertBefore(DomQuery.CreateFragment(html), commentElement);
      // parentNode.removeChild(commentElement);
      var commentElement = this._element;
      var parentNode = commentElement.parentNode;
      var currentElement = commentElement.nextSibling;
      var temp;
      var count = 0;

      while (currentElement && (currentElement.nodeType != 8 || currentElement.nodeValue.indexOf('/blocks') == -1)) {
        count++;
        temp = currentElement.nextSibling;
        parentNode.removeChild(currentElement);
        currentElement = temp;
      }

      parentNode.insertBefore(createFragment(html), commentElement.nextSibling);
      //parentNode.removeChild(currentElement);
      return count;
    },

    attr: function (attributeName, attributeValue) {
      if (attributeName == dataIdAttr && attributeValue) {
        var commentElement = this._element;
        var endComment = this._endElement;
        commentElement.nodeValue = ' ' + attributeValue + ':' + commentElement.nodeValue.replace(trimRegExp, '') + ' ';
        endComment.nodeValue = ' ' + attributeValue + ':' + endComment.nodeValue.replace(trimRegExp, '') + ' ';
        return this;
      }
      return this;
    }
  });

  function VirtualComment(commentText) {
    if (!VirtualComment.prototype.isPrototypeOf(this)) {
      return new VirtualComment(commentText);
    }

    this.__Class__();

    if (commentText.nodeType == 8) {
      this._commentText = commentText.nodeValue;
      this._el = HtmlCommentElement(commentText);
    } else {
      this._commentText = commentText;
    }
  }

  blocks.VirtualComment = blocks.inherit(VirtualElement, VirtualComment, {
    renderBeginTag: function () {
      var dataId = this._attributes[dataIdAttr];
      var html = '<!-- ';

      if (dataId) {
        html += dataId + ':';
      }
      html += this._commentText.replace(trimRegExp, '') + ' -->';

      return html;
    },

    renderEndTag: function () {
      var dataId = this._attributes[dataIdAttr];
      var html = '<!-- ';

      if (dataId) {
        html += dataId + ':';
      }
      html += '/blocks -->';
      return html;
    },

    _executeAttributeExpressions: blocks.noop
  });

  VirtualComment.Is = function (value) {
    return VirtualComment.prototype.isPrototypeOf(value);
  };

  function createVirtual(htmlElement, parentElement) {
    var serverData = window.__blocksServerData__;
    var elements = [];
    var element;
    var tagName;
    var elementAttributes;
    var htmlAttributes;
    var htmlAttribute;
    var nodeType;
    var commentText;
    var commentTextTrimmed;
    var data;

    while (htmlElement) {
      nodeType = htmlElement.nodeType;
      if (nodeType == 1) {
        // HtmlDomElement
        tagName = htmlElement.tagName.toLowerCase();
        element = new VirtualElement(htmlElement);
        element._tagName = tagName;
        element._parent = parentElement;
        if (parentElement) {
          element._each = parentElement._each || parentElement._childrenEach;
        }
        element._haveAttributes = false;
        htmlAttributes = htmlElement.attributes;
        elementAttributes = {};
        for (var i = 0; i < htmlAttributes.length; i++) {
          htmlAttribute = htmlAttributes[i];
          // the style should not be part of the attributes. The style is handled individually.
          if (htmlAttribute.nodeName !== 'style' &&
            (htmlAttribute.specified ||
              //IE7 wil return false for .specified for the "value" attribute - WTF!
            (browser.IE < 8 && htmlAttribute.nodeName == 'value' && htmlAttribute.nodeValue))) {
            elementAttributes[htmlAttribute.nodeName.toLowerCase()] = browser.IE < 11 ? htmlAttribute.nodeValue : htmlAttribute.value;
            element._haveAttributes = true;
          }
        }
        element._attributes = elementAttributes;
        element._createAttributeExpressions(serverData);

        if (htmlElement.style.cssText) {
          element._haveStyle = true;
          element._style = generateStyleObject(htmlElement.style.cssText);
        }

        setIsSelfClosing(element);
        if (tagName == 'script' || tagName == 'style' || tagName == 'code' || element.hasClass('bl-skip')) {
          element._innerHTML = htmlElement.innerHTML;
        } else {
          element._children = createVirtual(htmlElement.childNodes[0], element);
        }

        elements.push(element);
      } else if (nodeType == 3) {
        // TextNode
        //if (htmlElement.data.replace(trimRegExp, '').replace(/(\r\n|\n|\r)/gm, '') !== '') {
        //
        //}
        data = escapeValue(htmlElement.data);
        elements.push(Expression.Create(data, null, htmlElement) || data);
      } else if (nodeType == 8) {
        // Comment
        commentText = htmlElement.nodeValue;
        commentTextTrimmed = commentText.replace(trimRegExp, '');
        if (commentTextTrimmed.indexOf('blocks') === 0) {
          element = new VirtualComment(htmlElement);
          element._parent = parentElement;
          element._attributes[dataQueryAttr] = commentTextTrimmed.substring(6);
          data = createVirtual(htmlElement.nextSibling, element);
          element._children = data.elements;
          element._el._endElement = data.htmlElement;
          htmlElement = data.htmlElement || htmlElement;
          elements.push(element);
        } else if (VirtualComment.Is(parentElement) && commentTextTrimmed.indexOf('/blocks') === 0) {
          return {
            elements: elements,
            htmlElement: htmlElement
          };
        } else if (VirtualComment.Is(parentElement)) {
          elements.push('<!--' + commentText + '-->');
        } else if (serverData) {
          var number = parseInt(/[0-9]+/.exec(commentTextTrimmed), 10);
          if (!blocks.isNaN(number) && serverData[number]) {
            elements.push(Expression.Create(serverData[number]));
          }
        } else if (commentTextTrimmed.indexOf('/blocks') !== 0) {
          elements.push('<!--' + commentText + '-->');
        }
      }
      htmlElement = htmlElement.nextSibling;
    }
    return elements;
  }

  function generateStyleObject(styleString) {
    var styles = styleString.split(';');
    var styleObject = {};
    var index;
    var style;
    var values;

    for (var i = 0; i < styles.length; i++) {
      style = styles[i];
      if (style) {
        index = style.indexOf(':');
        if (index != -1) {
          values = [style.substring(0, index), style.substring(index + 1)];
          styleObject[values[0].toLowerCase().replace(trimRegExp, '')] = values[1].replace(trimRegExp, '');
        }
      }
    }

    return styleObject;
  }

  var isSelfClosingCache = {};
  function setIsSelfClosing(element) {
    var tagName = element._tagName;
    var domElement;

    if (isSelfClosingCache[tagName] !== undefined) {
      element._isSelfClosing = isSelfClosingCache[tagName];
      return;
    }
    domElement = document.createElement('div');
    domElement.appendChild(document.createElement(tagName));
    isSelfClosingCache[tagName] = element._isSelfClosing = domElement.innerHTML.indexOf('</') === -1;
  }

  function createProperty(propertyName) {
    return function (value) {
      if (arguments.length === 0) {
        return this[propertyName];
      }
      this[propertyName] = value;
      return this;
    };
  }


  function parseQuery(query, callback) {
    var character = 0;
    var bracketsCount = 0;
    var curlyBracketsCount = 0;
    var squareBracketsCount = 0;
    var isInSingleQuotes = false;
    var isInDoubleQuotes = false;
    var startIndex = 0;
    var parameters = [];
    var currentParameter;
    var methodName;

    query = query || '';

    for (var i = 0; i < query.length; i++) {
      character = query.charAt(i);

      if (!isInSingleQuotes && !isInDoubleQuotes) {
        if (character == '[') {
          squareBracketsCount++;
        } else if (character == ']') {
          squareBracketsCount--;
        } else if (character == '{') {
          curlyBracketsCount++;
        } else if (character == '}') {
          curlyBracketsCount--;
        }
      }

      if (curlyBracketsCount !== 0 || squareBracketsCount !== 0) {
        continue;
      }

      if (character == '\'') {
        isInSingleQuotes = !isInSingleQuotes;
      } else if (character == '"') {
        isInDoubleQuotes = !isInDoubleQuotes;
      }

      if (isInSingleQuotes || isInDoubleQuotes) {
        continue;
      }

      if (character == '(') {
        if (bracketsCount === 0) {
          methodName = query.substring(startIndex, i).replace(trimRegExp, '');
          startIndex = i + 1;
        }
        bracketsCount++;
      } else if (character == ')') {
        bracketsCount--;
        if (bracketsCount === 0) {
          currentParameter = query.substring(startIndex, i).replace(trimRegExp, '');
          if (currentParameter.length) {
            parameters.push(currentParameter);
          }

          if (methodName) {
            methodName = methodName.replace(/^("|')+|("|')+$/g, ''); // trim single and double quotes
            callback(methodName, parameters);
          }
          parameters = [];
          methodName = undefined;
        }
      } else if (character == ',' && bracketsCount == 1) {
        currentParameter = query.substring(startIndex, i).replace(trimRegExp, '');
        if (currentParameter.length) {
          parameters.push(currentParameter);
        }
        startIndex = i + 1;
      } else if (character == '.' && bracketsCount === 0) {
        startIndex = i + 1;
      }
    }
  }

  function DomQuery(options) {
    this._options = options || {};
    this._contextProperties = {};
  }

  DomQuery.QueryCache = {};

  DomQuery.prototype = {
    options: function () {
      return this._options;
    },

    dataIndex: createProperty('_dataIndex'),

    context: createProperty('_context'),

    popContext: function () {
      if (this._context) {
        this._context = this._context.$parentContext;
      }
    },

    applyContextToElement: function (element) {
      var data = ElementsData.createIfNotExists(element);
      data.domQuery = this;
      data.context = this._context;

      if (this._hasChanged || (element._each && !element._parent._each)) {
        if (element._parent && !element._each) {
          data = ElementsData.createIfNotExists(element._parent);
          data.childrenContext = this._context;
        }

        this._hasChanged = false;
        data.haveData = true;
      }
    },

    pushContext: function (newModel) {
      var context = this._context;
      var models = context ? context.$parents.slice(0) : [];
      var newContext;

      this._hasChanged = true;

      if (context) {
        models.unshift(context.$this);
      }

      newContext = {
        $this: newModel,
        $root: context ? context.$root : newModel,
        $parent: context ? context.$this : null,
        $parents: context ? models : [],
        $index: this._dataIndex || null,
        $parentContext: context || null
      };
      newContext.$context = newContext;
      this._context = newContext;
      this.applyDefinedContextProperties();

      return newContext;
    },

    contextBubble: function (context, callback) {
      var currentContext = this._context;
      this._context = context;
      callback();
      this._context = currentContext;
    },

    addProperty: function (name, value) {
      this._contextProperties[name] = value;
      this.applyDefinedContextProperties();
    },

    removeProperty: function (name) {
      delete this._contextProperties[name];
    },

    applyDefinedContextProperties: function () {
      var context = this._context;
      var contextProperties = this._contextProperties;
      var key;

      for (key in contextProperties) {
        context[key] = contextProperties[key];
      }
    },

    executeElementQuery: function (element) {
      var query = VirtualElement.Is(element) ? element._attributes[dataQueryAttr] :
          element.nodeType == 1 ? element.getAttribute(dataQueryAttr) : element.nodeValue.substring(element.nodeValue.indexOf('blocks') + 6).replace(trimRegExp, '');

      if (query) {
        this.executeQuery(element, query);
      }
    },

    executeQuery: function (element, query) {
      var cache = DomQuery.QueryCache[query];

      if (!cache) {
        cache = DomQuery.QueryCache[query] = [];

        parseQuery(query, function (methodName, parameters) {
          var method = blocks.queries[methodName];
          var methodObj = {
            name: methodName,
            params: parameters,
            query: methodName + '(' + parameters.join(',') + ')'
          };

          if (method) {
            // TODO: Think of a way to remove this approach
            if (methodName == 'attr' || methodName == 'val') {
              cache.unshift(methodObj);
            } else {
              cache.push(methodObj);
            }
          }
          /* @if DEBUG */
          else {
            blocks.debug.queryNotExists(methodObj, element);
          }
          /* @endif */
        });
      }
      this.executeMethods(element, cache);
    },

    executeMethods: function (element, methods) {
      var elementData = ElementsData.data(element);
      var lastObservablesLength = 0;
      var i = 0;
      var method;
      var executedParameters;
      var currentParameter;
      var parameters;
      var parameter;
      var context;
      var func;

      for (; i < methods.length; i++) {
        context = this._context;
        method = blocks.queries[methods[i].name];
        parameters = methods[i].params;
        executedParameters = method.passDomQuery ? [this] : [];
        if (VirtualElement.Is(element) && !method.call && !method.preprocess && (method.update || method.ready)) {
          elementData.haveData = true;
          if (!elementData.execute) {
            elementData.execute = [];
          }
          elementData.execute.push(methods[i]);
          continue;
        }
        Observer.startObserving();
        for (var j = 0; j < parameters.length; j++) {
          parameter = parameters[j];
          // jshint -W054
          // Disable JSHint error: The Function constructor is a form of eval
          func = parameterQueryCache[parameter] = parameterQueryCache[parameter] ||
              new Function('c', 'with(c){with($this){ return ' + parameter + '}}');

          currentParameter = {};

          /* @if DEBUG */ {
            try {
              currentParameter.rawValue = func(context);
            } catch (e) {
              blocks.debug.queryParameterFail(methods[i], parameter, element);
            }
          } /* @endif */
          currentParameter.rawValue = func(context);

          currentParameter.value = blocks.unwrapObservable(currentParameter.rawValue);

          if (method.passDetailValues) {
            currentParameter.isObservable = blocks.isObservable(currentParameter.rawValue);
            currentParameter.containsObservable = Observer.currentObservables().length > lastObservablesLength;
            lastObservablesLength = Observer.currentObservables().length;
            executedParameters.push(currentParameter);
          } else if (method.passRawValues) {
            executedParameters.push(currentParameter.rawValue);
          } else {
            executedParameters.push(currentParameter.value);
          }

          // Handling 'if' queries
          // Example: data-query='if(options.templates && options.templates.item, options.templates.item)'
          if (method === blocks.queries['if'] || method === blocks.queries.ifnot) {
            if ((!currentParameter.value && method === blocks.queries['if']) ||
                (currentParameter.value && method === blocks.queries.ifnot)) {
              if (!parameters[2]) {
                break;
              }
              this.executeQuery(element, parameters[2]);
              break;
            }
            this.executeQuery(element, parameters[1]);
            break;
          }
        }

        /* @if DEBUG */ {
          var params = executedParameters;
          if (method.passDomQuery) {
            params = blocks.clone(executedParameters).slice(1);
          }
          blocks.debug.checkQuery(methods[i].name, params, methods[i], element);
        }/* @endif */

        if (VirtualElement.Is(element)) {
          if (VirtualComment.Is(element) && !method.supportsComments) {
            // TODO: Should throw debug message
            continue;
          }

          if (method.call) {
            if (method.call === true) {
              element[methods[i].name].apply(element, executedParameters);
            } else {
              executedParameters.unshift(method.prefix || methods[i].name);
              element[method.call].apply(element, executedParameters);
            }
          } else if (method.preprocess) {
            if (method.preprocess.apply(element, executedParameters) === false) {
              this.subscribeObservables(methods[i], elementData, context);
              break;
            }
          }
        } else if (method.call) {
          var virtual = ElementsData.data(element).virtual;
          if (virtual._each) {
            virtual = VirtualElement('div');
            virtual._el = HtmlElement(element);
            virtual._fake = true;
          }
          if (method.call === true) {
            virtual[methods[i].name].apply(virtual, executedParameters);
          } else {
            executedParameters.unshift(method.prefix || methods[i].name);
            virtual[method.call].apply(virtual, executedParameters);
          }
        } else if (elementData && elementData.preprocess && method.ready) {
          method.ready.apply(element, executedParameters);
        } else if (method.update) {
          method.update.apply(element, executedParameters);
        }

        this.subscribeObservables(methods[i], elementData, context);
      }
    },

    subscribeObservables: function (method, elementData, context) {
      var observables = Observer.stopObserving();

      if (elementData) {
        elementData.haveData = true;
        blocks.each(observables, function (observable) {
          if (!elementData.observables[observable.__id__ + method.query]) {
            elementData.observables[observable.__id__ + method.query] = observable;
            observable._elements.push({
              elementId: elementData.id,
              cache: [method],
              context: context
            });
          }
        });
      }
    },

    createElementObservableDependencies: function (elements) {
      var currentElement;
      var elementData;
      var tagName;

      for (var i = 0; i < elements.length; i++) {
        currentElement = elements[i];
        tagName = (currentElement.tagName || '').toLowerCase();
        if (currentElement.nodeType === 1 || currentElement.nodeType == 8) {
          elementData = ElementsData.data(currentElement);
          if (elementData) {
            this._context = elementData.context || this._context;
            elementData.dom = currentElement;
            if (elementData.execute) {
              this.executeMethods(currentElement, elementData.execute);
            }
            if (elementData.subscribe) {
              var eventName = elementData.updateOn || elementData.subscribe;
              on(currentElement, eventName, UpdateHandlers[eventName]);
            }
            elementData.preprocess = false;
            this._context = elementData.childrenContext || this._context;
          }
          if (tagName != 'script' && tagName != 'code' &&
            (' ' + currentElement.className + ' ').indexOf('bl-skip') == -1) {

            this.createElementObservableDependencies(currentElement.childNodes);
          }
        }
      }
    },

    createFragment: function (html) {
      var fragment = createFragment(html);
      this.createElementObservableDependencies(fragment.childNodes);

      return fragment;
    },

    cloneContext: function (context) {
      var newContext = blocks.clone(context);
      newContext.$context = newContext;
      return newContext;
    }
  };

  var UpdateHandlers = {
    change: function (e) {
      var target = e.target || e.srcElement;
      UpdateHandlers.getSetValue(target, ElementsData.data(target).valueObservable);
    },

    click: function (e) {
      UpdateHandlers.change(e);
    },

    //keyup: function (e) {

    //},

    input: function (e) {
      var target = e.target || e.srcElement;
      UpdateHandlers.getSetValue(target, ElementsData.data(target).valueObservable);
    },

    keydown: function (e) {
      var target = e.target || e.srcElement;
      var oldValue = target.value;
      var elementData = ElementsData.data(target);

      if (elementData) {
        setTimeout(function () {
          if (oldValue != target.value) {
            UpdateHandlers.getSetValue(target, ElementsData.data(target).valueObservable);
          }
        });
      }
    },

    getSetValue: function (element, value) {
      var tagName = element.tagName.toLowerCase();
      var type = element.getAttribute('type');

      if (type == 'checkbox') {
        value(element.checked);
      } else if (tagName == 'select' && element.getAttribute('multiple')) {
        var values = [];
        var selectedOptions = element.selectedOptions;
        if (selectedOptions) {
          blocks.each(selectedOptions, function (option) {
            values.push(option.getAttribute('value'));
          });
        } else {
          blocks.each(element.options, function (option) {
            if (option.selected) {
              values.push(option.getAttribute('value'));
            }
          });
        }

        value(values);
      } else {
        blocks.core.skipExecution = {
          element: element,
          attributeName: 'value'
        };
        value(element.value);
        blocks.core.skipExecution = undefined;
      }
    }
  };


  /**
  * @namespace blocks.queries
  */
  blocks.extend(queries, {
    /**
     * Executes particular query depending on the condition specified
     *
     * @memberof blocks.queries
     * @param {boolean} condition - The result will determine if the consequent or the alternate query will be executed
     * @param {data-query} consequent - The query that will be executed if the specified condition returns a truthy value
     * @param {data-query} [alternate] - The query that will be executed if the specified condition returns a falsy value
     *
     * @example {html}
     * <div data-query="if(true, setClass('success'), setClass('fail'))"></div>
     * <div data-query="if(false, setClass('success'), setClass('fail'))"></div>
     *
     * <!-- will result in -->
     * <div data-query="if(true, setClass('success'), setClass('fail'))" class="success"></div>
     * <div data-query="if(false, setClass('success'), setClass('fail'))" class="fail"></div>
     */
    'if': {},

    /**
     * Executes particular query depending on the condition specified.
     * The opposite query of the 'if'
     *
     * @memberof blocks.queries
     * @param {boolean} condition - The result will determine if the consequent or the alternate query will be executed
     * @param {data-query} consequent - The query that will be executed if the specified condition returns a falsy value
     * @param {data-query} [alternate] - The query that will be executed if the specified condition returns a truthy value
     *
     * @example {html}
     * <div data-query="if(true, setClass('success'), setClass('fail'))"></div>
     * <div data-query="if(false, setClass('success'), setClass('fail'))"></div>
     *
     * <!-- will result in -->
     * <div data-query="if(true, setClass('success'), setClass('fail'))" class="fail"></div>
     * <div data-query="if(false, setClass('success'), setClass('fail'))" class="success"></div>
     */
    ifnot: {},

    /**
     * Queries and sets the inner html of the element from the template specified
     *
     * @memberof blocks.queries
     * @param {(HTMLElement|string)} template - The template that will be rendered
     * @param {*} value - The value that will used in the template
     * The value could be an element id (the element innerHTML property will be taken), string (the template) or
     * an element (again the element innerHTML property will be taken)
     *
     * @example {html}
     * <script>
     *   blocks.query({
     *     name: 'John Doe',
     *     age: 22
     *   });
     * </script>
     * <script id="user" type="blocks-template">
     *   <h3>{{name}}</h3>
     *   <p>I am {{age}} years old.</p>
     * </script>
     * <div data-query="template('user')">
     * </div>
     *
     * <!-- will result in -->
     * <div data-query="template('user')">
     *   <h3>John Doe</h3>
     *   <p>I am 22 years old.</p>
     * </div>
     */
    template: {
      passDomQuery: true,
      passRawValues: true,

      preprocess: function (domQuery, template, value) {
        var serverData = domQuery._serverData;
        var html;

        template = blocks.$unwrap(template);
        if (blocks.isElement(template)) {
          html = template.innerHTML;
        } else {
          html = document.getElementById(template);
          if (html) {
            html = html.innerHTML;
          } else {
            html = template;
          }
        }
        if (html) {
          if (value) {
            blocks.queries['with'].preprocess.call(this, domQuery, value, '$template');
          }
          if (!serverData || !serverData.templates || !serverData.templates[ElementsData.id(this)]) {
            this.html(html);
            if (!this._each && this._el != HtmlElement.Empty()) {
              this._children = createVirtual(this._el._element.childNodes[0], this);
              this._innerHTML = null;
            }
          }
        }
      }
    },

    /**
     * Creates a variable name that could be used in child elements
     *
     * @memberof blocks.queries
     * @param {string} propertyName - The name of the value that will be
     * created and you could access its value later using that name
     * @param {*} propertyValue - The value that the property will have
     *
     * @example {html}
     * <script>
     *   blocks.query({
     *     strings: {
     *       title: {
     *         text: 'Hello World!'
     *       }
     *     }
     *   });
     * </script>
     * <div data-query="define('$title', strings.title.text)">
     *   The title is {{$title}}.
     * </div>
     *
     * <!-- will result in -->
     * <div data-query="define('$title', strings.title.text)">
     *   The title is Hello World!.
     * </div>
     */
    define: {
      passDomQuery: true,

      preprocess: function (domQuery, propertyName, propertyValue) {
        if (this._renderMode != VirtualElement.RenderMode.None) {
          var currentContext = domQuery.context();
          var newContext = domQuery.cloneContext(currentContext);
          var renderEndTag = this.renderEndTag;

          domQuery.context(newContext);
          domQuery.addProperty(propertyName, propertyValue);

          this.renderEndTag = function () {
            domQuery.removeProperty(propertyName);
            domQuery.context(currentContext);
            return renderEndTag.call(this);
          };
        }
      }
    },

    /**
     * Changes the current context for the child elements.
     * Useful when you will work a lot with a particular value
     *
     * @memberof blocks.queries
     * @param {*} value - The new context
     * @param {string} [name] - Optional name of the new context
     * This way the context will also available under the name not only under the $this context property
     *
     * @example {html}
     * <script>
     *   blocks.query({
     *     ProfilePage: {
     *       user: {
     *         name: 'John Doe',
     *         age: 22
     *       }
     *     }
     *   });
     * </script>
     * <div data-query="view(ProfilePage.user, '$user')">
     *  My name is {{$user.name}} and I am {{$this.age}} years old.
     * </div>
     *
     * <!-- will result in -->
     * <div data-query="view(ProfilePage.user, '$user')">
     *  My name is John Doe and I am 22 years old.
     * </div>
     */
    'with': {
      passDomQuery: true,
      passRawValues: true,

      preprocess: function (domQuery, value, name) {
        if (this._renderMode != VirtualElement.RenderMode.None) {
          var renderEndTag = this.renderEndTag;

          if (name) {
            domQuery.addProperty(name, value);
          }
          domQuery.pushContext(value);

          this.renderEndTag = function () {
            if (name) {
              domQuery.removeProperty(name);
            }
            domQuery.popContext();
            return renderEndTag.call(this);
          };
        }
      }
    },

    /**
     * The each method iterates through an array items or object values
     * and repeats the child elements by using them as a template
     *
     * @memberof blocks.queries
     * @param {Array|Object} collection - The collection to iterate over
     *
     * @example {html}
     * <script>
     *   blocks.query({
     *     items: ['John', 'Doe']
     *   });
     * </script>
     * <ul data-query="each(items)">
     *   <li>{{$this}}</li>
     * </ul>
     *
     * <!-- will result in -->
     * <ul data-query="each(items)">
     *   <li>John</li>
     *   <li>Doe</li>
     * </ul>
     */
    each: {
      passDomQuery: true,

      passRawValues: true,

      supportsComments: true,

      _getStaticHtml: function (domQuery, element) {
        var children = element._children;
        var headers = element._headers;
        var footers = element._footers;
        var index = -1;
        var headerHtml = '';
        var footerHtml = '';
        var length;
        var dataRole;
        var child;

        if (headers) {
          length = Math.max(headers.length, footers.length);

          while (++index < length) {
            if (headers[index]) {
              headerHtml += headers[index].render(domQuery);
            }
            if (footers[index]) {
              footerHtml += footers[index].render(domQuery);
            }
          }
        } else {
          headers = element._headers = [];
          footers = element._footers = [];

          while (++index < children.length) {
            child = children[index];
            if (typeof child == 'string') {
              if (child.replace(trimRegExp, '').replace(/(\r\n|\n|\r)/gm, '') === '') {
                children.splice(index--, 1);
              }
              continue;
            }
            child._each = true;
            dataRole = child._attributes['data-role'];
            if (dataRole == 'header') {
              headerHtml += child.render(domQuery);
              headers.push(child);
              children.splice(index--, 1);
            } else if (dataRole == 'footer') {
              footerHtml += child.render(domQuery);
              footers.push(child);
              children.splice(index--, 1);
            }
          }
        }

        return {
          header: headerHtml,
          headersCount: headers.length,
          footer: footerHtml,
          footersCount: footers.length
        };
      },

      preprocess: function (domQuery, collection, name) {
        var element = this;
        var i = 0;
        var rawCollection;
        var elementData;
        var startIndex;
        var staticHtml;
        var maxCount;
        var html;

        element._template = element._template || element._children;

        this._childrenEach = true;

        if (domQuery._serverData) {
          elementData = domQuery._serverData[ElementsData.id(element)];
          domQuery._serverData[ElementsData.id(element)] = undefined;
          if (elementData) {
            var div = document.createElement('div');
            div.innerHTML = elementData;
            element._template = element._children = createVirtual(div.childNodes[0], element);
          }
        }

        staticHtml = queries.each._getStaticHtml(domQuery, element);
        html = staticHtml.header;

        if (blocks.isObservable(collection)) {
          elementData = ElementsData.data(element);
          elementData.eachData = {
            id: collection.__id__,
            element: element,
            startOffset: staticHtml.headersCount,
            endOffset: staticHtml.footersCount
          };
        }

        rawCollection = blocks.unwrapObservable(collection);

        if (blocks.isArray(rawCollection)) {
          startIndex = startIndex || 0;
          maxCount = maxCount || rawCollection.length;
          for (i = 0; i < rawCollection.length; i++) {
            domQuery.dataIndex(blocks.observable.getIndex(collection, i));
            domQuery.pushContext(rawCollection[i]);
            if (name) {
              blocks.queries.define.preprocess.call(element, domQuery, name, rawCollection[i]);
            }
            html += element.renderChildren(domQuery);
            domQuery.popContext();
            domQuery.dataIndex(undefined);
          }
        } else if (blocks.isObject(rawCollection)) {
          for (var key in rawCollection) {
            domQuery.dataIndex(blocks.observable.getIndex(collection, i));
            domQuery.pushContext(rawCollection[key]);
            html += element.renderChildren(domQuery);
            domQuery.popContext();
            domQuery.dataIndex(undefined);
            i++;
          }
        }

        //element._innerHTML = html + staticHtml.footer;
        this.html(html + staticHtml.footer);
      }

      // update: function () {
      //
      // }
    },

    /**
     * Render options for a <select> element by providing an collection.
     *
     * @memberof blocks.queries
     * @param {(Array|Object)} collection - The collection to iterate over
     * @param {Object} [options] - Options to customize the behavior for creating each option.
     * options.value - determines the field in the collection to server for the option value
     * options.text - determines the field in the collection to server for the option text
     * options.caption - creates a option with the specified text at the first option
     *
     * @example {html}
     * <script>
     * blocks.query({
     *   caption: 'Select user'
     *   data: [
     *     { name: 'John', id: 1 },
     *     { name: 'Doe', id: 2 }
     *   ]
     * });
     * </script>
     * <select data-query="options(data, { text: 'name', value: 'id', caption: caption })">
     * </select>
     *
     * <!-- will result in -->
     * <select data-query="options(data, { text: 'name', value: 'id', caption: caption })">
     *   <option>Select user</option>
     *   <option value="1">John</option>
     *   <option value="2">Doe</option>
     * </select>
     */
    options: {
      passDomQuery: true,

      passRawValues: true,

      preprocess: function (domQuery, collection, options) {
        options = options || {};
        var $thisStr = '$this';
        var text = Expression.Create('{{' + (options.text || $thisStr) + '}}');
        var value = Expression.Create('{{' + (options.value || $thisStr) + '}}', 'value');
        var caption = blocks.isString(options.caption) && new VirtualElement('option');
        var option = new VirtualElement('option');
        var children = this._children;
        var i = 0;
        var child;

        for (; i < children.length; i++) {
          child = children[i];
          if (!child._attributes || (child._attributes && !child._attributes['data-role'])) {
            children.splice(i--, 1);
          }

        }

        option._attributeExpressions.push(value);
        option._children.push(text);
        option._parent = this;
        this._children.push(option);

        if (caption) {
          caption._attributes['data-role'] = 'header';
          caption._innerHTML = options.caption;
          this.addChild(caption);
        }

        blocks.queries.each.preprocess.call(this, domQuery, collection);
      }
    },

    /**
    * The render query allows elements to be skipped from rendering and not to exist in the HTML result
    *
    * @memberof blocks.queries
    * @param {boolean} condition The value determines if the element will be rendered or not
    * @param {boolean} [renderChildren=false] The value indicates if the children will be rendered
    *
    * @example {html}
    * <div data-query="render(true)">Visible</div>
    * <div data-query="render(false)">Invisible</div>
    *
    * <!-- html result will be -->
    * <div data-query="render(true)">Visible</div>
    */
    render: {
      passDetailValues: true,

      preprocess: function (condition) {
        if (!this._each) {
          throw new Error('render() is supported only in each context');
        }

        this._renderMode = condition.value ? VirtualElement.RenderMode.All : VirtualElement.RenderMode.None;

        if (condition.containsObservable && this._renderMode == VirtualElement.RenderMode.None) {
          this._renderMode = VirtualElement.RenderMode.ElementOnly;
          this.css('display', 'none');
          ElementsData.data(this, 'renderCache', this);
        }
      },

      update: function (condition) {
        var elementData = ElementsData.data(this);
        if (elementData.renderCache && condition.value) {
          // TODO: Should use the logic from HtmlElement.prototype.html method
          this.innerHTML = elementData.renderCache.renderChildren(blocks.domQuery(this));
          blocks.domQuery(this).createElementObservableDependencies(this.childNodes);
          elementData.renderCache = null;
        }

        this.style.display = condition.value ? '' : 'none';
      }
    },

    /**
     * Determines when an observable value will be synced from the DOM.
     * Only applicable when using the 'val' data-query.
     *
     * @param {string} eventName - the name of the event. Possible values are:
     * 'input'(default)
     * 'keydown' -
     * 'change' -
     * 'keyup' -
     * 'keypress' -
     */
    updateOn: {
      preprocess: function (eventName) {
        ElementsData.data(this).updateOn = eventName;
      }
    },

    /**
     * Could be used for custom JavaScript animation by providing a callback function
     * that will be called the an animation needs to be performed
     *
     * @memberof blocks.queries
     * @param {Function} callback - The function that will be called when animation needs
     * to be performed.
     *
     * @example {html}
     * <script>
     * blocks.query({
     *   visible: blocks.observable(true),
     *   toggleVisibility: function () {
     *     // this points to the model object passed to blocks.query() method
     *     this.visible(!this.visible());
     *   },
     *
     *   fade: function (element, ready) {
     *     Velocity(element, {
     *       // this points to the model object passed to blocks.query() method
     *       opacity: this.visible() ? 1 : 0
     *     }, {
     *       duration: 1000,
     *       queue: false,
     *
     *       // setting the ready callback to the complete callback
     *       complete: ready
     *     });
     *   }
     * });
     * </script>
     * <button data-query="click(toggleVisibility)">Toggle visibility</button>
     * <div data-query="visible(visible).animate(fade)" style="background: red;width: 300px;height: 240px;">
     * </div>
     */
    animate: {
      preprocess: function (callback) {
        ElementsData.data(this).animateCallback = callback;
      }
    },

    /**
    * Adds or removes a class from an element
    *
    * @memberof blocks.queries
    * @param {string|Array} className - The class string (or array of strings) that will be added or removed from the element.
    * @param {boolean|undefined} [condition=true] - Optional value indicating if the class name will be added or removed. true - add, false - remove.
    *
    * @example {html}
    * <div data-query="setClass('header')"></div>
    *
    * <!-- will result in -->
    * <div data-query="setClass('header')" class="header"></div>
    */
    setClass: {
      preprocess: function (className, condition) {
        if (arguments.length > 1) {
          this.toggleClass(className, !!condition);
        } else {
          this.addClass(className);
        }
      },

      update: function (className, condition) {
        var virtual = ElementsData.data(this).virtual;
        if (virtual._each) {
          virtual = VirtualElement();
          virtual._el = HtmlElement(this);
        }
        if (arguments.length > 1) {
          virtual.toggleClass(className, condition);
        } else {
          virtual.addClass(className);
        }
      }
    },

    /**
    * Sets the inner html to the element
    *
    * @memberof blocks.queries
    * @param {string} html - The html that will be places inside element replacing any other content.
    * @param {boolean} [condition=true] - Condition indicating if the html will be set.
    *
    * @example {html}
    * <div data-query="html('<b>some content</b>')"></div>
    *
    * <!-- will result in -->
    * <div data-query="html('<b>some content</b>')"><b>some content</b></div>
    */
    html: {
      call: true
    },

    /**
    * Adds or removes the inner text from an element
    *
    * @memberof blocks.queries
    * @param {string} text - The text that will be places inside element replacing any other content.
    * @param {boolean} [condition=true] - Value indicating if the text will be added or cleared. true - add, false - clear.
    *
    * @example {html}
    * <div data-query="html('some content')"></div>
    *
    * <!-- will result in -->
    * <div data-query="html('some content')">some content</div>
    */
    text: {
      call: true
    },

    /**
    * Determines if an html element will be visible. Sets the CSS display property.
    *
    * @memberof blocks.queries
    * @param {boolean} [condition=true] Value indicating if element will be visible or not.
    *
    * @example {html}
    * <div data-query="visible(true)">Visible</div>
    * <div data-query="visible(false)">Invisible</div>
    *
    * <!-- html result will be -->
    * <div data-query="visible(true)">Visible</div>
    * <div data-query="visible(false)" style="display: none;">Invisible</div>
    */
    visible: {
      call: 'css',

      prefix: 'display'
    },

    /**
    * Gets, sets or removes an element attribute.
    * Passing only the first parameter will return the attributeName value
    *
    * @memberof blocks.queries
    * @param {string} attributeName - The attribute name that will be get, set or removed.
    * @param {string} attributeValue - The value of the attribute. It will be set if condition is true.
    * @param {boolean} [condition=true] - Value indicating if the attribute will be set or removed.
    *
    * @example {html}
    * <div data-query="attr('data-content', 'some content')"></div>
    *
    * <!-- will result in -->
    * <div data-query="attr('data-content', 'some content')" data-content="some content"></div>
    */
    attr: {
      passRawValues: true,

      call: true
    },

    /**
    * Sets the value attribute on an element.
    *
    * @memberof blocks.queries
    * @param {(string|number|Array|undefined)} value - The new value for the element.
    * @param {boolean} [condition=true] - Determines if the value will be set or not.
    *
    * @example {html}
    * <script>
    * blocks.query({
    *   name: blocks.observable('John Doe')
    * });
    * </script>
    * <input data-query="val(name)" />
    *
    * <!-- will result in -->
    * <input data-query="val(name)" value="John Doe" />
    */
    val: {
      passRawValues: true,

      call: 'attr',

      prefix: 'value'
    },

    /**
    * Sets the checked attribute on an element
    *
    * @memberof blocks.queries
    * @param {boolean|undefined} [condition=true] - Determines if the element will be checked or not
    *
    * @example {html}
    * <input type="checkbox" data-query="checked(true)" />
    * <input type="checkbox" data-query="checked(false)" />
    *
    * <!-- will result in -->
    * <input type="checkbox" data-query="checked(true)" checked="checked" />
    * <input type="checkbox" data-query="checked(false)" />
    */
    checked: {
      passRawValues: true,

      call: 'attr'
    },

    /**
    * Sets the disabled attribute on an element
    *
    * @memberof blocks.queries
    * @param {boolean|undefined} [condition=true] - Determines if the element will be disabled or not
    */
    disabled: {
      passRawValues: true,

      call: 'attr'
    },

    /**
      * Gets, sets or removes a CSS style from an element.
      * Passing only the first parameter will return the CSS propertyName value.
      *
      * @memberof blocks.queries
      * @param {string} name - The name of the CSS property that will be get, set or removed
      * @param {string} value - The value of the of the attribute. It will be set if condition is true
      *
      * @example {html}
      * <script>
      *   blocks.query({
      *     h1FontSize: 12
      *   });
      * </script>
      * <h1 data-query="css('font-size', h1FontSize)"></h1>
      * <h1 data-query="css('fontSize', h1FontSize)"></h1>
      *
      * <!-- will result in -->
      * <h1 data-query="css('font-size', h1FontSize)" style="font-size: 12px;"></h1>
      * <h1 data-query="css('fontSize', h1FontSize)" style="font-size: 12px;"></h1>
      */
    css: {
      call: true
    },

    /**
      * Sets the width of the element
      *
      * @memberof blocks.queries
      * @param {(number|string)} value - The new width of the element
      */
    width: {
      call: 'css'
    },

    /**
      * Sets the height of the element
      *
      * @memberof blocks.queries
      * @param {number|string} value - The new height of the element
      */
    height: {
      call: 'css'
    },

    focused: {
      preprocess: blocks.noop,

      update: function (value) {
        if (value) {
          this.focus();
        }
      }
    },

    /**
     * Subscribes to an event
     *
     * @memberof blocks.queries
     * @param {(String|Array)} events - The event or events to subscribe to
     * @param {Function} callback - The callback that will be executed when the event is fired
     * @param {*} [args] - Optional arguments that will be passed as second parameter to
     * the callback function after the event arguments
     */
    on: {
      ready: function (events, callbacks, args) {
        if (!events || !callbacks) {
          return;
        }

        callbacks = blocks.toArray(callbacks);

        var element = this;
        var handler = function (e) {
          var context = blocks.context(this);
          var thisArg = context.$template || context.$view || context.$root;
          blocks.each(callbacks, function (callback) {
            callback.call(thisArg, e, args);
          });
        };

        events = blocks.isArray(events) ? events : events.toString().split(' ');

        blocks.each(events, function (event) {
          addListener(element, event, handler);
        });
      }
    }
  });

  blocks.each([
    // Mouse
    'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout',
    // HTML form
    'select', 'change', 'submit', 'reset', 'focus', 'blur',
    // Keyboard
    'keydown', 'keypress', 'keyup'
  ], function (eventName) {
    blocks.queries[eventName] = {
      passRawValues: true,

      ready: function (callback, data) {
        blocks.queries.on.ready.call(this, eventName, callback, data);
      }
    };
  });

    var OBSERVABLE = '__blocks.observable__';


  function ChunkManager(observable) {
    this.observable = observable;
    this.chunkLengths = {};
    this.dispose();
  }

  ChunkManager.prototype = {
    dispose: function () {
      this.childNodesCount = undefined;
      this.startIndex = 0;
      this.observableLength = undefined;
      this.startOffset = 0;
      this.endOffset = 0;
    },

    setStartIndex: function (index) {
      this.startIndex = index + this.startOffset;
    },

    // TODO: Explain why we even need this method. Required to fix a bug.
    setChildNodesCount: function (count) {
      if (this.childNodesCount === undefined) {
        this.observableLength = this.observable.__value__.length;
      }
      this.childNodesCount = count - (this.startOffset + this.endOffset);
    },

    chunkLength: function (wrapper) {
      var chunkLengths = this.chunkLengths;
      var id = ElementsData.id(wrapper);
      var length = chunkLengths[id] || (this.childNodesCount || wrapper.childNodes.length) / (this.observableLength || this.observable.__value__.length);
      var result;

      if (blocks.isNaN(length) || length === Infinity) {
        result = 0;
      } else {
        result = Math.round(length);
      }

      chunkLengths[id] = result;

      return result;
    },

    getAt: function (wrapper, index) {
      var chunkLength = this.chunkLength(wrapper);
      var childNodes = wrapper.childNodes;
      var result = [];

      for (var i = 0; i < chunkLength; i++) {
        result[i] = childNodes[index * chunkLength + i + this.startIndex];
      }
      return result;
    },

    insertAt: function (wrapper, index, chunk) {
      animation.insert(
        wrapper,
        this.chunkLength(wrapper) * index + this.startIndex,
        blocks.isArray(chunk) ? chunk : [chunk]);
    },

    removeAt: function (wrapper, index) {
      var chunkLength = this.chunkLength(wrapper);
      //var childNode;
      //var i = 0;

      animation.remove(
        wrapper,
        chunkLength * index + this.startIndex,
        chunkLength);

      // TODO: When normalize = false we should ensure there is an empty text node left if there is need for one and there have been one before
      //for (; i < chunkLength; i++) {
      //  childNode = wrapper.childNodes[chunkLength * index + this.startIndex];
      //  if (childNode) {
      //    animateDomAction('remove', childNode);
      //    //ElementsData.clear(childNode, true);
      //    //wrapper.removeChild(childNode);
      //  }
      //}
    },

    removeAll: function () {
      var _this = this;
      var array = this.observable.__value__;

      this.each(function (parent) {
        blocks.each(array, function () {
          _this.removeAt(parent, 0);
        });
      });
    },

    each: function (callback) {
      var i = 0;
      var domElements = this.observable._elements;

      for (; i < domElements.length; i++) {
        var data = domElements[i];
        if (!data.element) {
          data.element = ElementsData.data(data.elementId).dom;
        }
        this.setup(data.element, callback);
      }
    },

    setup: function (domElement, callback) {
      if (!domElement) {
        return;
      }

      var eachData = ElementsData.data(domElement).eachData;
      var element;
      var commentId;
      var commentIndex;
      var commentElement;

      if (!eachData || eachData.id != this.observable.__id__) {
        return;
      }

      element = eachData.element;
      this.startOffset = eachData.startOffset;
      this.endOffset = eachData.endOffset;

      if (domElement.nodeType == 1) {
        // HTMLElement
        this.setStartIndex(0);
        this.setChildNodesCount(domElement.childNodes.length);
        callback(domElement, element, domElement);
      } else {
        // Comment
        commentId = ElementsData.id(domElement);
        commentElement = domElement.parentNode.firstChild;
        commentIndex = 0;
        while (commentElement != domElement) {
          commentElement = commentElement.nextSibling;
          commentIndex++;
        }
        this.setStartIndex(commentIndex + 1);
        while (commentElement && (commentElement.nodeType != 8 || commentElement.nodeValue.indexOf(commentId + ':/blocks') != 1)) {
          commentElement = commentElement.nextSibling;
          commentIndex++;
        }
        this.setChildNodesCount(commentIndex - this.startIndex/* - 1*/);
        callback(domElement.parentNode, element, domElement);
      }
    }
  };



  var observableId = 1;

  /**
  * @namespace blocks.observable
  * @param {*} initialValue -
  * @param {*} [context] -
  * @returns {blocks.observable}
  */
  blocks.observable = function (initialValue, thisArg) {
    var observable = function (value) {
      if (arguments.length === 0) {
        Events.trigger(observable, 'get', observable);
      }

      var currentValue = getObservableValue(observable);
      var update = observable.update;

      if (arguments.length === 0) {
        Observer.registerObservable(observable);
        return currentValue;
      } else if (!blocks.equals(value, currentValue, false) && Events.trigger(observable, 'changing', value, currentValue) !== false) {
        observable.update = blocks.noop;
        if (!observable._dependencyType) {
          if (blocks.isArray(currentValue) && blocks.isArray(value) && observable.removeAll && observable.addMany) {
            observable.removeAll();
            observable.addMany(value);
          } else {
            observable.__value__ = value;
          }
        } else if (observable._dependencyType == 2) {
          observable.__value__.set.call(observable.__context__, value);
        }

        observable.update = update;
        observable.update();

        Events.trigger(observable, 'change', value, currentValue);
      }
      return observable;
    };

    initialValue = blocks.unwrap(initialValue);

    blocks.extend(observable, blocks.observable.fn.base);
    observable.__id__ = observableId++;
    observable.__value__ = initialValue;
    observable.__context__ = thisArg || blocks.__viewInInitialize__ || observable;
    observable._expressionKeys = {};
    observable._expressions = [];
    observable._elementKeys = {};
    observable._elements = [];

    if (blocks.isArray(initialValue)) {
      blocks.extend(observable, blocks.observable.fn.array);
      observable._indexes = [];
      observable._chunkManager = new ChunkManager(observable);
    } else if (blocks.isFunction(initialValue)) {
      observable._dependencyType = 1; // Function dependecy
    } else if (initialValue && blocks.isFunction(initialValue.get) && blocks.isFunction(initialValue.set)) {
      observable._dependencyType = 2; // Custom object
    }

    updateDependencies(observable);

    return observable;
  };

  function updateDependencies(observable) {
    if (observable._dependencyType) {
      observable._getDependency = blocks.bind(getDependency, observable);
      observable.on('get', observable._getDependency);
    }
  }

  function getDependency() {
    var observable = this;
    var value = observable.__value__;
    var accessor = observable._dependencyType == 1 ? value : value.get;

    Events.off(observable, 'get', observable._getDependency);
    observable._getDependency = undefined;

    Observer.startObserving();
    accessor.call(observable.__context__);
    blocks.each(Observer.stopObserving(), function (dependency) {
      //(dependency._dependencies = dependency._dependencies || []).push(observable);
      var dependencies = (dependency._dependencies = dependency._dependencies || []);
      var exists = false;
      blocks.each(dependencies, function (value) {
        if (observable === value) {
          exists = true;
          return false;
        }
      });
      if (!exists) {
        dependencies.push(observable);
      }
    });
  }

  function getObservableValue(observable) {
    var context = observable.__context__;
    return observable._dependencyType == 1 ? observable.__value__.call(context)
      : observable._dependencyType == 2 ? observable.__value__.get.call(context)
      : observable.__value__;
  }

  blocks.extend(blocks.observable, {
    getIndex: function (observable, index, forceGet) {
      if (!blocks.isObservable(observable)) {
        return blocks.observable(index);
      }
      var indexes = observable._indexes;
      var $index;

      if (indexes) {
        if (indexes.length == observable.__value__.length || forceGet) {
          $index = indexes[index];
        } else {
          $index = blocks.observable(index);
          indexes.push($index);
        }
      } else {
        $index = blocks.observable(index);
      }

      return $index;
    },

    fn: {
      base: {
        __identity__: OBSERVABLE,

        /**
         * Updates all elements, expressions and dependencies where the observable is used
         *
         * @memberof blocks.observable
         * @returns {blocks.observable} Returns the observable itself - return this;
         */
        update: function () {
          var elements = this._elements;
          var domQuery;
          var context;
          var element;
          var offset;
          var value;

          blocks.eachRight(this._expressions, function updateExpression(expression) {
            element = expression.element;
            context = expression.context;

            if (!element) {
              element = expression.element = ElementsData.data(expression.elementId).dom;
            }

            try {
              value = blocks.unwrap(parameterQueryCache[expression.expression](context));
            } catch (ex) {
              value = '';
            }

            value = value == null ? '' : value.toString();

            offset = expression.length - value.length;
            expression.length = value.length;

            if (expression.attr) {
              element.setAttribute(expression.attr, Expression.GetValue(context, null, expression.entire));
            } else {
              if (element.nextSibling) {
                element = element.nextSibling;
                element.nodeValue = value + element.nodeValue.substring(expression.length + offset);
              } else {
                element.parentNode.appendChild(document.createTextNode(value));
              }
            }
          });

          for (var i = 0; i < elements.length; i++) {
            value = elements[i];
            element = value.element;
            if (!element && ElementsData.data(value.elementId)) {
              element = value.element = ElementsData.data(value.elementId).dom;
              if (!element) {
                element = ElementsData.data(value.elementId).virtual;
              }
            }
            if (document.body.contains(element) || VirtualElement.Is(element)) {
              domQuery = blocks.domQuery(element);
              domQuery.contextBubble(value.context, function () {
                domQuery.executeMethods(element, value.cache);
              });
            } else {
              elements.splice(i, 1);
              i -= 1;
            }
          }

          blocks.each(this._dependencies, function updateDependency(dependency) {
            updateDependencies(dependency);
            dependency.update();
          });

          blocks.each(this._indexes, function updateIndex(observable, index) {
            observable(index);
          });

          return this;
        },


        on: function (eventName, callback, thisArg) {
          Events.on(this, eventName, callback, thisArg || this.__context__);
          return this;
        },

        /**
         * Extends the current observable with particular functionality depending on the parameters
         * specified. If the method is called without arguments and jsvalue framework is included
         * the observable will be extended with the methods available in jsvalue for the current type
         *
         * @memberof blocks.observable
         * @param {String} [name] -
         * @param {...*} [options]
         * @returns {*} - The result of the extend or the observable itself
         *
         * @example {javascript}
         * blocks.observable.formatter = function () {
         *   // your code here
         * };
         *
         * // extending using the formatter extender
         * var data = blocks.observable([1, 2, 3]).extend('formatter');
         *
         */
        extend: function (name /*, options*/) {
          var extendFunc = blocks.observable[name];
          var result;

          if (arguments.length === 0) {
            if (blocks.core.expressionsCreated) {
              blocks.core.applyExpressions(blocks.type(this()), this);
            }
            return this;
          } else if (extendFunc) {
            result = extendFunc.apply(this, blocks.toArray(arguments).slice(1));
            return blocks.isObservable(result) ? result : this;
          }
        },

        clone: function (cloneValue) {
          var value = this.__value__;
          return blocks.observable(cloneValue ? blocks.clone(value) : value, this.__context__);
        },

        toString: function () {
          var context = this.__context__;
          var value = this._dependencyType == 1 ? this.__value__.call(context)
            : this._dependencyType == 2 ? this.__value__.get.call(context)
            : this.__value__;

          Observer.registerObservable(this);

          if (value != null && blocks.isFunction(value.toString)) {
            return value.toString();
          }
          return String(value);
        }
      },

      /**
       * @memberof blocks.observable
       * @class array
       */
      array: {

        /**
         * Removes all items from the collection and replaces them with the new value provided.
         * The value could be Array, observable array or jsvalue.Array
         *
         * @memberof array
         * @param {Array} value - The new value that will be populated
         * @returns {blocks.observable} - Returns the observable itself - return this;
         *
         * @example {javascript}
         * // creates an observable array with [1, 2, 3] as values
         * var items = blocks.observable([1, 2, 3]);
         *
         * // removes the previous values and fills the observable array with [5, 6, 7] values
         * items.reset([5, 6, 7]);
         */
        reset: function (value) {
          value = blocks.isArray(value) ? value : [];
          return this(value);
        },

        /**
         * Adds values to the end of the observable array
         *
         * @memberof array
         * @param {*} value - The values that will be added to the end of the array
         * @param {number} [index] - Optional index specifying where to insert the value
         * @returns {blocks.observable} - Returns the observable itself - return this;
         *
         * @example {javascript}
         * var items = blocks.observable([1, 2, 3]);
         *
         * // results in observable array with [1, 2, 3, 4] values
         * items.add(4);
         *
         */
        add: function (value, index) {
          this.splice(blocks.isNumber(index) ? index : this.__value__.length, 0, value);

          return this;
        },

        /**
         * Adds the values from the provided array(s) to the end of the collection
         *
         * @memberof array
         * @param {Array} value - The array that will be added to the end of the array
         * @param {number} [index] - Optional position where the array of values to be inserted
         * @returns {blocks.observable} - Returns the observable itself - return this;
         *
         * @example {javascript}
         * var items = blocks.observable([1, 2, 3]);
         *
         * // results in observable array with [1, 2, 3, 4, 5, 6] values
         * items.addMany([4, 5], [6]);
         */
        addMany: function (value, index) {
          this.splice.apply(this, [blocks.isNumber(index) ? index : this.__value__.length, 0].concat(blocks.toArray(value)));
          return this;
        },

        /**
         * Swaps two values in the observable array.
         * Note: Faster than removing the items and adding them at the locations
         *
         * @memberof array
         * @param {number} indexA - The first index that points to the index in the array that will be swapped
         * @param {number} indexB - The second index that points to the index in the array that will be swapped
         * @returns {blocks.observable} - Returns the observable itself - return this;
         *
         * @example {javascript}
         * var items = blocks.observable([4, 2, 3, 1]);
         *
         * // results in observable array with [1, 2, 3, 4] values
         * items.swap(0, 3);
         */
        swap: function (indexA, indexB) {
          var array = this();
          var elements = this._elements;
          var chunkManager = this._chunkManager;
          var element;

          blocks.swap(array, indexA, indexB);

          for (var i = 0; i < elements.length; i++) {
            element = elements[i].element;
            if (indexA > indexB) {
              chunkManager.insertAt(element, indexA, chunkManager.getAt(element, indexB));
              chunkManager.insertAt(element, indexB, chunkManager.getAt(element, indexA));
            } else {
              chunkManager.insertAt(element, indexB, chunkManager.getAt(element, indexA));
              chunkManager.insertAt(element, indexA, chunkManager.getAt(element, indexB));
            }
          }

          return this;
        },

        /**
         * Moves an item from one location to another in the array.
         * Note: Faster than removing the item and adding it at the location
         *
         * @memberof array
         * @param {number} sourceIndex - The index pointing to the item that will be moved
         * @param {number} targetIndex - The index where the item will be moved to
         * @returns {blocks.observable} - Returns the observable itself - return this;
         *
         * @example {javascript}
         * var items = blocks.observable([1, 4, 2, 3, 5]);
         *
         * // results in observable array with [1, 2, 3, 4, 5] values
         * items.move(1, 4);
         */
        move: function (sourceIndex, targetIndex) {
          var array = this();
          var elements = this._elements;
          var chunkManager = this._chunkManager;
          var element;

          blocks.move(array, sourceIndex, targetIndex);

          if (targetIndex > sourceIndex) {
            targetIndex++;
          }

          for (var i = 0; i < elements.length; i++) {
            element = elements[i].element;
            chunkManager.insertAt(element, targetIndex, chunkManager.getAt(element, sourceIndex));
          }

          return this;
        },

        /**
         * Removes an item from the observable array
         *
         * @memberof array
         * @param {[type]}   position [description]
         * @param {Function} callback [description]
         * @returns {blocks.observable} - Returns the observable itself - return this;
         *
         * @example {javascript}
         *
         */
        remove: function (callback, thisArg) {
          return this.removeAll(callback, thisArg, true);
        },

        /**
         * Removes an item at the specified index
         *
         * @memberof array
         * @param {number} index - The index location of the item that will be removed
         * @param {number} [count] - Optional parameter that if specified will remove
         * the next items starting from the specified index
         * @returns {blocks.observable} - Returns the observable itself - return this;
         */
        removeAt: function (index, count) {
          if (!blocks.isNumber(count)) {
            count = 1;
          }
          this.splice(index, count);

          return this;
        },

        /**
         * Removes all items from the observable array and optionally filter which items
         * to be removed by providing a callback
         *
         * @memberof array
         * @param {Function} [callback] - Optional callback function which filters which items
         * to be removed. Returning a truthy value will remove the item and vice versa
         * @param {*}  [thisArg] - Optional this context for the callback function
         * @param {blocks.observable} - Returns the observable itself - return this;
         */
        removeAll: function (callback, thisArg, removeOne) {
          var array = this.__value__;
          var chunkManager = this._chunkManager;
          var items;
          var i;

          if (arguments.length === 0) {
            if (Events.has(this, 'removing') || Events.has(this, 'remove')) {
              items = blocks.clone(array);
            }
            Events.trigger(this, 'removing', {
              type: 'removing',
              items: items,
              index: 0
            });

            chunkManager.removeAll();

            //this._indexes.splice(0, array.length);
            this._indexes = [];
            items = array.splice(0, array.length);
            Events.trigger(this, 'remove', {
              type: 'remove',
              items: items,
              index: 0
            });
          } else {
            var isCallbackAFunction = blocks.isFunction(callback);
            var value;

            for (i = 0; i < array.length; i++) {
              value = array[i];
              if (value === callback || (isCallbackAFunction && callback.call(thisArg, value, i, array))) {
                this.splice(i, 1);
                i -= 1;
                if (removeOne) {
                  break;
                }
              }
            }
          }

          this.update();

          return this;
        },

        //#region Base

        /**
         * The concat() method is used to join two or more arrays
         *
         * @memberof array
         * @param {...Array} The arrays to be joined
         * @returns {Array} The joined array
         */
        concat: function () {
          var array = this();
          return array.concat.apply(array, blocks.toArray(arguments));
        },

        //
        /**
         * The slice() method returns the selected elements in an array, as a new array object
         *
         * @memberof array
         * @param {number} start An integer that specifies where to start the selection (The first element has an index of 0)
         * @param {number} [end] An integer that specifies where to end the selection. If omitted, all elements from the start
         * position and to the end of the array will be selected. Use negative numbers to select from the end of an array
         * @returns {Array} A new array, containing the selected elements
         */
        slice: function (start, end) {
          if (arguments.length > 1) {
            return this().slice(start, end);
          }
          return this().slice(start);
        },

        /**
         * The join() method joins the elements of an array into a string, and returns the string
         *
         * @memberof array
         * @param {string} [seperator=','] The separator to be used. If omitted, the elements are separated with a comma
         * @returns {string} The array values, separated by the specified separator
         */
        join: function (seperator) {
          if (arguments.length > 0) {
            return this().join(seperator);
          }
          return this().join();
        },

        ///**
        // * The indexOf() method returns the position of the first occurrence of a specified value in a string.
        // * @param {*} item The item to search for.
        // * @param {number} [index=0] Where to start the search. Negative values will start at the given position counting from the end, and search to the end.
        // * @returns {number} The position of the specified item, otherwise -1
        // */
        //indexOf: function (item, index) {
        //    return blocks.indexOf(this(), item, index);
        //},


        ///**
        // * The lastIndexOf() method returns the position of the last occurrence of a specified value in a string.
        // * @param {*} item The item to search for.
        // * @param {number} [index=0] Where to start the search. Negative values will start at the given position counting from the end, and search to the beginning.
        // * @returns {number} The position of the specified item, otherwise -1.
        // */
        //lastIndexOf: function (item, index) {
        //    var array = this();
        //    if (arguments.length > 1) {
        //        return blocks.lastIndexOf(array, item, index);
        //    }
        //    return blocks.lastIndexOf(array, item);
        //},

        //#endregion

        /**
         * The pop() method removes the last element of a observable array, and returns that element
         *
         * @memberof array
         * @returns {*} The removed array item
         */
        pop: function () {
          var that = this;
          var array = that();

          return that.splice(array.length - 1, 1)[0];
        },

        /**
         * The push() method adds new items to the end of the observable array, and returns the new length
         *
         * @memberof array
         * @param {...*} values - The item(s) to add to the observable array
         * @returns {number} The new length of the observable array
         */
        push: function () {
          this.addMany(arguments);
          return this.__value__.length;
        },

        /**
         * Reverses the order of the elements in the observable array
         *
         * @memberof array
         * @returns {Array} The array after it has been reversed
         */
        reverse: function () {
          var array = this().reverse();
          var chunkManager = this._chunkManager;

          this._indexes.reverse();

          chunkManager.each(function (domElement) {
            for (var j = 1; j < array.length; j++) {
              chunkManager.insertAt(domElement, 0, chunkManager.getAt(domElement, j));
            }
          });

          this.update();

          return array;
        },

        /**
         * Removes the first element of a observable array, and returns that element
         *
         * @memberof array
         * @returns {*} The removed array item
         */
        shift: function () {
          return this.splice(0, 1)[0];
          //returns - The removed array item
        },

        /**
         * Sorts the elements of an array
         *
         * @memberof array
         * @param {Function} [sortfunction] - A function that defines the sort order
         * @returns {Array} - The Array object, with the items sorted
         */
        sort: function (sortfunction) {
          var array = this.__value__;
          var length = array.length;
          var useSortFunction = arguments.length > 0;
          var chunkManager = this._chunkManager;
          var indexes = this._indexes;
          var i = 0;
          var j;
          var item;

          for (; i < length; i++) {
            var result = [array[i], i];

            chunkManager.each(function (domElement) {
              result.push(chunkManager.getAt(domElement, i));
            });
            //if (!useSortFunction) { // TODO: Test performance
            //    result.toString = function () { return this[0]; }
            //}
            array[i] = result;
          }

          //if (useSortFunction) { // TODO: Test performance
          //    array.sort(function (a, b) {
          //        return sortfunction.call(this, a[0], b[0])
          //    });
          //}

          // TODO: Test performance (Comment)
          array.sort(function (a, b) {
            a = a[0];
            b = b[0];
            if (useSortFunction) {
              return sortfunction.call(this, a, b);
            }
            if (a < b) {
              return -1;
            }
            if (a > b) {
              return 1;
            }
            return 0;
          });

          if (indexes.length > 0) {
            this._indexes = [];
          }

          for (i = 0; i < length; i++) {
            item = array[i];
            if (indexes.length > 0) {
              this._indexes.push(indexes[item[1]]);
            }

            j = 2;
            chunkManager.each(function (domElement) {
              chunkManager.insertAt(domElement, length, item[j]);
              j++;
            });
            array[i] = item[0];
          }

          this.update();

          //chunkManager.dispose();

          return array;
        },

        /**
         * Adds and/or removes elements from the observable array
         *
         * @memberof array
         * @param {number} index An integer that specifies at what position to add/remove items.
         * Use negative values to specify the position from the end of the array.
         * @param {number} howMany The number of items to be removed. If set to 0, no items will be removed.
         * @param {...*} The new item(s) to be added to the array.
         * @returns {Array} A new array containing the removed items, if any.
         */
        splice: function (index, howMany) {
          var _this = this;
          var array = this.__value__;
          var indexes = this._indexes;
          var chunkManager = this._chunkManager;
          var returnValue = [];
          var args = arguments;
          var addItems;

          index = index < 0 ? array.length - index : index;

          if (howMany && index < array.length && index >= 0) {
            howMany = Math.min(array.length - index, howMany);
            returnValue = array.slice(index, index + howMany);
            Events.trigger(this, 'removing', {
              type: 'removing',
              items: returnValue,
              index: index
            });

            chunkManager.each(function (domElement) {
              for (var j = 0; j < howMany; j++) {
                chunkManager.removeAt(domElement, index);
              }
            });

            ElementsData.collectGarbage();

            indexes.splice(index, howMany);
            returnValue = array.splice(index, howMany);
            Events.trigger(this, 'remove', {
              type: 'remove',
              items: returnValue,
              index: index
            });
            chunkManager.dispose();
          }

          if (args.length > 2) {
            addItems = blocks.toArray(args);
            addItems.splice(0, 2);
            Events.trigger(this, 'adding', {
              type: 'adding',
              index: index,
              items: addItems
            });

            blocks.each(addItems, function (item, i) {
              indexes.splice(index + i, 0, blocks.observable(index + i));
            });

            chunkManager.each(function (domElement, virtualElement) {
              var html = '';
              var length = addItems.length;
              var i = 0;

              var domQuery = blocks.domQuery(domElement);
              domQuery.contextBubble(blocks.context(domElement), function () {
                for (; i < length; i++) {
                  // TODO: Should be refactored in a method because
                  // the same logic is used in the each method
                  domQuery.dataIndex(blocks.observable.getIndex(_this, index + i, true));
                  domQuery.pushContext(addItems[i]);
                  html += virtualElement.renderChildren(domQuery);
                  domQuery.popContext();
                  domQuery.dataIndex(undefined);
                }
              });

              if (domElement.childNodes.length === 0) {
                (new HtmlElement(domElement)).html(html);
                //domElement.innerHTML = html;
                domQuery.createElementObservableDependencies(domElement.childNodes);
              } else {
                var fragment = domQuery.createFragment(html);
                chunkManager.insertAt(domElement, index, fragment);
              }
            });

            array.splice.apply(array, [index, 0].concat(addItems));
            Events.trigger(this, 'add', {
              type: 'add',
              index: index,
              items: addItems
            });
          }

          // TODO: Explain why this is here. Fixes a bug.
          chunkManager.dispose();

          this.update();
          return returnValue;
        },

        /**
         * The unshift() method adds new items to the beginning of an array, and returns the new length.
         *
         * @memberof array
         * @this {blocks.observable}
         * @param {...*} The new items that will be added to the beginning of the observable array.
         * @returns {number} The new length of the observable array.
         */
        unshift: function () {
          this.addMany(arguments, 0);
          return this.__value__.length;
        }
      }
    }
  });




  /**
   * @memberof blocks.observable
   * @class extenders
   */

  /**
   * Extends the observable by adding a .view property which is filtered
   * based on the provided options
   *
   * @memberof extenders
   * @param  {(Function|Object|String)} options
   * @returns {blocks.observable} - Returns a new observable
   * containing a .view property with the filtered data
   *
   * @example {javascript}
   */
  blocks.observable.filter = function (options) {
    var observable = initExpressionExtender(this);

    observable._operations.push({
      type: 'filter',
      filter: options
    });

    observable.on('add', function () {
      if (observable.view._initialized) {
        observable.view._connections = {};
        observable.view.reset();
        executeOperations(observable);
      }
    });

    observable.on('remove', function () {
      if (observable.view._initialized) {
        observable.view._connections = {};
        observable.view.reset();
        executeOperations(observable);
      }
    });

    return observable;
  };

  blocks.observable.step = function (options) {
    var observable = initExpressionExtender(this);

    observable._operations.push({
      type: 'step',
      step: options
    });

    return observable;
  };

  /**
   * Extends the observable by adding a .view property in which the first n
   * items are skipped
   *
   * @memberof extenders
   * @param {(number|blocks.observable)} value - The number of items to be skipped
   * @returns {blocks.observable} - Returns a new observable
   * containing a .view property with the manipulated data
   */
  blocks.observable.skip = function (value) {
    var observable = initExpressionExtender(this);

    observable._operations.push({
      type: 'skip',
      skip: value
    });

    return observable;
  };

  /**
   * Extends the observable by adding a .view property in which there is
   * always maximum n items
   *
   * @memberof extenders
   * @param {(number|blocks.observable))} value - The max number of items to be in the collection
   * @returns {blocks.observable} - Returns a new observable
   * containing a .view property with the manipulated data
   */
  blocks.observable.take = function (value) {
    var observable = initExpressionExtender(this);

    observable._operations.push({
      type: 'take',
      take: value
    });

    return observable;
  };

  /**
   * Extends the observable by adding a .view property which is sorted
   * based on the provided options
   *
   * @memberof extenders
   * @param  {(Function|string)} options -
   * @returns {blocks.observable} - Returns a new observable
   * containing a .view property with the sorted data
   */
  blocks.observable.sort = function (options) {
    var observable = initExpressionExtender(this);

    observable._operations.push({
      type: 'sort',
      sort: options
    });

    return observable;
  };

  function initExpressionExtender(observable) {
    var newObservable = observable.clone();

    newObservable.view = blocks.observable([]);
    newObservable.view._connections = {};
    newObservable.view._observed = [];
    newObservable.view._updateObservable = blocks.bind(updateObservable, newObservable);
    newObservable._operations = observable._operations ? blocks.clone(observable._operations) : [];
    newObservable._getter = blocks.bind(getter, newObservable);
    newObservable.view._initialized = false;

    newObservable.view.on('get', newObservable._getter);

    return newObservable;
  }

  function getter() {
    Events.off(this.view, 'get', this._getter);
    this._getter = undefined;
    this.view._initialized = true;
    executeOperations(this);
  }

  function updateObservable() {
    executeOperations(this);
  }

  function executeOperations(observable) {
    var chunk = [];
    var observed = observable.view._observed;
    var updateObservable = observable.view._updateObservable;

    blocks.each(observed, function (observable) {
      Events.off(observable, 'change', updateObservable);
      //observable.off('change', updateObservable);
    });
    observed = observable.view._observed = [];
    Observer.startObserving();

    blocks.each(observable._operations, function (operation) {
      if (operation.type == 'step') {
        var view = observable.view;
        observable.view = blocks.observable([]);
        observable.view._connections = {};
        if (chunk.length) {
          executeOperationsChunk(observable, chunk);
        }
        operation.step.call(observable.__context__);
        observable.view = view;
      } else {
        chunk.push(operation);
      }
      //if (operation.type == 'sort') {
      //  if (chunk.length) {
      //    executeOperationsChunk(observable, chunk);
      //  } else {
      //    executeOperationsChunk(observable, [{ type: 'filter', filter: function () { return true; }}]);
      //  }
      //  if (blocks.isString(operation.sort)) {
      //    observable.view.sort(function (valueA, valueB) {
      //      return valueA[operation.sort] - valueB[operation.sort];
      //    });
      //  } else if (blocks.isFunction(operation.sort)) {
      //    observable.view.sort(operation.sort);
      //  } else {
      //    observable.view.sort();
      //  }
      //  chunk = [];
      //} else {
      //  chunk.push(operation);
      //}
    });

    if (chunk.length) {
      executeOperationsChunk(observable, chunk);
    }

    blocks.each(Observer.stopObserving(), function (observable) {
      observed.push(observable);
      observable.on('change', updateObservable);
    });
  }

  function executeOperationsChunk(observable, operations) {
    var ADD = 'add';
    var REMOVE = 'remove';
    var EXISTS = 'exists';
    var action = EXISTS;

    var collection = observable.__value__;
    var view = observable.view;
    var connections = view._connections;
    var newConnections = {};
    var viewIndex = 0;
    var update = view.update;
    var skip = 0;
    var take = collection.length;
    view.update = blocks.noop;

    blocks.each(operations, function (operation) {
      if (operation.type == 'skip') {
        skip = operation.skip;
        if (blocks.isFunction(skip)) {
          skip = skip.call(observable.__context__);
        }
        skip = blocks.unwrap(skip);
      } else if (operation.type == 'take') {
        take = operation.take;
        if (blocks.isFunction(take)) {
          take = take.call(observable.__context__);
        }
        take = blocks.unwrap(take);
      } else if (operation.type == 'sort') {
        if (blocks.isString(operation.sort)) {
          collection = blocks.clone(collection).sort(function (valueA, valueB) {
            return valueA[operation.sort] - valueB[operation.sort];
          });
        } else if (blocks.isFunction(operation.sort)) {
          collection = blocks.clone(collection).sort(operation.sort);
        } else {
          collection = blocks.clone(collection).sort();
        }
        if (operations.length == 1) {
          operations.push({ type: 'filter', filter: function () { return true; }});
        }
      }
    });

    blocks.each(collection, function iterateCollection(value, index) {
      if (take <= 0) {
        while (view().length - viewIndex > 0) {
          view.removeAt(view().length - 1);
        }
        return false;
      }
      blocks.each(operations, function executeExtender(operation) {
        var filterCallback = operation.filter;

        action = undefined;

        if (filterCallback) {
          if (filterCallback.call(observable.__context__, value, index, collection)) {
            action = EXISTS;

            if (connections[index] === undefined) {
              action = ADD;
            }
          } else {
            action = undefined;
            if (connections[index] !== undefined) {
              action = REMOVE;
            }
            return false;
          }
        } else if (operation.type == 'skip') {
          action = EXISTS;
          skip -= 1;
          if (skip >= 0) {
            action = REMOVE;
            return false;
          } else if (skip < 0 && connections[index] === undefined) {
            action = ADD;
          }
        } else if (operation.type == 'take') {
          if (take <= 0) {
            action = REMOVE;
            return false;
          } else {
            take -= 1;
            action = EXISTS;

            if (connections[index] === undefined) {
              action = ADD;
            }
          }
        }
      });

      switch (action) {
        case ADD:
          newConnections[index] = viewIndex;
          view.splice(viewIndex, 0, value);
          viewIndex++;
          break;
        case REMOVE:
          view.removeAt(viewIndex);
          break;
        case EXISTS:
          newConnections[index] = viewIndex;
          viewIndex++;
          break;
      }
    });

    view._connections = newConnections;
    view.update = update;
    view.update();
  }


  /**
   * Performs a query operation on the DOM. Executes all data-query attributes
   * and renders the html result to the specified HTMLElement if not specified
   * uses document.body by default.
   *
   * @memberof blocks
   * @param {*} model - The model that will be used to query the DOM.
   * @param {HTMLElement} [element=document.body] - Optional element on which to execute the query.
   *
   * @example {html}
   * <script>
   *   blocks.query({
   *     message: 'Hello World!'
   *   });
   * </script>
   * <h1>Hey, {{message}}</h1>
   *
   * <!-- will result in -->
   * <h1>Hey, Hello World!</h1>
   */
  blocks.query = function query(model, element) {
    blocks.domReady(function () {
      blocks.$unwrap(element, function (element) {
        if (!blocks.isElement(element)) {
          element = document.body;
        }

        var domQuery = new DomQuery();
        var rootElement = createVirtual(element)[0];
        var serverData = window.__blocksServerData__;

        domQuery.pushContext(model);
        domQuery._serverData = serverData;

        if (serverData) {
          rootElement.render(domQuery);
        } else {
          rootElement.sync(domQuery);
        }
        domQuery.createElementObservableDependencies([element]);
      });
    });
  };

  blocks.executeQuery = function executeQuery(element, queryName /*, ...args */) {
    var methodName = VirtualElement.Is(element) ? 'preprocess' : 'update';
    var args = Array.prototype.slice.call(arguments, 2);
    var query = blocks.queries[queryName];
    if (query.passDomQuery) {
      args.unshift(blocks.domQuery(element));
    }
    query[methodName].apply(element, args);
  };

  /**
   * Gets the context for a particular element. Searches all parents until it finds the context.
   *
   * @memberof blocks
   * @param {(HTMLElement|blocks.VirtualElement)} element - The element from which to search for a context
   * @returns {Object} - The context object containing all context properties for the specified element
   *
   * @example {html}
   * <script>
   *   blocks.query({
   *     items: ['John', 'Alf', 'Mega'],
   *     alertIndex: function (e) {
   *       alert('Clicked an item with index:' + blocks.context(e.target).$index);
   *     }
   *   });
   * </script>
   * <ul data-query="each(items)">
   *   <li data-query="click(alertIndex)">{{$this}}</li>
   * </ul>
   */
  blocks.context = function context(element, isRecursive) {
    element = blocks.$unwrap(element);

    if (element) {
      var elementData = ElementsData.data(element);
      if (elementData) {
        if (isRecursive && elementData.childrenContext) {
          return elementData.childrenContext;
        }
        if (elementData.context) {
          return elementData.context;
        }
      }

      return blocks.context(VirtualElement.Is(element) ? element._parent : element.parentNode, true);
    }
    return null;
  };

  /**
   * Gets the associated dataItem for a particlar element. Searches all parents until it finds the context
   *
   * @memberof blocks
   * @param {(HTMLElement|blocks.VirtualElement)} element - The element from which to search for a dataItem
   * @returns {*}
   *
   * @example {html}
   * <script>
   *   blocks.query({
   *     items: [1, 2, 3],
   *     alertValue: function (e) {
   *       alert('Clicked the value: ' + blocks.dataItem(e.target));
   *     }
   *   });
   * </script>
   * <ul data-query="each(items)">
   *   <li data-query="click(alertValue)">{{$this}}</li>
   * </ul>
   */
  blocks.dataItem = function dataItem(element) {
    var context = blocks.context(element);
    return context ? context.$this : null;
  };

  /**
   * Determines if particular value is an blocks.observable
   *
   * @memberof blocks
   * @param {*} value - The value to check if the value is observable
   * @returns {boolean} - Returns if the value is observable
   *
   * @example {javascript}
   * blocks.isObservable(blocks.observable(3));
   * // -> true
   *
   * blocks.isObservable(3);
   * // -> false
   */
  blocks.isObservable = function isObservable(value) {
    return !!value && value.__identity__ === OBSERVABLE;
  };

  /**
   * Gets the raw value of an observable or returns the value if the specified object is not an observable
   *
   * @memberof blocks
   * @param {*} value - The value that could be any object observable or not
   * @returns {*} - Returns the unwrapped value
   *
   * @example {javascript}
   * blocks.unwrapObservable(blocks.observable(304));
   * // -> 304
   *
   * blocks.unwrapObservable(305);
   * // -> 305
   */
  blocks.unwrapObservable = function unwrapObservable(value) {
    if (value && value.__identity__ === OBSERVABLE) {
      return value();
    }
    return value;
  };

  blocks.domQuery = function domQuery(element) {
    element = blocks.$unwrap(element);
    if (element) {
      var data = ElementsData.data(element, 'domQuery');
      if (data) {
        return data;
      }
      return blocks.domQuery(VirtualElement.Is(element) ? element._parent : element.parentNode);
    }
    return null;
  };



  blocks.extend(blocks.queries, {
    /**
     * Associates the element with the particular view and creates a $view context property.
     * The View will be automatically hidden and shown if the view have routing. The visibility
     * of the View could be also controled using the isActive observable property
     *
     * @memberof blocks.queries
     * @param {View} view - The view to associate with the current element
     *
     * @example {html}
     * <!-- Associating the div element and its children with the Profiles view -->
     * <div data-query="view(Profiles)">
     *   <!-- looping through the View users collection -->
     *   <ul data-query="view(users)">
     *     <!-- Using the $view context value to point to the View selectUser handler -->
     *     <li data-query="click($view.selectUser)">{{username}}</li>
     *   </ul>
     * </div>
     *
     * @example {javascript}
     * var App = blocks.Application();
     *
     * App.View('Profiles', {
     *   init: function () {
     *     // ...initing this.users...
     *   },
     *
     *   selectUser: function (e) {
     *     // ...stuff...
     *   }
     * });
     *
     * App.start();
     */
    view: {
      passDomQuery: true,

      preprocess: function (domQuery, view) {
        //var args = Array.prototype.slice.call(arguments, 2);
        //view._initArgs = args;
        if (!view.isActive()) {
          this.css('display', 'none');
          //this._innerHTML = '';
          //view._children = this._children;
          //return false;
        } else {
          //view._tryInitialize(view.isActive());
          this.css('display', '');
          // Quotes are used because of IE8 and below. It failes with 'Expected idenfitier'
          //queries['with'].preprocess.call(this, domQuery, view, '$view');
          //queries.define.preprocess.call(this, domQuery, view._name, view);
        }

        queries['with'].preprocess.call(this, domQuery, view, '$view');
      },

      update: function (domQuery, view) {
        if (view.isActive()) {
          if (view._html) {
            // Quotes are used because of IE8 and below. It failes with 'Expected idenfitier'
            queries['with'].preprocess.call(this, domQuery, view, '$view');

            this.innerHTML = view._html;
            view._children = view._html = undefined;
            blocks.each(createVirtual(this.childNodes[0]), function (element) {
              if (VirtualElement.Is(element)) {
                element.sync(domQuery);
              }
            });
            domQuery.createElementObservableDependencies(this.childNodes);
          }
          animation.show(this);
        } else {
          animation.hide(this);
        }
      }
    },

    /**
     * Navigates to a particular view by specifying the target view or route and optional parameters
     *
     * @memberof blocks.queries
     * @param {(View|String)} viewOrRoute - the view or route to which to navigate to
     * @param {Object} [params] - parameters needed for the current route
     *
     * @example {html}
     * <!-- will navigate to /contactus because the ContactUs View have /contactus route -->
     * <a data-query="navigate(ContactUs)">Contact Us</a>
     *
     * <!-- will navigate to /products/t-shirts because the Products View have /products/{{category}} route -->
     * <a data-query="navigate(Products, { category: 't-shirts' })">T-Shirts</a>
     *
     * <!-- the same example as above but the route is directly specifying instead of using the View instance -->
     * <a data-query="navigate('/products/{{category}}', { category: 't-shirts' })">T-Shirts</a>
     */
    navigateTo: {
      update: function (viewOrRoute, params) {
        function navigate(e) {
          e = e || window.event;
          e.preventDefault();
          e.returnValue = false;

          if (blocks.isString(viewOrRoute)) {
            window.location.href = viewOrRoute;
          } else {
            viewOrRoute.navigateTo(viewOrRoute, params);
          }
        }

        addListener(this, 'click', navigate);
      }
    },

    trigger: {

    }
  });


  var validators = {
    required: {
      priority: 9,
      validate: function (value, options) {
        if (value !== options.defaultValue &&
            value !== '' &&
            value !== false &&
            value !== undefined &&
            value !== null) {
          return true;
        }
      }
    },

    minlength: {
      priority: 19,
      validate: function (value, options, option) {
        if (value === undefined || value === null) {
          return false;
        }
        return value.length >= parseInt(option, 10);
      }
    },

    maxlength: {
      priority: 29,
      validate: function (value, options, option) {
        if (value === undefined || value === null) {
          return true;
        }
        return value.length <= parseInt(option, 10);
      }
    },

    min: {
      priority: 39,
      validate: function (value, options, option) {
        if (value === undefined || value === null) {
          return false;
        }
        return value >= option;
      }
    },

    max: {
      priority: 49,
      validate: function (value, options, option) {
        if (value === undefined || value === null) {
          return false;
        }
        return value <= option;
      }
    },

    email: {
      priority: 59,
      validate: function (value) {
        return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
      }
    },

    url: {
      priority: 69,
      validate: function (value) {
        return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value);
      }
    },

    date: {
      priority: 79,
      validate: function (value) {
        if (!value) {
          return false;
        }
        return !/Invalid|NaN/.test(new Date(value.toString()).toString());
      }
    },

    creditcard: {
      priority: 89,
      validate: function (value) {
        if (blocks.isString(value) && value.length === 0) {
          return false;
        }
        if (blocks.isNumber(value)) {
          value = value.toString();
        }
        // accept only spaces, digits and dashes
        if (/[^0-9 \-]+/.test(value)) {
          return false;
        }
        var nCheck = 0,
            nDigit = 0,
            bEven = false;

        value = value.replace(/\D/g, '');

        for (var n = value.length - 1; n >= 0; n--) {
          var cDigit = value.charAt(n);
          nDigit = parseInt(cDigit, 10);
          if (bEven) {
            if ((nDigit *= 2) > 9) {
              nDigit -= 9;
            }
          }
          nCheck += nDigit;
          bEven = !bEven;
        }

        return (nCheck % 10) === 0;
      }
    },

    regexp: {
      priority: 99,
      validate: function (value, options, option) {
        if (!blocks.isRegExp(option)) {
          return false;
        }
        if (value === undefined || value === null) {
          return false;
        }
        return option.test(value);
      }
    },

    number: {
      priority: 109,
      validate: function (value) {
        if (blocks.isNumber(value)) {
          return true;
        }
        if (blocks.isString(value) && value.length === 0) {
          return false;
        }
        return /^(-?|\+?)(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
      }
    },

    digits: {
      priority: 119,
      validate: function (value) {
        return /^\d+$/.test(value);
      }
    },

    letters: {
      priority: 129,
      validate: function (value) {
        if (!value) {
          return false;
        }
        return /^[a-zA-Z]+$/.test(value);
      }
    },

    equals: {
      priority: 139,
      validate: function (value, options, option) {
        return blocks.equals(value, blocks.unwrap(option));
        //return value === blocks.unwrap(option);
      }
    }
  };

  // TODO: asyncValidate
  blocks.observable.validation = function (options) {
    var _this = this;
    var maxErrors = options.maxErrors;
    var errorMessages = this.errorMessages = blocks.observable([]);
    var validatorsArray = this._validators = [];
    var key;
    var option;

    this.errorMessage = blocks.observable('');

    for (key in options) {
      option = options[key];
      if (validators[key]) {
        validatorsArray.push({
          option: option,
          validate: validators[key].validate,
          priority: validators[key].priority
        });
      } else if (key == 'validate' || key == 'asyncValidate') {
        validatorsArray.push({
          option: '',
          validate: option.validate ? option.validate : option,
          priority: option.priority || Number.POSITIVE_INFINITY,
          isAsync: key == 'asyncValidate'
        });
      }
    }

    validatorsArray.sort(function (a, b) {
      return a.priority > b.priority ? 1 : -1;
    });

    this.valid = blocks.observable(true);

    this.validate = function () {
      var value = _this.__value__;
      var isValid = true;
      var errorsCount = 0;
      var i = 0;
      var validationOptions;
      var validator;
      var message;

      errorMessages.removeAll();
      for (; i < validatorsArray.length; i++) {
        if (errorsCount >= maxErrors) {
          break;
        }
        validator = validatorsArray[i];
        if (validator.isAsync) {
          validator.validate(value, function (result) {
            validationComplete(_this, options, !!result);
          });
          return true;
        } else {
          validationOptions = validator.option;
          option = validator.option;
          if (blocks.isPlainObject(validationOptions)) {
            option = validationOptions.value;
          }
          if (blocks.isFunction(option)) {
            option = option.call(_this.__context__);
          }
          message = validator.validate(value, options, option);
          if (blocks.isString(message)) {
            message = [message];
          }
          if (blocks.isArray(message) || !message) {
            errorMessages.addMany(
                blocks.isArray(message) ? message :
                validationOptions && validationOptions.message ? [validationOptions.message] :
                option && blocks.isString(option) ? [option] :
                []);
            isValid = false;
            errorsCount++;
          }
        }
      }

      validationComplete(this, options, isValid);
      this.valid(isValid);
      Events.trigger(this, 'validate');
      return isValid;
    };

    if (options.validateOnChange) {
      this.on('change', function () {
        this.validate();
      });
    }
    if (options.validateInitially) {
      this.validate();
    }
  };

  function validationComplete(observable, options, isValid) {
    var errorMessage = observable.errorMessage;
    var errorMessages = observable.errorMessages;

    if (isValid) {
      errorMessage('');
    } else {
      errorMessage(options.errorMessage || errorMessages()[0] || '');
    }

    observable.valid(isValid);
  }


  function escapeRegEx(string) {
    return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }

  blocks.route = function (route) {
    return Route(route);
  };

  function Route(route) {
    if (Route.Is(route)) {
      return route;
    }
    if (!Route.Is(this)) {
      return new Route(route);
    }

    this._routeString = route;
    this._wildcard = {};
    this._optional = {};
    this._validate = {};
    this._transform = {};
  }

  Route.Is = function (route) {
    return Route.prototype.isPrototypeOf(route);
  };

  Route.Has = function (route) {
    return route._routeString != null;
  };

  Route.Combine = function (routeA, routeB) {
    if (!Route.Has(routeB)) {
      return routeA;
    }
    if (!Route.Has(routeA)) {
      return routeB;
    }

    var route = Route(routeA + routeB);
    blocks.extend(route._wildcard, routeA._wildcard, routeB._wildcard);
    blocks.extend(route._optional, routeA._optional, routeB._optional);
    blocks.extend(route._validate, routeA._validate, routeB._validate);
    return route;
  };

  Route.prototype = {
    wildcard: function () {
      var wildcard = this._wildcard;
      var wildcards = blocks.flatten(blocks.toArray(arguments));
      blocks.each(wildcards, function (value) {
        wildcard[value] = true;
      });

      return this;
    },

    optional: function (nameOrObject, value) {
      this._addMetadata('optional', nameOrObject, value);

      return this;
    },

    validate: function (nameOrObject, value) {
      this._addMetadata('validate', nameOrObject, value);

      return this;
    },

    transform: function (nameOrObject, value) {
      this._addMetadata('_transform', nameOrObject, value);

      return this;
    },

    toString: function () {
      return this._routeString ? this._routeString.toString() : '';
    },

    trailingSlash: function () {
      return this;
    },

    _transfromParam: function (paramName, value) {
      var transform = this._transform[paramName];
      if (value === '' && blocks.has(this._optional, paramName)) {
        value = this._optional[paramName];
      }
      if (transform) {
        return transform(value);
      }
      return value;
    },

    _validateParam: function (paramName, value) {
      var validator = this._validate[paramName];
      if (validator) {
        return validator(value);
      }
      return true;
    },

    _addMetadata: function (type, nameOrObject, value) {
      var metadata = this['_' + type];

      if (blocks.isPlainObject(nameOrObject)) {
        blocks.each(nameOrObject, function (val, key) {
          metadata[key] = val;
        });
      } else if (blocks.isString(nameOrObject)) {
        metadata[nameOrObject] = value;
      }
    }
  };

  function Router() {
    this._currentRoute = {};
    this._routes = {};
  }

  blocks.core.Router = Router;

  Router.GenerateRoute = function (routeString, params) {
    var router = new Router();
    var routeId = router.registerRoute(routeString);
    return router.routeTo(routeId, params);
  };

  Router.prototype = {
    registerRoute: function (route, parentRoute) {
      route = Route(route);
      parentRoute = parentRoute ? Route(this._routes[Route(parentRoute).toString()].route) : Route(undefined);

      var finalRoute = Route.Combine(parentRoute, route);
      var routeId = finalRoute._routeString = finalRoute._routeString.replace(/^\//, '');
      var routeData = this._generateRouteStringData(routeId);

      this._routes[routeId] = {
        route: finalRoute,
        data: routeData,
        regExCollection: this._generateRouteRegEx(finalRoute, routeData),
        parent: Route.Has(parentRoute) ? this._routes[parentRoute.toString()] : undefined
      };

      return routeId;
    },

    routeTo: function (routeId, params) {
      var routeMetadata = this._routes[routeId];
      var route = routeMetadata.route;
      var result = '';
      var param;

      params = params || {};

      blocks.each(routeMetadata.data, function (split) {
        param = split.param;
        if (param) {
          if (route._validateParam(params[param])) {
            result += blocks.has(params, param) ? params[param] : route._optional[param];
          }
        } else {
          result += split.string;
        }
      });

      return result;
    },

    routeFrom: function (url) {
      var getUrlParams = this._getUrlParams;
      var result = [];
      var matches;

      url = decodeURI(url);

      blocks.each(this._routes, function (routeMetadata) {
        blocks.each(routeMetadata.regExCollection, function (regEx) {
          if (regEx.regEx.test(url)) {
            matches = regEx.regEx.exec(url);
            while (routeMetadata) {
              result.unshift({
                id: routeMetadata.route._routeString,
                params: getUrlParams(routeMetadata, regEx.params, matches)
              });
              routeMetadata  = routeMetadata.parent;
            }
            return false;
          }
        });
      });

      return result.length ? result : null;
    },

    _getUrlParams: function (routeMetadata, params, matches) {
      var route = routeMetadata.route;
      var result = {};
      var value;
      var param;

      blocks.each(params, function (param, index) {
        value = matches[index + 1];
        if (route._validateParam(param, value)) {
          result[param] = route._transfromParam(param, value);
        }
      });

      blocks.each(routeMetadata.data, function (split) {
        param = split.param;
        if (param && !result[param] &&
          blocks.has(route._optional, param) && route._optional[param] !== undefined) {

          result[param] = route._optional[param];
        }
      });

      return result;
    },

    _generateRouteRegEx: function (route, routeData) {
      var result = [];
      var sliceLastFromRegExString = this._sliceLastFromRegExString;
      var combinations = this._getOptionalParametersCombinations(route, routeData);
      var allOptionalBetweenForwardSlash;
      var containsParameter;
      var regExString;
      var params;
      var param;

      blocks.each(combinations, function (skipParameters) {
        regExString = '^';
        params = [];

        blocks.each(routeData, function (split) {
          param = split.param;
          if (param) {
            containsParameter = true;
            if (!blocks.has(route._optional, param) || !skipParameters[param]) {
              allOptionalBetweenForwardSlash = false;
            }
            if (skipParameters[param]) {
              return;
            } else {
              params.push(param);
            }
            if (route._wildcard[param]) {
              regExString += blocks.has(route._optional, param) ? '(.*?)' : '(.+?)';
            } else {
              regExString += blocks.has(route._optional, param) ? '([^\/]*?)' : '([^\/]+?)';
            }
          } else {
            if (split.string == '/') {
              if (containsParameter && allOptionalBetweenForwardSlash) {
                regExString = sliceLastFromRegExString(regExString);
              }
              containsParameter = false;
              allOptionalBetweenForwardSlash = true;
            }
            regExString += escapeRegEx(split.string);
          }
        });

        if (containsParameter && allOptionalBetweenForwardSlash) {
          regExString = sliceLastFromRegExString(regExString);
        }

        result.push({
          regEx: new RegExp(regExString + '$', 'i'),
          params: params
        });
      });

      return result;
    },

    _sliceLastFromRegExString: function (regExString) {
      var index;

      for (var i = 0; i < regExString.length; i++) {
        index = regExString.length - i - 1;
        if (regExString.charAt(index) == '/' && regExString.charAt(index + 1) != ']') {
          break;
        }
      }

      return regExString.substring(0, index - 1);
    },

    _getOptionalParametersCombinations: function (route, routeData) {
      var optionalParameters = this._getOptionalParameters(route, routeData);
      var iterations = Math.pow(2, optionalParameters.length);
      var length = optionalParameters.length;
      var combinations = [{}];
      var current;
      var i;
      var j;

      for (i = 0; i < iterations ; i++) {
        current = {};
        current.__lowestIndex__ = length;
        current.__length__ = 0;
        for (j = 0; j < length; j++) {
          /* jshint bitwise: false */
          if ((i & Math.pow(2, j))) {
            if (j < current.__lowestIndex__) {
              current.__lowestIndex__ = j;
            }
            current[optionalParameters[j]] = true;
            current.__length__ += 1;
          }
        }
        if (current.__length__) {
          combinations.push(current);
        }
      }

      combinations.sort(function (x, y) {
        var result = x.__length__ - y.__length__;

        if (!result) {
          return y.__lowestIndex__ - x.__lowestIndex__;
        }

        return result;
      });

      return combinations;
    },

    _getOptionalParameters: function (route, routeData) {
      var optionalParameters = [];

      blocks.each(routeData, function (split) {
        if (blocks.has(route._optional, split.param)) {
          optionalParameters.push(split.param);
        }
      });

      return optionalParameters;
    },

    _generateRouteStringData: function (routeString) {
      var pushStringData = this._pushStringData;
      var data = [];
      var lastIndex = 0;

      routeString.replace(/{{[^}]+}}/g, function (match, startIndex) {
        pushStringData(data, routeString.substring(lastIndex, startIndex));
        lastIndex = startIndex + match.length;
        data.push({
          param: match.substring(2, match.length - 2)
        });
      });

      if (lastIndex != routeString.length) {
        pushStringData(data, routeString.substring(lastIndex));
      }

      return data;
    },

    _pushStringData: function (data, string) {
      var splits = string.split('/');
      blocks.each(splits, function (split, index) {
        if (split) {
          data.push({
            string: split
          });
        }
        if (index != splits.length - 1) {
          data.push({
            string: '/'
          });
        }
      });
    }
  };

  var uniqueId = (function () {
    var timeStamp = Date.now();
    return function () {
      return 'blocks-' + blocks.version + '-' + timeStamp++;
    };
  })();

  function Request(options) {
    this.options = blocks.extend({}, Request.Defaults, options);
    this.execute();
  }

  Request.Execute = function (options) {
    return new Request(options);
  };

  Request.Defaults = {
    type: 'GET',
    url: '',
    processData: true,
    async: true,
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    jsonp: 'callback',
    jsonpCallback: function () {
      return uniqueId();
    }

  /*
  timeout: 0,
  data: null,
  dataType: null,
  username: null,
  password: null,
  cache: null,
  throws: false,
  traditional: false,
  headers: {},
  */
  };

  Request.Accepts = {
    '*': '*/'.concat('*'),
    text: 'text/plain',
    html: 'text/html',
    xml: 'application/xml, text/xml',
    json: 'application/json, text/javascript'
  };

  Request.Meta = {
    statusFix: {
      // file protocol always yields status code 0, assume 200
      0: 200,
      // Support: IE9
      // IE sometimes returns 1223 instead of 204
      1223: 204
    }
  };

  Request.prototype = {
    execute: function () {
      var options = this.options;

      if (options.type == 'GET' && options.data) {
        this.appendDataToUrl(options.data);
      }

      try {
        if (options.dataType == 'jsonp') {
          this.scriptRequest();
        } else {
          this.xhrRequest();
        }
      } catch (e) {

      }
    },

    xhrRequest: function () {
      var options = this.options;
      var xhr = this.createXHR();

      xhr.onabort = blocks.bind(this.xhrError, this);
      xhr.ontimeout = blocks.bind(this.xhrError, this);
      xhr.onload = blocks.bind(this.xhrLoad, this);
      xhr.onerror = blocks.bind(this.xhrError, this);
      xhr.open(options.type.toUpperCase(), options.url, options.async, options.username, options.password);
      xhr.setRequestHeader('Content-Type', options.contentType);
      xhr.setRequestHeader('Accept', Request.Accepts[options.dataType || '*']);
      xhr.send(options.data || null);
    },

    createXHR: function () {
      var Type = XMLHttpRequest || window.ActiveXObject;
      try {
        return new Type('Microsoft.XMLHTTP');
      } catch (e) {

      }
    },

    xhrLoad: function (e) {
      var request = e.target;
      var status = Request.Meta.statusFix[request.status] || request.status;
      var isSuccess = status >= 200 && status < 300 || status === 304;
      if (isSuccess) {
        this.callSuccess(request.responseText);
      } else {
        this.callError(request.statusText);
      }
    },

    xhrError: function () {
      this.callError();
    },

    scriptRequest: function () {
      var that = this;
      var options = this.options;
      var script = document.createElement('script');
      var jsonpCallback = {};
      var callbackName = blocks.isFunction(options.jsonpCallback) ? options.jsonpCallback() : options.jsonpCallback;

      jsonpCallback[options.jsonp] = callbackName;
      this.appendDataToUrl(jsonpCallback);
      window[callbackName] = function (result) {
        window[callbackName] = null;
        that.scriptLoad(result);
      };

      script.onerror = this.scriptError;
      script.async = options.async;
      script.src = options.url;
      document.head.appendChild(script);
    },

    scriptLoad: function (data) {
      this.callSuccess(data);
    },

    scriptError: function () {
      this.callError();
    },

    appendDataToUrl: function (data) {
      var that = this;
      var options = this.options;
      var hasParameter = /\?/.test(options.url);

      if (blocks.isPlainObject(data)) {
        blocks.each(data, function (value, key) {
          options.url += that.append(hasParameter, key, value.toString());
        });
      } else if (blocks.isArray(data)) {
        blocks.each(data, function (index, value) {
          that.appendDataToUrl(value);
        });
      } else {
        options.url += that.append(hasParameter, data.toString(), '');
      }
    },

    append: function (hasParameter, key, value) {
      var result = hasParameter ? '&' : '?';
      result += key;
      if (value) {
        result += '=' + value;
      }
      return result;
    },

    callSuccess: function (data) {
      var success = this.options.success;
      var textStatus = 'success';
      if (success) {
        success(data, textStatus, null);
      }
      this.callComplete(textStatus);
    },

    callError: function (errorThrown) {
      var error = this.options.error;
      var textStatus = 'error';
      if (error) {
        error(null, textStatus, errorThrown);
      }
      this.callComplete(textStatus);
    },

    callComplete: function (textStatus) {
      var complete = this.options.complete;
      if (complete) {
        complete(null, textStatus);
      }
    }
  };


  function ajax(options) {
    if (window) {
      var jQuery = window.jQuery || window.$;
      if (jQuery && jQuery.ajax) {
        jQuery.ajax(options);
      } else {
        Request.Execute(options);
      }
    }
  }

  var CREATE = 'create';
  var UPDATE = 'update';
  var DESTROY = 'destroy';
  var GET = 'GET';
  var CONTENT_TYPE = 'application/json; charset=utf-8';
  //var JSONP = 'jsonp';
  var EVENTS = [
      'change',
      'sync',
      'error',
      'requestStart',
      'requestEnd'
  ];

  function DataSource(options) {
    options = options || {};
    var data = options.data;
    var baseUrl = options.baseUrl;

    // set options.data to undefined and return the extended options object using ||
    options = this.options = (options.data = undefined) || blocks.extend(true, {}, this.options, options);

    if (baseUrl) {
      options.read.url = baseUrl + options.read.url;
      options.create.url = baseUrl + options.create.url;
      options.destroy.url = baseUrl + options.destroy.url;
      options.update.url = baseUrl + options.update.url;
    }

    if (blocks.observable) {
      this.data = blocks
          .observable(blocks.unwrap(data) || [])
          .extend()
          .on('add remove', blocks.bind(this._onArrayChange, this));
      this.view = blocks.observable([]).extend();
      this.hasChanges = blocks.observable(false);
    }

    this._aggregates = null;
    this._changes = [];
    this._changesMeta = {};
    this._page = options.page;
    this._pageSize = options.pageSize;
    this._sortExpressions = blocks.toArray(options.sortExpressions);
    this._filterExpressions = blocks.isArray(options.filterExpressions) ? options.filterExpressions : [{ logic: 'and', filters: [options.filterExpressions] }];
    this._groupExpressions = blocks.toArray(options.groupExpressions);
    this._aggregateExpressions = blocks.toArray(options.aggregateExpressions);

    this._subscribeToEvents();
  }

  blocks.DataSource = DataSource;

    DataSource.prototype = {
    options: {
      baseUrl: '',
      idAttr: '',

      read: {
        url: '',
        type: GET,
        contentType: CONTENT_TYPE
      },

      update: {
        url: '',
        type: 'POST',
        contentType: CONTENT_TYPE
      },

      create: {
        url: '',
        type: 'POST',
        contentType: CONTENT_TYPE
      },

      destroy: {
        url: '',
        type: 'POST',
        contentType: CONTENT_TYPE
      },

      // data: null, // the initial data
      // autoSync: false,
      // batch: false,

      //serverPaging: false,
      page: 1,
      pageSize: Number.POSITIVE_INFINITY,


      //#region Advanced

      //serverAggregates: false,
      aggregateExpressions: [
          //{ field: 'Age', aggregate: 'sum' }
      ],

      //serverFiltering: false,
      filterExpressions: {
        //logic: 'or',
        //filters: [
        //    { field: 'category', operator: 'eq', value: 'asd' },
        //    {
        //        logic: 'and',
        //        filters: [

        //        ]
        //    }
        //]
      },

      //serverGrouping: false,
      groupExpressions: [
          //{ field: 'category', aggregate: 'sum', dir: 'desc' },
          //{ field: 'subcategory' },
      ],

      //serverSorting: false,
      sortExpressions: [
          //{ field: 'category', dir: 'desc' },
          //{ field: 'name', dir: 'asc' }
      ]

      //schema: {
      //    model: {
      //        id: 'ProductID',
      //        fields: {
      //            ProductID: {
      //                //this field will not be editable (default value is true)
      //                editable: false,
      //                // a defaultValue will not be assigned (default value is false)
      //                nullable: true
      //            },
      //            ProductName: {
      //                //set validation rules
      //                validation: { required: true }
      //            },
      //            UnitPrice: {
      //                //data type of the field {Number|String|Boolean|Date} default is String
      //                type: 'number',
      //                // used when new model is created
      //                defaultValue: 42,
      //                validation: { required: true, min: 1 }
      //            }
      //        }
      //    },

      //    parse: function (response) {
      //        var products = [];
      //        for (var i = 0; i < response.length; i++) {
      //            var product = {
      //                id: response[i].ProductID,
      //                name: response[i].ProductName
      //            };
      //            products.push(product);
      //        }
      //        return products;
      //    },

      //    // specify the the schema is XML
      //    type: 'xml',
      //    // the XML element which represents a single data record
      //    data: '/books/book',
      //    // define the model - the object which will represent a single data record
      //    model: {
      //        // configure the fields of the object
      //        fields: {
      //            // the 'title' field is mapped to the text of the 'title' XML element
      //            title: 'title/text()',
      //            // the 'id' field is mapped to the 'id' attribute of the 'book' XML element
      //            id: '@cover'
      //        }
      //    }
      //},


      //#endregion
    },

    query: function (options, callback) { // Executes the specified query over the data items. Makes a HTTP request if bound to a remote service.
      //dataSource.query({
      //    sort: { field: 'ProductName', dir: 'desc' },
      //    page: 3,
      //    pageSize: 20
      //});

      callback = arguments[arguments.length - 1];
      if (!options || blocks.isFunction(options)) {
        options = {};
      }

      options.__updateData__ = false;
      this.read(options, callback);
      return this;
    },

    read: function (options, callback) {
      var that = this,
          requiresEntireData = that._requiresEntireData();

      callback = arguments[arguments.length - 1];
      if (blocks.isFunction(options)) {
        options = {};
      }
      options = options || {};

      if (requiresEntireData) {
        options.page = 1;
        options.pageSize = Number.POSITIVE_INFINITY;
      }

      that._ajax('read', options, function (data) {
        if (blocks.isString(data)) {
          data = JSON.parse(data);
        }
        if (!blocks.isArray(data)) {
          if (blocks.isArray(data.value)) {
            data = data.value;
          } else if (blocks.isObject(data)) {
            blocks.each(data, function (value) {
              if (blocks.isArray(value)) {
                data = value;
                return false;
              }
            });
          }

          if (!blocks.isArray(data)) {
            data = [data];
          }
        }
        if (!options || options.__updateData__ !== false) {
          that._updateData(data, requiresEntireData);
        }
        if (callback && blocks.isFunction(callback)) {
          callback(data);
        }
      });
      return that;
    },

    fetch: function (callback) {
      callback = callback || blocks.noop;
      if (this._haveData()) {
        this._updateData(this._data);
      } else {
        this.read(callback);
      }
    },

    // should accept dataItem only
    // should accept id + object with the new data
    update: function () {
      if (arguments.length === 0) {
        return;
      }
      var items;
      if (arguments.length > 1 && blocks.type(arguments[0]) != blocks.type(arguments[1])) {
        items = [arguments[1]];
        items[0][this.options.idAttr] = arguments[0];
      } else {
        items = blocks.flatten(arguments);
      }
      if (items.length > 0) {
        this._changes.push({
          type: UPDATE,
          items: items
        });
        this._onChangePush();
      }
    },

    hasChanges: function () {
      return this._changes.length > 0;
    },

    clearChanges: function () {
      this._changes.splice(0, this._changes.length);
      this._changesMeta = {};
      this.hasChanges(false);
      return this;
    },

    sync: function () {
      var _this = this;
      var changes = this._changes;
      var changesLeft = changes.length;
      var data;

      blocks.each(changes, function (change) {
        blocks.each(change.items, function (item) {
          data = item;
          if (item.__id__) {
            delete item.__id__;
          }
          //if (change.type == DESTROY && blocks.isObject(item) && _this.options.idAttr) {
          //  data = item[_this.options.idAttr];
          //}
          _this._ajax(change.type, {
            data: data
          }, function () {
            changesLeft--;
            if (!changesLeft) {
              _this._trigger('sync');
            }
          });
        });
      });
      return this.clearChanges();
    },

    _ajax: function (optionsName, options, callback) {
      var _this = this;
      var type;

      options = blocks.extend({}, this.options[optionsName], options);
      type = options.type.toUpperCase();
      options.url = Router.GenerateRoute(options.url, options.data);
      this._trigger('requestStart', {

      });
      ajax({
        type: options.type,
        url: options.url,
        data: type == GET ? null : JSON.stringify(options.data),
        contentType: options.contentType, // 'application/json; charset=utf-8',
        dataType: options.dataType,
        jsonp: options.jsonp,
        success: function (data, statusMessage, status) {
          _this._trigger('requestEnd', {});
          if (data) {
            callback(data, statusMessage, status);
          }
        },
        error: function (/*message, statusObject, status*/) {
          _this._trigger('requestEnd', {});
          _this._trigger('error');
        }
      });
    },

    removeWhere: function () {

    },

    //#region Advanced

    aggregates: function () {
      if (!this._aggregates) {
        this._aggregates = this.data.aggregate(this._aggregateExpressions);
      }
      return this._aggregates;
    },

    getById: function () {

    },

    add: function () {
      return this.data.add.apply(this.data, blocks.toArray(arguments));
    },

    remove: function () {
      this.data.remove.apply(this.data, blocks.toArray(arguments));
      return this;
    },

    removeAt: function (index, count) {
      this.data.removeAt(index, count);
      return this;
    },

    page: createProperty('_page'),
    pageSize: createProperty('_pageSize'),
    sortExpressions: createProperty('_sortExpressions'),
    filterExpressions: createProperty('_filterExpressions'),
    groupExpressions: createProperty('_groupExpressions'),
    aggregateExpressions: createProperty('_aggregateExpressions'),
    //#endregion

    _updateData: function (data, requiresEntireData) {
      data = blocks.unwrapObservable(data);
      var pageSize = this._pageSize;
      var startIndex;

      requiresEntireData = arguments.length > 1 ? requiresEntireData : this._requiresEntireData();

      this.view.removeAll();
      if (requiresEntireData) {
        startIndex = (this._page - 1) * pageSize;
        this._haveAllData = true;
        data = blocks.sortBy(data, this._sortExpressions);

        if (this.data().length === 0) {
          this.data.addMany(data);
        }
        this.view.addMany(data.slice(startIndex, startIndex + pageSize));
      } else {
        this.data.removeAll();
        this.data.addMany(data);
        this.view.addMany(data);
      }
      this.clearChanges();
      this._trigger('change');
    },

    _onArrayChange: function (args) {
      var type = args.type;
      if (type == 'remove') {
        this._remove(args.items);
      } else if (type == 'removeAt') {
        this._remove(this.view.slice(args.index, args.index + args.count));
      } else if (type == 'add') {
        this._add(args.items);
      }
    },

    _onChangePush: function () {
      var metadata = this._changesMeta;
      var changes = this._changes;
      var change = changes[changes.length - 1];
      var idAttr = this.options.idAttr;
      var type = change.type;
      var metaItem;

      blocks.each(change.items, function (item) {
        switch (type) {
          case CREATE:
            item.__id__ = uniqueId();
            metadata[item.__id__] = item;
            break;
          case UPDATE:
            metaItem = metadata[item[idAttr]];
            if (metaItem) {
              changes.splice(metaItem.index, 1);
              metaItem.item = item;
              metaItem.index = changes.length - 1;
            }
            metadata[item[idAttr]] = {
              index: changes.length - 1,
              item: item
            };
            break;
          case DESTROY:
            metaItem = metadata[item ? item.__id__ : undefined];
            if (metaItem) {
              changes.splice(metaItem.index, 1);
              changes.pop();
              metadata[item.__id__] = undefined;
            }
            break;
        }
      });

      if (changes.length > 0 && this.options.autoSync) {
        this.sync();
      } else {
        this.hasChanges(changes.length > 0);
      }
    },

    _add: function (items) {
      this._changes.push({
        type: CREATE,
        items: items
      });
      this._onChangePush();
    },

    _remove: function (items) {
      this._changes.push({
        type: DESTROY,
        items: items
      });
      this._onChangePush();
    },

    _haveData: function () {
      var startIndex = (this._page + 1) * this._pageSize;
      var data = this.data();

      return this._haveAllData || (data[startIndex] && data[startIndex + this._pageSize]);
    },

    _requiresEntireData: function () {
      var options = this.options;
      return (!options.serverPaging && this._pageSize != Number.POSITIVE_INFINITY) ||
          (!options.serverSorting && !blocks.isEmpty(options.sortExpressions)) ||
          (!options.serverFiltering && !blocks.isEmpty(options.filterExpressions)) ||
          (!options.serverGrouping && !blocks.isEmpty(options.groupExpressions)) ||
          (!options.serverAggregates && !blocks.isEmpty(options.aggregateExpressions));
    },

    _subscribeToEvents: function () {
      var _this = this;
      var options = this.options;

      blocks.each(EVENTS, function (value) {
        if (options[value]) {
          _this.on(value, options[value]);
        }
      });
    }
  };

  Events.register(DataSource.prototype, [
    'on',
    '_trigger',


    // TODO: Should remove these
    'change',
    'error',
    'requestStart',
    'requestEnd'
  ]);

  blocks.core.applyExpressions('array', blocks.DataSource.prototype, blocks.toObject([/*'remove', 'removeAt', 'removeAll', 'add',*/ 'size', 'at', 'isEmpty', 'each']));



  function Property(options) {
    this._options = options || {};
  }

  Property.Is = function (value) {
    return Property.prototype.isPrototypeOf(value);
  };

  Property.Inflate = function (object) {
    var properties = {};
    var key;
    var value;

    for (key in object) {
      value = object[key];
      if (Property.Is(value)) {
        value = value._options;
        value.propertyName = key;
        properties[value.field || key] = value;
      }
    }

    return properties;
  };

  Property.Create = function (options, thisArg, value) {
    var observable;

    if (arguments.length < 3) {
      value = options.value || options.defaultValue;
    }
    thisArg = options.thisArg ? options.thisArg : thisArg;

    observable = blocks
      .observable(value, thisArg)
      .extend('validation', options)
      .on('changing', options.changing, thisArg)
      .on('change', options.change, thisArg);

    blocks.each(options.extenders, function (extendee) {
      observable = observable.extend.apply(observable, extendee);
    });

    return observable;
  };

  Property.prototype.extend = function () {
    var options = this._options;
    options.extenders = options.extenders || [];
    options.extenders.push(blocks.toArray(arguments));

    return this;
  };



  /**
   * @namespace Model
   */
  function Model(application, prototype, dataItem, collection) {
    var _this = this;
    this._application = application;
    this._collection = collection;
    this._initialDataItem = blocks.clone(dataItem, true);

    blocks.each(Model.prototype, function (value, key) {
      if (blocks.isFunction(value) && key.indexOf('_') !== 0) {
        _this[key] = blocks.bind(value, _this);
      }
    });
    clonePrototype(prototype, this);

    this.valid = blocks.observable(true);

    this.isLoading = blocks.observable(false);

    this.validationErrors = blocks.observable([]);

    this._isNew = false;
    this._dataItem = dataItem || {}; // for original values
    this._properties = Property.Inflate(this);
    if (!this.options.baseUrl) {
      this.options.baseUrl = application.options.baseUrl;
    }
    this._dataSource = new DataSource(this.options);
    this._dataSource.on('change', this._onDataSourceChange, this);
    this._dataSource.requestStart(function () {
      _this.isLoading(true);
    });
    this._dataSource.requestEnd(function () {
      _this.isLoading(false);
    });
    this._dataSource.on('sync', this._onDataSourceSync);
    this.hasChanges = this._dataSource.hasChanges;

    this._ensurePropertiesCreated(dataItem);
    this.init();
  }

  Model.prototype = {
    /**
     * The options for the Model
     *
     * @memberof Model
     * @type {Object}
     */
    options: {},

    /**
     * Override the init method to perform actions on creation for each Model instance
     *
     * @memberof Model
     * @type {Function}
     *
     * @example {javascript}
     * var App = blocks.Application();
     *
     * var Product = App.Model({
     *   init: function () {
     *     this.finalPrice = this.price() * this.ratio();
     *   },
     *
     *   price: App.Property({
     *     defaultValue: 0
     *   }),
     *
     *   ratio: App.Property({
     *     defaultValue: 1
     *   })
     * });
     */
    init: blocks.noop,

    collection: function () {
      return this._collection;
    },

    /**
     * Validates all observable properties that have validation and returns true if
     * all values are valid otherwise returns false
     *
     * @memberof Model
     * @returns {boolean} - Value indicating if the model is valid or not
     *
     * @example {javascript}
     * var App = blocks.Application();
     *
     * var User = App.Model({
     *   username: App.Property({
     *     required: true
     *   }),
     *
     *   email: App.Property({
     *     email: true
     *   })
     * });
     *
     * App.View('SignUp', {
     *   newUser: User(),
     *
     *   registerHandler: function () {
     *     if (this.newUser.validate()) {
     *       alert('Successful registration!');
     *     }
     *   }
     * });
     */
    validate: function () {
      var properties = this._properties;
      var isValid = true;
      var property;
      var key;

      for (key in properties) {
        property = this[key];
        if (blocks.isObservable(property) && !property.validate()) {
          isValid = false;
        }
      }
      this.valid(isValid);
      this._updateValidationErrors();
      return isValid;
    },

    /**
     * Extracts the raw(non observable) dataItem object values from the Model
     *
     * @memberof Model
     * @returns {Object} - Returns the raw dataItem object
     *
     * @example {javascript}
     * var App = blocks.Application();
     * var User = App.Model({
     *   firstName: App.Property({
     *     defaultValue: 'John'
     *   })
     * });
     *
     * App.View('Profile', {
     *   user: User(),
     *
     *   init: function () {
     *     var dataItem = this.user.dataItem();
     *     // -> { firstName: 'defaultValue' }
     *   }
     * });
     */
    dataItem: function () {
      var properties = this._properties;
      var dataItem = {};
      var key;
      var property;

      for (key in properties) {
        property = properties[key];
        if (key != '__id__' && this[property.propertyName]) {
          dataItem[property.field || property.propertyName] = this[property.propertyName]();
        }
      }
      if (this.isNew()) {
        delete dataItem[this.options.idAttr];
      }

      return dataItem;
    },

    /**
     * Applies new properties to the Model by providing an Object
     *
     * @memberof Model
     * @param {Object} dataItem - The object from which the new values will be applied
     * @returns {Model} - Chainable. Returns itself
     */
    reset: function (dataItem) {
      this._ensurePropertiesCreated(dataItem);
      return this;
    },

    /**
     * Determines whether the instance is new. If true when syncing the item will send
     * for insertion instead of updating it. The check is determined by the idAttr value
     * specified in the options. If idAttr is not specified the item will always be considered new.
     *
     * @memberof Model
     * @returns {boolean} - Returns whether the instance is new
     */
    isNew: function () {
      var idAttr = this.options.idAttr;
      var value = blocks.unwrap(this[idAttr]);
      var property = this._properties[idAttr];

      if ((!value && value !== 0) || (property && value === property.defaultValue)) {
        return true;
      }
      return false;
    },

    /**
     * Fires a request to the server to populate the Model based on the read URL specified
     *
     * @memberof Model
     * @param {Object} [params] - The parameters Object that will be used to populate the
     * Model from the specified options.read URL. If the URL does not contain parameters
     * @returns {Model} - Chainable. Returns the Model itself - returns this;
     */
    read: function (params, callback) {
      // TODO: Write tests for the callback checking if it is beeing called
      if (blocks.isFunction(params)) {
        callback = params;
        params = undefined;
      }
      this._dataSource.read({
        data: params
      }, callback);
      return this;
    },


    destroy: function (removeFromCollection) {
      removeFromCollection = removeFromCollection === false ? false : true;
      if (removeFromCollection && this._collection) {
        this._collection.remove(this);
      }
      this._dataSource._remove([this.dataItem()]);
      return this;
    },

    /**
     * Synchronizes the changes with the server by sending requests to the provided URL's
     *
     * @memberof Model
     * @returns {Model} - Returns the Model itself - return this;
     */
    sync: function () {
      if (this.isNew()) {
        this._dataSource.add(this.dataItem());
      }
      this._dataSource.sync();
      return this;
    },

    clone: function () {
      return new this.constructor(blocks.clone(this._initialDataItem, true));
    },

    _setPropertyValue: function (property, propertyValue) {
      var propertyName = property.propertyName;
      if (blocks.isFunction(this[propertyName])) {
        this[propertyName](propertyValue);
        this._dataSource.update(this.dataItem());
      } else if (property.isObservable) {
        this[propertyName] = this._createObservable(property, propertyValue);
      } else {
        this[propertyName] = function () {
          return propertyValue;
        };
      }
    },

    _ensurePropertiesCreated: function (dataItem) {
      var properties = this._properties;
      var property;
      var key;
      var field;

      if (dataItem) {
        if (Model.prototype.isPrototypeOf(dataItem)) {
          dataItem = dataItem.dataItem();
        }

        for (key in dataItem) {
          property = properties[key];
          if (!property) {
            property = properties[key] = blocks.extend({}, this._application.Property.Defaults());
            property.propertyName = key;
          }
          this._setPropertyValue(property, dataItem[key]);
        }
      }

      for (key in properties) {
        property = properties[key];
        if (!blocks.has(dataItem, property.propertyName)) {
          field = property.field || property.propertyName;
          this._setPropertyValue(property, property.value || (blocks.has(dataItem, field) ? dataItem[field] : property.defaultValue));
        }
      }
    },

    _createObservable: function (property, value) {
      var _this = this;
      var properties = this._properties;
      var observable = Property.Create(property, this, value);

      observable
        .on('change', function () {
          if (!_this.isNew()) {
            _this._dataSource.update(_this.dataItem());
          }
        })
        .on('validate', function () {
          var isValid = true;
          var key;
          for (key in properties) {
            if (!_this[key].valid()) {
              isValid = false;
              break;
            }
          }
          _this._updateValidationErrors();
          _this.valid(isValid);
        });

      if (!this._collection) {
        observable.extend();
      }
      return observable;
    },

    _onDataSourceChange: function () {
      var dataItem = blocks.unwrapObservable(this._dataSource.view())[0];
      this._ensurePropertiesCreated(dataItem);
    },

    _updateValidationErrors: function () {
      var properties = this._properties;
      var result = [];
      var value;
      var key;

      for (key in properties) {
        value = this[key];
        if (value.errorMessages) {
          result.push.apply(result, value.errorMessages());
        }
      }

      this.validationErrors.reset(result);
    }
  };

  if (blocks.core.expressionsCreated) {
    blocks.core.applyExpressions('object', Model.prototype);
  }


  function clonePrototype(prototype, object) {
    var key;
    var value;

    if (prototype.__used__) {
      for (key in prototype) {
        value = prototype[key];
        if (Property.Is(value)) {
          continue;
        }

        if (blocks.isObservable(value)) {
          // clone the observable and also its value by passing true to the clone method
          object[key] = value.clone(true);
        } else if (blocks.isFunction(value)) {
          object[key] = blocks.bind(value, object);
        } else if (Model.prototype.isPrototypeOf(value)) {
          object[key] = value.clone(true);
        } else if (blocks.isObject(value) && !blocks.isPlainObject(value)) {
          object[key] = blocks.clone(value, true);
        } else {
          object[key] = blocks.clone(value, true);
        }
      }
    } else {
      for (key in prototype) {
        value = prototype[key];
        if (blocks.isObservable(value)) {
          value.__context__ = object;
        } else if (blocks.isFunction(value)) {
          object[key] = blocks.bind(value, object);
          object[key].unbound = value;
        }
      }
    }

    prototype.__used__ = true;
  }

  var routeStripper = /^[#\/]|\s+$/g;
  var rootStripper = /^\/+|\/+$/g;
  var isExplorer = /msie [\w.]+/;
  var trailingSlash = /\/$/;
  var pathStripper = /[?#].*$/;
  var HASH = 'hash';
  var PUSH_STATE = 'pushState';

  function History(options) {
    this._options = blocks.extend({
      root: '/'
    }, options);

    this._tryFixOrigin();

    this._initial = true;
    this._location = window.location;
    this._history = window.history;
    this._root = ('/' + this._options.root + '/').replace(rootStripper, '/');
    this._interval = 50;
    this._fragment = this._getFragment();
    this._wants = this._options.history === true ? HASH : this._options.history;
    this._use = this._wants == PUSH_STATE && (this._history && this._history.pushState) ? PUSH_STATE : HASH;
    this._hostRegEx = new RegExp(escapeRegEx(this._location.host));
  }

  History.prototype = {
    start: function () {
      var fragment = this._fragment;
      var docMode = document.documentMode;
      var oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      if (this._use == HASH && oldIE) {
        this._createIFrame();
        this.navigate(fragment);
      }

      this._initEvents(oldIE);
      if (!this._tryAdaptMechanism(fragment)) {
        this._loadUrl();
      }
    },

    navigate: function (fragment, options) {
      if (!options || options === true) {
        options = {
          trigger: !!options
        };
      }
      var url = this._root + (fragment = this._getFragment(fragment || ''));
      var use = this._use;
      var iframe = this._iframe;
      var location = this._location;

      fragment = fragment.replace(pathStripper, '');
      if (this._fragment === fragment) {
        return false;
      }
      this._fragment = fragment;
      if (fragment === '' && url !== '/') {
        url = url.slice(0, -1);
      }

      if (this._wants == PUSH_STATE && use == PUSH_STATE) {
        this._history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);
      } else if (use == HASH) {
        this._updateHash(location, fragment, options.replace);
        if (iframe && (fragment !== this.getFragment(this._getHash(iframe)))) {
          if (!options.replace) {
            iframe.document.open().close();
          }
          this._updateHash(iframe.location, fragment, options.replace);
        }
      } else {
        location.assign(url);
        return true;
      }

      return this._loadUrl(fragment);
    },

    _initEvents: function (oldIE) {
      var use = this._use;
      var onUrlChanged = blocks.bind(this._onUrlChanged, this);

      if (this._wants == PUSH_STATE) {
        addListener(document, 'click', blocks.bind(this._onDocumentClick, this));
      }

      if (use == PUSH_STATE) {
        addListener(window, 'popstate', onUrlChanged);
      } else if (use == HASH && !oldIE && ('onhashchange' in window)) {
        addListener(window, 'hashchange', onUrlChanged);
      } else if (use == HASH) {
        this._checkUrlInterval = setInterval(onUrlChanged, this._interval);
      }
    },

    _loadUrl: function (fragment) {
      var initial = this._initial;

      this._initial = false;
      this._fragment = fragment = this._getFragment(fragment);

      return Events.trigger(this, 'urlChange', {
        url: fragment,
        initial: initial
      });
    },

    _getHash: function (window) {
      var match = (window ? window.location : this._location).href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    _getFragment: function (fragment) {
      if (fragment == null) {
        if (this._use == PUSH_STATE) {
          var root = this._root.replace(trailingSlash, '');
          fragment = this._location.pathname;
          if (!fragment.indexOf(root)) {
            fragment = fragment.slice(root.length);
          }
        } else {
          fragment = this._getHash();
        }
      }
      return fragment.replace(this._location.origin, '').replace(routeStripper, '');
    },

    _onUrlChanged: function () {
      var current = this._getFragment();
      if (current === this._fragment && this._iframe) {
        current = this._getFragment(this._getHash(this._iframe));
      }
      if (current === this._fragment) {
        return false;
      }
      if (this._iframe) {
        this.navigate(current);
      }
      this._loadUrl();
    },

    _onDocumentClick: function (e) {
      var target = e.target;

      while (target) {
        if (target && target.tagName && target.tagName.toLowerCase() == 'a') {
          var download = target.getAttribute('download');
          var element;

          if (download !== '' && !download && this._hostRegEx.test(target.href) &&
            !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.which !== 2) {

            // handle click
            if (this.navigate(target.href)) {
              element = document.getElementById(window.location.hash.replace(/^#/, ''));
              if (element && element.scrollIntoView) {
                element.scrollIntoView();
              }
              e.preventDefault();
            }
          }

          break;
        }
        target = target.parentNode;
      }
    },

    _tryAdaptMechanism: function (fragment) {
      var root = this._root;
      var use = this._use;
      var location = this._location;
      var atRoot = location.pathname.replace(/[^\/]$/, '$&/') === root;

      this._fragment = fragment;
      if (this._wants == PUSH_STATE) {
        if (use != PUSH_STATE && !atRoot) {
          fragment = this._fragment = this._getFragment(null, true);
          location.replace(root + location.search + '#' + fragment);
          return true;
        } else if (use == PUSH_STATE && atRoot && location.hash) {
          this._fragment = this._getHash().replace(routeStripper, '');
          this._history.replaceState({}, document.title, root + fragment + location.search);
        }
      }
    },

    _updateHash: function (location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        location.hash = '#' + fragment;
      }
    },

    _createIFrame: function () {
      /* jshint scripturl: true */
      var iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = 'javascript:0';
      iframe.tabIndex = -1;
      document.body.appendChild(iframe);
      this._iframe = iframe.contentWindow;
    },

    _tryFixOrigin: function () {
      var location = window.location;
      if (!location.origin) {
        location.origin = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port: '');
      }
    }
  };

  Events.register(History.prototype, ['on']);

  /**
  * @namespace Collection
  */
  function Collection(ModelType, prototype, application, initialData) {
    return createCollectionObservable(ModelType, prototype, application, initialData);
  }

  blocks.observable.remote = function (options) {
    return createCollectionObservable(null, {
      options: options
    }, null, this.__value__);
  };

  function createCollectionObservable(ModelType, prototype, application, initialData) {
    var observable = blocks.observable([]).extend();
    var properties = Property.Inflate(prototype);
    var key;

    for (key in properties) {
      observable[key] = properties[key];
    }

    observable._baseUpdate = observable.update;
    blocks.each(blocks.observable.fn.collection, function (value, key) {
      if (blocks.isFunction(value) && key.indexOf('_') !== 0) {
        observable[key] = blocks.bind(observable[key], observable);
      }
    });
    blocks.extend(observable, blocks.observable.fn.collection, prototype);
    clonePrototype(prototype, observable);
    observable._Model = ModelType;
    observable._prototype = prototype;

    if (application) {
      observable._application = application;
      observable._view = application._initializingView;
      if (!prototype.options.baseUrl) {
        prototype.options.baseUrl = application.options.baseUrl;
      }
    }

    observable._dataSource = new DataSource(prototype.options);
    observable._dataSource.on('change', observable._onDataSourceChange, observable);
    observable.hasChanges = observable._dataSource.hasChanges;
    if (ModelType) {
      observable.on('adding', observable._onAdding, observable);
      observable.on('remove add', observable._onChange, observable);
    }

    if (blocks.isArray(initialData)) {
      observable.reset(initialData);
    }

    if (prototype.init) {
      prototype.init.call(observable);
    }

    return observable;
  }

  blocks.observable.fn.collection = {

    /**
     * Fires a request to the server to populate the Model based on the read URL specified
     *
     * @memberof Collection
     * @param {Object} [params] - The parameters Object that will be used to populate the
     * Collection from the specified options.read URL. If the URL does not contain parameters
     * @returns {Collection} - Chainable. Returns the Collection itself - return this;
     *
     * @example {javascript}
     * var App = blocks.Application();
     *
     * var Products = App.Collection({
     *   options: {
     *     read: {
     *       url: 'http://your-servrice-url/{{id}}'
     *     }
     *   }
     * });
     *
     * var products = Products().read({
     *   // the id that will be replaced in the above options.read URL
     *   id: 3
     * });
     */
    read: function (params, callback) {
      // TODO: Write tests for the callback checking if it is being called
      var context = this.__context__;

      if (blocks.isFunction(params)) {
        callback = params;
        params = undefined;
      }
      this._dataSource.read({
        data: params
      }, callback ? function () {
        callback.call(context);
      } : blocks.noop);

      return this;
    },

    /**
     * Clear all changes made to the collection
     *
     * @memberof Collection
     * @returns {Collection} Chainable. Returns this
     *
     * @example {javascript}
     * var App = blocks.Application();
     *
     * var Products = App.Collection({
     *
     * });
     *
     * App.View('Products', function () {
     *   products: Products(),
     *
     *   init: function () {
     *     this.products.push({
     *       ProductName: 'Fish'
     *     });
     *
     *     // -> this.products.length = 1
     *     this.products.clearChanges();
     *     // -> this.products.length = 0
     *   }
     * });
     */
    clearChanges: function () {
      this._dataSource.clearChanges();
      return this;
    },

    /**
     * Performs an ajax request for all create, update and delete operations in order to sync them
     * with a database.
     *
     * @memberof Collection
     * @returns {Collection} - Chainable. Returns the Collection itself - return this;
     *
     * @example {javascript}
     * var App = blocks.Application();
     * var Products = App.Collection({
     *   options: {
     *     create: {
     *       url: 'serviceURL/CreateProduct'
     *     }
     *   }
     * });
     *
     * App.View('Products', function () {
     *   products: Products(),
     *
     *   init: function () {
     *     this.products.push({
     *       ProductName: 'Fish'
     *     });
     *
     *     // sends AJAX request to the create.url with the new item
     *     this.products.sync();
     *   }
     * });
     */
    sync: function () {
      this._dataSource.sync();
      return this;
    },

    /**
     *
     *
     * @memberof Collection
     * @param {number} id -
     * @param {Object} newValues -
     * @returns {Collection} - Chainable. Returns the Collection itself - return this;
     */
    update: function (id, newValues) {
      if (arguments.length === 0) {
        this._baseUpdate.call(this);
      } else {
        this._dataSource.update(id, newValues);
      }
      return this;
    },

    sortBy: function (callback, thisArg) {
      if (typeof callback == 'string') {
        var fieldName = callback;
        callback = function (value) {
          return value[fieldName]();
        };
      }
      blocks.sortBy(this.__value__, callback, thisArg);
      return this;
    },

    clone: function () {
      return createCollectionObservable(this._Model, this._prototype, this._application, this.__value__);
    },

    // TODO: Add a test which adds to the center of the collection or the start
    // startIndex = args.index,
    _onAdding: function (args) {
      var _this = this;
      var ModelType = this._Model;
      var items = args.items;

      blocks.each(items, function (item, index) {
        if (Model.prototype.isPrototypeOf(item)) {
          item = item.dataItem();
        }
        items[index] = new ModelType(item, _this);
      });
    },

    _onChange: function (args) {
      var type = args.type;
      var items = args.items;
      var newItems = [];
      var i = 0;
      var item;

      for (; i < items.length; i++) {
        item = items[i];
        if (item && (type == 'remove' || (type == 'add' && item.isNew()))) {
          newItems.push(item.dataItem());
        }
      }

      if (type == 'remove') {
        this._dataSource.removeAt(args.index, args.items.length);
      } else if (type == 'add') {
        this._dataSource.add(newItems);
      }
    },

    _onDataSourceChange: function () {
      this.reset(this._dataSource.view());
      this.clearChanges();
      if (this._view) {
        this._view.trigger('ready');
      }
    }
  };

  /**
   * @namespace View
   */
  function View(application, parentView, prototype) {
    var _this = this;
    var options = this.options;
    var views = this._views = [];

    clonePrototype(prototype, this);

    this._application = application;
    this._parentView = parentView || null;
    this._initCalled = false;
    this._html = undefined;

    this.loading = blocks.observable(false);
    this.isActive = blocks.observable(!blocks.has(options, 'route'));
    this.isActive.on('changing', function (oldValue, newValue) {
      blocks.each(views, function (view) {
        if (!view.options.route) {
          view.isActive(newValue);
        }
      });
      _this._tryInitialize(newValue);
    });

    if (options.preload || this.isActive()) {
      this._load();
    }
  }

  View.prototype = {
    /**
     * Override the init method to perform actions when the View is first created
     * and shown on the page
     *
     * @memberof View
     * @type {Function}
     *
     * @example {javascript}
     * var App = blocks.Application();
     *
     * App.View('Statistics', {
     *   init: function () {
     *     this.loadRemoteData();
     *   },
     *
     *   loadRemoteData: function () {
     *     // ...stuff...
     *   }
     * });
     */
    init: blocks.noop,

    /**
     * Override the routed method to perform actions when the View have routing and routing
     * mechanism actives it.
     *
     * @memberof View
     * @type {Function}
     *
     *
     * @example {javascript}
     * var App = blocks.Application();
     *
     * App.View('ContactUs', {
     *   options: {
     *     route: 'contactus'
     *   },
     *
     *   routed: function () {
     *     alert('Navigated to ContactUs page!')
     *   }
     * });
     */
    routed: blocks.noop,

    parentView: function () {
      return this._parentView;
    },

    /**
     * Routes to a specific URL and actives the appropriate views associated with the URL
     *
     * @memberof View
     * @param {String} name -
     * @returns {View} - Chainable. Returns this
     *
     * @example {javascript}
     * var App = blocks.Application();
     *
     * App.View('ContactUs', {
     *   options: {
     *     route: 'contactus'
     *   }
     * });
     *
     * App.View('Navigation', {
     *   navigateToContactUs: function () {
     *     this.route('contactus')
     *   }
     * });
     */
    route: function (/* name */ /*, ...params */) {
      this._application._history.navigate(blocks.toArray(arguments).join('/'));
      return this;
    },

    navigateTo: function (view, params) {
      this._application.navigateTo(view, params);
    },

    _tryInitialize: function (isActive) {
      if (!this._initialized && isActive) {
        if (this.options.url && !this._html) {
          this._callInit();
          this._load();
        } else {
          this._initialized = true;
          this._application._initializingView = this;
          this._callInit();
          this._application._initializingView = null;
          if (this.isActive()) {
            this.isActive.update();
          }
        }
      }
    },

    _routed: function (params) {
      this._tryInitialize(true);
      this.routed(params);
      blocks.each(this._views, function (view) {
        if (view.isActive()) {
          view._routed(params);
        }
      });
      this.isActive(true);
    },

    _callInit: function () {
      if (this._initCalled) {
        return;
      }

      var key;
      var value;

      blocks.__viewInInitialize__ = this;
      for (key in this) {
        value = this[key];
        if (blocks.isObservable(value)) {
          value.__context__ = this;
        }
      }
      this.init();
      blocks.__viewInInitialize__ = undefined;
      this._initCalled = true;
    },

    _load: function () {
      var url = this.options.url;
      if (url && !this.loading()) {
        this.loading(true);
        ajax({
          url: url,
          success: blocks.bind(this._loaded, this),
          error: blocks.bind(this._error, this)
        });
      }
    },

    _loaded: function (html) {
      this._html = html;
      this._tryInitialize(true);
      this.loading(false);
    },

    _error: function () {
      this.loading(false);
    }
  };

  Events.register(View.prototype, ['on', 'off', 'trigger']);

  /* @if DEBUG */ {
    blocks.debug.addType('View', function (value) {
      if (value && View.prototype.isPrototypeOf(value)) {
        return true;
      }
      return false;
    });
  } /* @endif */



  var application;
  blocks.Application = function (options) {
    return (application = application || new Application(options));
  };

  blocks.core.deleteApplication = function () {
    application = undefined;
  };

  /**
   * [Application description]
   *
   * @namespace Application
   * @module mvc
   * @param {[type]} data -
   *
   * @example {javascript}
   */
  function Application(options) {
    this._router = new Router(this);
    this._modelPrototypes = {};
    this._collectionPrototypes = {};
    this._viewPrototypes = {};
    this._views = {};
    this._currentRoutedView = undefined;
    this._started = false;
    this.options = blocks.extend({}, this.options, options);
    this._serverData = null;

    this._setDefaults();

    this._prepare();
  }

  Application.prototype = {
    options: {
      history: true
    },

    // /**
    //  * An function that returns an observable determining if a particular View is active.
    //  * Conditions using the isViewActive
    //  *
    //  * @memberof Application
    //  * @param {string} viewName - The name of the view will be checked if it is active
    //  *
    //  * @example {html}
    //  */
    // isViewActive: function (viewName) {
    //   //#region blocks
    //   if (!this._started) {
    //     throw new Error('Application not started. Please start the application before using this method');
    //   }
    //
    //   if (!this._views[viewName]) {
    //     throw new Error('View with ' + viewName + ' name does not exists');
    //   }
    //   //#endregion
    //   return this._views[viewName].isActive;
    // },

    /**
     * Creates an application property for a Model
     *
     * @memberof Application
     * @param {Object)} property - An object describing the options for the current property
     *
     * @example {javascript}
     *
     * var App = blocks.Application();
     *
     * var User = App.Model({
     *   username: App.Property({
     *     defaultValue: 'JohnDoe'
     *   })
     * });
     */
    Property: function (property) {
      if (blocks.isString(property)) {
        return function () {
          return this[property]();
        };
      } else {
        property = blocks.extend({}, this.Property.Defaults(), property);
        property = new Property(property);

        return property;
      }
    },

    /**
    * Creates a new Model
    *
    * @memberof Application
    * @param {Object} prototype - the Model object properties that will be created
    * @returns {Model} - the Model type with the specified properties
    * @example {javascript}
    *
    * var App = blocks.Application();
    *
    * var User = App.Model({
    *  firstName: App.Property({
    *   required: true,
    *   validateOnChange: true
    *  }),
    *
    *  lastName: App.Property({
    *   required: true,
    *   validateOnChange: true
    *  }),
    *
    *  fullName: App.Property({
    *    value: function () {
    *      return this.firstName() + ' ' + this.lastName();
    *    }
    *  })
    * });
    *
    * App.View('Profile', {
    *  user: User({
    *    firstName: 'John',
    *    lastName: 'Doe'
    *  })
    * });
    *
    * @example {html}
    * <div data-query="view(Profile)">
    *   <h3>
    *     FullName is: {{user.fullName()}}
    *   </h3>
    * </div>
    *
    * <!-- will result in -->
    * <div data-query="view(Profile)">
    *   <h3>
    *     FullName is: John Doe
    *   </h3>
    * </div>
    */
    Model: function (prototype) {
      var _this = this;
      var ExtendedModel = function (dataItem, collection) {
        if (!Model.prototype.isPrototypeOf(this)) {
          return new ExtendedModel(dataItem, collection);
        }
        this._super([_this, prototype, dataItem, collection]);
      };

      prototype = prototype || {};
      prototype.options = prototype.options || {};

      return blocks.inherit(Model, ExtendedModel, prototype);
    },

    /**
    * Creates a new Collection
    *
    * @memberof Application
    * @param {Object} prototype - The Collection object properties that will be created.
    * @returns {Collection} - The Collection type with the specified properties
    * @example {javascript}
    *
    * var App = blocks.Application();
    *
    * var User = App.Model({
    *  firstName: App.Property({
    *   required: true,
    *   validateOnChange: true
    *  }),
    *
    *  lastName: App.Property({
    *   required: true,
    *   validateOnChange: true
    *  }),
    *
    *  fullName: App.Property({
    *    value: function () {
    *      return this.firstName() + ' ' + this.lastName();
    *    }
    *  })
    * });
    *
    * var Users = App.Collection(User, {
    *   count: App.Property({
    *     value: function () {
    *       return this().lenght;
    *     }
    *   })
    * });
    *
    * App.View('Profiles', {
    *  users: Users([{
    *     firstName: 'John',
    *     lastName: 'Doe'
    *   }, {
    *     firstName: 'Johna',
    *     lastName: 'Doa'
    *   }])
    * });
    *
    * @example {html}
    * <div data-query="view(Profiles)">
    *   <h2>Total count is {{users.count}}</h2>
    *   <ul data-query="each(users)">
    *     <li>
    *       FullName is: {{fullName()}}
    *     </li>
    *   </ul>
    * </div>
    *
    * <!-- will result in -->
    * <div data-query="view(Profiles)">
    *   <h2>Total count is 2</h2>
    *   <ul data-query="each(users)">
    *     <li>
    *       FullName is: John Doe
    *     </li>
    *     <li>
    *       FullName is: Johna Doa
    *     </li>
    *   </ul>
    * </div>
    */
    Collection: function (ModelType, prototype) {
      var _this = this;
      var ExtendedCollection = function (initialData) {
        if (!Collection.prototype.isPrototypeOf(this)) {
          return new ExtendedCollection(initialData);
        }
        return this._super([ModelType, prototype, _this, initialData]);
      };

      if (!ModelType) {
        ModelType = this.Model();
      } else if (!Model.prototype.isPrototypeOf(ModelType.prototype)) {
        prototype = ModelType;
        ModelType = this.Model();
      }
      prototype = prototype || {};
      prototype.options = prototype.options || {};

      return blocks.inherit(Collection, ExtendedCollection, prototype);
    },

    /**
     * Defines a view that will be part of the Application
     *
     * @memberof Application
     * @param {string} name -
     * @param {Object} prototype -
     *
     * @example {javascript}
     *
     * var App = blocks.Application();
     *
     * App.View('Clicker', {
     *   handleClick: function () {
     *     alert('Clicky! Click!');
     *   }
     * });
     *
     * @example {html}
     *
     * <div data-query="view(Clicker)">
     *   <h3><a href="#" data-query="click(handleClick)">Click here!</a></h3>
     * </div>
     */
    View: function (name, prototype, nestedViewPrototype) {
      // TODO: Validate prototype by checking if a property does not override a proto method
      // if the prototype[propertyName] Type eqals the proto[propertyName] Type do not throw error
      if (arguments.length == 1) {
        return this._views[name];
      }
      if (blocks.isString(prototype)) {
        this._viewPrototypes[prototype] = this._createView(nestedViewPrototype);
        nestedViewPrototype.options.parentView = name;
      } else {
        this._viewPrototypes[name] = this._createView(prototype);
      }
    },

    extend: function (obj) {
      blocks.extend(this, obj);
      clonePrototype(obj, this);
      return this;
    },

    navigateTo: function (view, params) {
      if (!view.options.route) {
        return false;
      }
      this._history.navigate(this._router.routeTo(view.options.routeName, params));
      return true;
    },

    /**
     * Starts the application by preparing the application and calling blocks.query() method
     * to execute all data-query attributes and render the HTML output
     *
     * @memberof Application
     * @param {HTMLElement} [element=document.body] - Optional element that will be used for the root of the
     * Application. If not specified the document.body will be used
     *
     * @example {javascript}
     * var App = blocks.Application();
     *
     * App.helloWorldMessage = 'Hello World!';
     *
     * @example {html}
     * <h1>{{helloWorldMessage}}</h1>
     */
    start: function (element) {
      if (!this._started) {
        this._started = true;
        this._createViews();
        if (document.__mock__ && window.__mock__) {
          this._ready(element);
        } else {
          blocks.domReady(blocks.bind(this._ready, this, element));
        }
      }
    },

    _prepare: function () {
      blocks.domReady(function () {
        setTimeout(blocks.bind(function () {
          this.start();
        }, this));
      }, this);
    },

    _ready: function (element) {
      this._serverData = window.__blocksServerData__;
      this._history = new History(this.options);
      this._history
          .on('urlChange', blocks.bind(this._urlChange, this))
          .start();
      blocks.query(this, element);
    },

    _urlChange: function (data) {
      var _this = this;
      var currentView = this._currentView;
      var routes = this._router.routeFrom(data.url);
      var found = false;

      blocks.each(routes, function (route) {
        blocks.each(_this._views, function (view) {
          if (view.options.routeName == route.id) {
            if (!currentView && (view.options.initialPreload ||
              (data.initial && _this._serverData && _this.options.history == 'pushState'))) {
              view.options.url = undefined;
            }
            if (currentView && currentView != view) {
              currentView.isActive(false);
            }
            view._routed(route.params);
            _this._currentView = view;
            found = true;
            return false;
          }
        });
        if (found) {
          return false;
        }
      });

      if (!found && currentView) {
        currentView.isActive(false);
      }

      return found;
    },

    _createView: function (prototype) {
      prototype.options = blocks.extend({}, this.View.Defaults(), prototype.options);
      // if (prototype.options.route) {
      //   prototype.options.routeName = this._router.registerRoute(prototype.options.route);
      // }

      return blocks.inherit(View, function (application, parentView) {
        this._super([application, parentView, prototype]);
      }, prototype);
    },

    _createViews: function () {
      var viewPrototypePairs = blocks.pairs(this._viewPrototypes);
      var views = this._views;
      var viewsInOrder = [];
      var pair;
      var View;
      var parentViewName;
      var currentView;
      var i = 0;

      while (viewPrototypePairs.length !== 0) {
        for (; i < viewPrototypePairs.length; i++) {
          pair = viewPrototypePairs[i];
          View = pair.value;
          parentViewName = View.prototype.options.parentView;
          if (parentViewName) {
            //#region blocks
            if (!this._viewPrototypes[parentViewName]) {
              viewPrototypePairs.splice(i, 1);
              i--;
              throw new Error('View with ' + parentViewName + 'does not exist');
              //TODO: Throw critical error parentView with such name does not exists
            }
            //#endregion
            if (views[parentViewName]) {
              currentView = new View(this, views[parentViewName]);
              views[parentViewName][pair.key] = currentView;
              views[parentViewName]._views.push(currentView);
              if (!currentView.parentView().isActive()) {
                currentView.isActive(false);
              }
              viewPrototypePairs.splice(i, 1);
              i--;
            }
          } else {
            currentView = new View(this);
            this[pair.key] = currentView;
            viewPrototypePairs.splice(i, 1);
            i--;
            parentViewName = undefined;
          }

          if (currentView) {
            if (blocks.has(currentView.options, 'route')) {
              currentView.options.routeName = this._router.registerRoute(
                currentView.options.route, this._getParentRouteName(currentView));
            }
            views[pair.key] = currentView;
            viewsInOrder.push(currentView);
          }
        }
      }

      for (i = 0; i < viewsInOrder.length; i++) {
        viewsInOrder[i]._tryInitialize(viewsInOrder[i].isActive());
      }

      this._viewPrototypes = undefined;
    },

    _getParentRouteName: function (view) {
      while (view) {
        if (view.options.routeName) {
          return view.options.routeName;
        }
        view = view.parentView();
      }
    },

    _setDefaults: function () {
      this.Model.Defaults = blocks.observable({
        options: {}
      }).extend();
      this.Collection.Defaults = blocks.observable({
        options: {}
      }).extend();
      this.Property.Defaults = blocks.observable({
        isObservable: true,

        // defaultValue: undefined,
        // field: NULL,
        // changing: NULL,
        // change: NULL,
        // value: NULL, // value:function () { this.FirstName + this.LastName }

        validateOnChange: false,
        maxErrors: 1,
        validateInitially: false
      }).extend();
      this.View.Defaults = blocks.observable({
        options: {
          // haveHistory: false
        }
      }).extend();
    }
  };





})();// @source-code
  })();

  (function() {
    var toString = blocks.toString;
    blocks.toString = function(value) {
      if (arguments.length === 0) {
        return 'jsblocks - better MV-ish framework';
      }
      return toString(value);
    };
  })();

  var _blocks = global.blocks;

  blocks.noConflict = function (deep) {
    if (global.blocks === blocks) {
      global.blocks = _blocks;
    }

    if (deep && global.blocks === blocks) {
      global.blocks = _blocks;
    }

    return blocks;
  };

  if (typeof define === 'function' && define.amd) {
    define('blocks', [], function () {
      return blocks;
    });
  }

  if (noGlobal !== true) {
    global.blocks = blocks;
  }

  return blocks;

}));
