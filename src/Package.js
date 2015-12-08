var fs = require('fs');
var path = require('path');

module.exports = (function () {

    var globalOverrides = {};

    /**
     * Constructor for Package
     *
     * @param {string} name
     */
    function Package(name)
    {
        var dotBowerJson = Package._readBowerJson(name) || {};
        var overrides = globalOverrides[name] || {};

        this.name         = name;
        this.installed    = !! dotBowerJson.name;
        this.main         = overrides.main || dotBowerJson.main || [];
        this.dependencies = overrides.dependencies || dotBowerJson.dependencies || [];
    };

    /**
     * @type {string} path to installed bower packages
     */
    Package.baseDir = 'bower_components';

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
     * @param  {string} baseDir
     * @return {void}
     */
    Package.configure = function (overrides, baseDir)
    {
        globalOverrides = overrides;
        if (baseDir) Package.baseDir = baseDir;
    }

    /**
     * Get the filesystem path to a package file or directory.
     *
     * @param {string} file
     * @return {string}
     */
    Package.prototype.path = function (file)
    {
        return path.join(Package.baseDir, this.name, file || '.');
    };

    /**
     * Get all files in this package.
     *
     * @return {array}
     */
    Package.prototype.files = function ()
    {
        if (typeof this.main === 'string') {
            this.main = [this.main];
        }

        return this.main.map(function (file) {
            return this.name + '/' + file;
        }, this);
    };

    /**
     * Reads the bower.json config file for the named package.
     *
     * @param  {string} name
     * @return {object} parsed JSON
     */
    Package._readBowerJson = function (name)
    {
        try {
            return JSON.parse(
                fs.readFileSync(
                    path.join(Package.baseDir, name, '.bower.json')
                )
            );
        }
        catch (error) {
            return {};
        }
    }

    return Package;

})();