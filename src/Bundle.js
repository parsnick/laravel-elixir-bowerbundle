
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
     * @return {array}
     */
    Bundle.prototype.files = function ()
    {
        return _(this.packages)
            .map(function (package) {
                return package.files();
            })
            .flatten()
            .unique()
            .value();
    };

    return Bundle;

})();