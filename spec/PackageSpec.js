
var Package = require('../src/Package');
var fs = require('fs');

describe('Package', function () {

    beforeEach(function () {
        Package.baseDir = 'vendor/bower_components';
        Package.configure({});
    });

    it('returns path to package on filesystem', function () {
        expect(new Package('test').path()).toBe('vendor/bower_components/test');
    });

    it('returns an array of its main files as relative paths from bower_components directory', function () {

        spyOn(fs, 'readFileSync').and.returnValue('{"main":"dist/main.js"}');

        expect(new Package('test').files()).toEqual([
            'test/dist/main.js'
        ]);
    });

    it('reads its metadata from .bower.json', function () {
        var bowerJsonContent = {
            main: ["example.js"],
            dependencies: {
                "jquery": "~2.0"
            }
        };
        spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify(bowerJsonContent));

        var myPackage = new Package('example');

        expect(fs.readFileSync).toHaveBeenCalledWith('vendor/bower_components/example/.bower.json');
        expect(myPackage.main).toEqual(bowerJsonContent.main);
        expect(myPackage.dependencies).toEqual(bowerJsonContent.dependencies);
    });

    it('can use a global overrides object, such as from the project root\s bower.json', function () {
        Package.configure({
            test: {
                main: 'defined_by_root_config.js'
            }
        });

        expect(new Package('test').main).toBe('defined_by_root_config.js');
    });

});