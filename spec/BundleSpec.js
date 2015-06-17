
var Bundle = require('../src/Bundle');
var Package = require('../src/Package');

describe('Bundle', function () {

    it('requires a bundle name', function () {
        expect(Bundle.factory).toThrow();

        expect(function () { return new Bundle.factory('named'); }).not.toThrow();
    });

    it('contains any number of packages', function () {
        var packages = ['jquery', 'angular'];

        spyOn(Package, 'factory').and.returnValue({});

        expect(Bundle.factory('test', packages).packages.length).toBe(2);

        expect(Package.factory).toHaveBeenCalledWith('jquery', {});
        expect(Package.factory).toHaveBeenCalledWith('angular', {});
    });

    it('lists all the files required by its combined packages', function () {

        var packageTwo   = new Package('two');
        var packageOne   = new Package('one');

        spyOn(packageOne, 'files').and.returnValue(['one.js']);
        spyOn(packageTwo, 'files').and.returnValue(['three.js', 'three.css', 'one.js', 'two.js']);

        var bundle = new Bundle('name', [
            packageOne,
            packageTwo,
        ]);

        expect(bundle.files()).toEqual(['one.js', 'three.js', 'three.css', 'two.js']);
    });

});