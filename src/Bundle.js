
var path = require('path');
var _ = require('lodash');

var Package = require('./Package');

module.exports = (function () {

    /**
     * Bundle constructor
     * @param {string} name
     * @param {array}  packages  list of packages to include
     * @param {string} outputDir
     */
    function Bundle(name, packages, outputDir)
    {
        this.name      = name;
        this.packages  = packages;
        this.outputDir = outputDir;
    };

    /**
     * Create a new Bundle instance
     * @param  {string} name
     * @param  {array}  packages
     * @param  {string} outputDir
     * @param  {object} packageOverrides
     * @return {Bundle}
     */
    Bundle.factory = function (name, packages, outputDir, packageOverrides)
    {
        if ( ! name) throw new Error('Bundle must have a name');

        var packages         = packages || [];
        var packageOverrides = packageOverrides || {};

        return new Bundle(
            name,
            packages.map(function (name) {
                return Package.factory(name, packageOverrides[name] || {});
            }),
            outputDir
        );
    };

    /**
     * List all the files needed for this bundle.
     * @param  {string} pathPrefix optional prefix for file paths
     * @return {array}
     */
    Bundle.prototype.files = function (pathPrefix)
    {
        return _(this.packages)
            .map(function (package) {
                return package.files();
            })
            .flatten()
            .unique()
            .map(function (file) {
                if (pathPrefix) return path.join(pathPrefix, file);
                return file;
            })
            .value();
    };

    return Bundle;

})();