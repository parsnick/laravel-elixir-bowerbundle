
var BundleManager = require('../src/BundleManager');
var Bundle = require('../src/Bundle');
var Package = require('../src/Package');
var fs = require('fs');

describe('Bundle manager', function () {

    var bundleManager;
    var dummyBowerJson = { overrides: {} };
    var dummyBundleInstance = { name: 'example', packages: [] };

    beforeEach(function () {
        bundleManager = new BundleManager({});
    });

    it('accepts a bower.json config object', function () {
        bundleManager = new BundleManager(dummyBowerJson);
        expect(bundleManager.bowerJson).toBe(dummyBowerJson);
    });

    it('reads the root bower.json if none explicitly provided', function () {
        spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify(dummyBowerJson));
        expect(new BundleManager().bowerJson).toEqual(dummyBowerJson);
    });

    it('adds a programmatically defined bundle', function () {
        bundleManager.add('libs', ['package_name'], 'public/vendor');
        expect(bundleManager.bundles).toContain(jasmine.objectContaining({
            name: 'libs',
            packages: [jasmine.objectContaining({
                name: 'package_name'
            })],
            outputDir: 'public/vendor'
        }));
    });

    it('adds a named bundle', function () {
        var bundleManager = new BundleManager({
            bundles: {
                libs: ['jquery']
            }
        });
        bundleManager.addNamed('libs');
        expect(bundleManager.bundles).toContain(jasmine.objectContaining({
            name: 'libs',
            packages: [jasmine.objectContaining({
                name: 'jquery'
            })]
        }));
    });

    it('throws if the named bundle is not defined in bower.json "bundles"', function () {
        expect(function () {
            bundleManager.addNamed('libs');
        }).toThrow();
    });

    it('adds all bundles from the bower.json config', function () {
        var rootBowerJson = {
            bundles: {
                main:    ['jquery'],
                plugins: ['jquery-plugin-one', 'plugin-two'],
                admin:   ['d3'],
            }
        };
        var bundleManager = new BundleManager(rootBowerJson);

        bundleManager.addAll();

        expect(bundleManager.bundles.length).toBe(3);
        expect(bundleManager.bundles[0]).toEqual(
            new Bundle('main', [ new Package('jquery') ])
        );
        expect(bundleManager.bundles[1]).toEqual(
            new Bundle('plugins', [ new Package('jquery-plugin-one'), new Package('plugin-two') ])
        );
        expect(bundleManager.bundles[2]).toEqual(
            new Bundle('admin', [ new Package('d3') ])
        );
    });

    it('returns the manager object to allow method chaining', function () {
        expect(bundleManager.addAll()).toEqual(bundleManager);
    });

});