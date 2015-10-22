
var path = require('path');
var _ = require('lodash');

var Package = require('./Package');

module.exports = (function () {

    /**
     * Bundle constructor
     * @param {array}  packages  list of packages to include
     * @param {string} name      optional name for the bundle
     */
    function Bundle(packages, name)
    {
        this.packages = _.map(packages, function (package) {

            if (_.isString(package)) {
                return new Package(package);
            }

            return package;
        });
        this.name = name || 'bundle';
    };

    /**
     * List all the files needed for this bundle.
     *
     * @deprecated use .all() instead
     * @return {array}
     */
    Bundle.prototype.files = function ()
    {
        return this.all();
    };

    /**
     * List all the files needed for this bundle.
     *
     * @return {array}
     */
    Bundle.prototype.all = function ()
    {
        return _(this.packages)
            .map(function (package) {
                return package.files();
            })
            .flatten()
            .unique()
            .value();
    };

    /**
     * List all the CSS files needed for this bundle.
     *
     * @return {array}
     */
    Bundle.prototype.css = function()
    {
        return this.files().filter(function (file) {
            return _.endsWith(file, '.css');
        });
    };

    /**
     * List all the JS files needed for this bundle.
     *
     * @return {array}
     */
    Bundle.prototype.js = function()
    {
        return this.files().filter(function (file) {
            return _.endsWith(file, '.js');
        });
    };

    /**
     * List all the non-CSS and non-JS files needed for this bundle.
     *
     * @return {array}
     */
    Bundle.prototype.misc = function()
    {
        return _.difference(this.all(), this.css(), this.js());
    };

    return Bundle;

})();