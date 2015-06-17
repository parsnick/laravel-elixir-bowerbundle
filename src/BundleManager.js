
var fs = require('fs');

var Bundle = require('./Bundle');

module.exports = (function () {

    /**
     * @constructor
     */
    function BundleManager(bowerJson)
    {
        this.bundles   = [];
        this.bowerJson = bowerJson || this.getBowerJson();
    };

    /**
     * Reads bower.json config
     * @type {function}
     */
    BundleManager.prototype.getBowerJson = function () {
        try {
            return JSON.parse(fs.readFileSync('bower.json'));
        } catch (error) {
            return {};
            // Allowed to fail silently because a bower.json file is not
            // required for programmatically defined bundles
        }
    };

    /**
     * Factory for creating bundles.
     * @type {function}
     */
    BundleManager.prototype.factory = Bundle.factory;

    /**
     * Add a bundle from the given arguments.
     * @param {string} name
     * @param {array}  packages
     * @param {string} outputDir
     * @return {this}
     */
    BundleManager.prototype.add = function (name, packages, outputDir)
    {
        this.bundles.push(
            this.factory(name, packages, outputDir, this.bowerJson.overrides)
        );

        return this;
    };

    /**
     * Add a bundle configured by bower.json "bundles" property.
     * @param  {string} name
     * @param  {string} outputDir
     * @return {this}
     */
    BundleManager.prototype.addNamed = function (name, outputDir)
    {
        return this.add(name, this.packagesFor(name), outputDir);
    };

    /**
     * Add bundles for all configurations in the bower.json file.
     * @param  {string} outputDir
     * @return {this}
     */
    BundleManager.prototype.addAll = function (outputDir)
    {
        if ( ! this.bowerJson.bundles) return this;

        Object.keys(this.bowerJson.bundles).forEach(function (name) {
            return this.add(name, this.packagesFor(name), outputDir);
        }, this);

        return this;
    };

    /**
     * List the packages required by the named bundle.
     * @param  {string} name
     * @return {array}
     * @throws {Error} If "bundles" property in bower.json is undefined
     * @throws {Error} If "bundles[name]" is undefined
     */
    BundleManager.prototype.packagesFor = function (name)
    {
        if ( ! this.bowerJson.bundles)
            throw new Error('No "bundles" property configured in bower.json');
        if ( ! this.bowerJson.bundles[name])
            throw new Error('No "' + name + '" bundle configured in bower.json');

        return this.bowerJson.bundles[name];
    };

    return BundleManager;
})();