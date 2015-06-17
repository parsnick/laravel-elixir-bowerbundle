
var Package = require('../src/Package');
var fs = require('fs');

describe('Package', function () {

    beforeEach(function () {
        Package.configure({});
    });

    it('uses a factory method to create package instances', function () {
        expect(Package.factory('packageName')).toEqual(jasmine.any(Package));
    });

    it('reads its metadata from bower.json', function () {
        var bowerJsonContent = {
            main: ["example.js"],
            dependencies: {
                "jquery": "~2.0"
            }
        };
        spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify(bowerJsonContent));
        var myPackage = Package.factory('example');

        myPackage.loadBowerJson();

        expect(fs.readFileSync).toHaveBeenCalled();
        expect(myPackage.main).toEqual(bowerJsonContent.main);
        expect(myPackage.dependencies).toEqual(bowerJsonContent.dependencies);
    });

    it('accepts an override for its main files', function () {
        var mainOverride = ['dist/test.js', 'dist/test.css'];
        var myPackage = Package.factory('test', { main: mainOverride });

        expect(myPackage.main).toEqual(mainOverride);
    });

    it('accepts an override for its dependencies', function () {
        var depenciesOverride = {
            angular: "*",
            jquery: "~2.0"
        };
        var myPackage = Package.factory('test', { dependencies: depenciesOverride });

        expect(myPackage.dependencies).toEqual(depenciesOverride);
    });

    it('can use a global overrides object, such as from the project root\s bower.json', function () {
        Package.configure({
            test: {
                main: 'defined_by_root_config.js'
            }
        });

        expect(Package.factory('test').main).toBe('defined_by_root_config.js');
    });

    it('returns an array of its main files as relative paths from bower_components directory', function () {
        Package.configure({
            test: {
                main: 'dist/main.js',
                dependencies: ['my_dependency']
            }
        });
        spyOn(fs, 'readFileSync').and.returnValue('{}');

        expect(Package.factory('test').files()).toEqual([
            'test/dist/main.js'
        ]);
    });
});