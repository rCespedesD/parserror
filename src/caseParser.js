const Utils = require('./utils');
/**
 * @typedef {Object} CaseParserType
 * @description A simple object to check what kind of parser it's.
 * @property {Boolean} map      Whether or not the parser is an `object` map.
 * @property {Boolean} function Whether or not the parser is a `function`.
 */

/**
 * A parser an error cases can use to format a value extracted from an error.
 */
class CaseParser {
  /**
   * @param {String}          name    The name of the parser.
   * @param {function|Object} parser  A function to parse a value or an `object` to map the value to
   *                                  something else.
   * @throws {TypeError} If the `name` is not a `string`.
   * @throws {TypeError} If the `parser` is not a `function` nor an `object`.
   * @throws {Error}     If the `parser` is an empty `object`.
   */
  constructor(name, parser) {
    /**
     * The name of the parser.
     * @type {String}
     * @access protected
     * @ignore
     */
    this._name = this._validateName(name);
    /**
     * If the parser is a map, this is where the object will be stored.
     * @type {?Object}
     * @access protected
     * @ignore
     */
    this._map = null;
    /**
     * If the parser is a function, this is where the function will be saved.
     * @type {?function}
     * @access protected
     * @ignore
     */
    this._function = null;
    /**
     * An object with properties to validate the parser type.
     * @type {CaseParserType}
     * @access protected
     * @ignore
     */
    this._parserType = this._validateParserType(parser);

    if (this._parserType.map) {
      /**
       * @ignore
       */
      this._map = parser;
    } else {
      /**
       * @ignore
       */
      this._function = parser;
    }
  }
  /**
   * Parse a value with the class parser.
   * If the parser is a map and the value is an object with a `raw` property, which means it comes
   * from another map parser, instead of generating a new value, the parser will merge the new
   * value in top of the previous one.
   * @param {*} value The value to parse.
   * @return {*} The result of the parsing.
   */
  parse(value) {
    let result;
    if (this.is.map) {
      const extend = Utils.isObject(value) && typeof value.raw !== 'undefined';
      const useValue = extend ? value.raw : value;
      if (this._map[useValue]) {
        if (extend) {
          result = Object.assign({}, value, this._map[useValue]);
        } else {
          result = Object.assign({ raw: useValue }, this._map[useValue]);
        }
      }
    } else {
      result = this._function(value);
    }

    return result || value;
  }
  /**
   * An object with properties to validate the parser type.
   * @type {CaseParserType}
   */
  get is() {
    return this._parserType;
  }
  /**
   * The name of the parser.
   * @type {String}
   */
  get name() {
    return this._name;
  }
  /**
   * Validate the name of the parser.
   * @param {String} name The name the class intends to use.
   * @throws {TypeError} If the `name` is not a `string`.
   * @access protected
   * @ignore
   */
  _validateName(name) {
    if (typeof name !== 'string') {
      throw new TypeError('The \'name\' can only be a \'string\'');
    }

    return name;
  }
  /**
   * Validate the parser and generated an object with flags for the type.
   * @param {function|Object} parser The parser the class intends to save.
   * @return {CaseParserType}
   * @throws {TypeError} If the parser is not a `function` nor an `object`.
   * @throws {Error}     If the `parser` is an empty `object`.
   * @access protected
   * @ignore
   */
  _validateParserType(parser) {
    const result = {
      map: false,
      function: false,
    };
    const isObject = Utils.isObject(parser);
    if (isObject) {
      const mapKeys = Object.keys(parser);
      if (mapKeys.length) {
        result.map = true;
      } else {
        throw new Error(
          `'${this._name}': the parser is empty. It should include at least one item to map`
        );
      }
    } else if (typeof parser === 'function') {
      result.function = true;
    } else {
      throw new TypeError(
        `'${this._name}': the 'parser' parameter can only be a 'string' ` +
        'or a \'function\''
      );
    }

    return result;
  }
}

module.exports = CaseParser;
