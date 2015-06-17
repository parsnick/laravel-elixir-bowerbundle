var fs = require('fs');
var path = require('path');
var bower = require('bower');
var _ = require('lodash');

module.exports = (function (undefined) {

    var globalOverrides = {};

    /**
     * Constructor for Packages
     * @param {string} name         package name
     * @param {array}  main         list of "main" files
     * @param {array}  dependencies list of dependencies
     */
    function Package (name, main, dependencies)
    {
        this.name         = name;
        this.main         = main;
        this.dependencies = dependencies;
    };

    /**
     * Configure with a root overrides config, e.g. from bower.json.
     *
     * {
     *   "test": {
     *     "main": "/different/main.js",
     *     "dependencies": []
     *   },
     *   "jquery": {
     *     "main": [
     *       "dist/jquery.js",
     *       "dist/jquery.migrate.js"
     *     ]
     *   }
     * }
     *
     * @param  {object} overrides
     * @return {void}
     */
    Package.configure = function (overrides)
    {
        globalOverrides = overrides;
    }

    /**
     * Create a new Package instance
     * @param  {string} name
     * @param  {object} overrides
     * @return {Package}
     */
    Package.factory = function (name, overrides)
    {
        var overrides = overrides || globalOverrides[name] || {};

        return new Package(name, overrides.main, overrides.dependencies);
    };

    /**
     * Get all files in this package relative to the bower_components directory.
     * @return {array}
     */
    Package.prototype.files = function()
    {
        this.loadBowerJson();

        if (typeof this.main === 'string') {
            this.main = [this.main];
        }

        return this.main.map(function (file) {
            return this.name + '/' + file;
        }, this);
    };

    /**
     * Load "main" and "dependencies" properties from the package's bower.json
     * @return {void}
     */
    Package.prototype.loadBowerJson = function()
    {
        if (this.bowerJson === undefined) {
            this.bowerJson = readBowerJson(this.name);
        }

        if (this.main === undefined) {
            this.main = this.bowerJson.main || [];
        }

        if (this.dependencies === undefined) {
            this.dependencies = this.bowerJson.dependencies || [];
        }
    };

    return Package;

    /**
     * Reads the bower.json config file for the named package.
     * @param  {string} name
     * @return {object} parsed JSON
     * @throws {Error} If package is not installed
     */
    function readBowerJson (name)
    {
        return JSON.parse(
            fs.readFileSync(
                path.join(bower.config.cwd, bower.config.directory, name, 'bower.json')
            )
        );
    }

})();