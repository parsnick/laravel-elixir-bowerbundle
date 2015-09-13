
var Bundle = require('../src/Bundle');
var Package = require('../src/Package');

describe('Bundle', function () {

    it('contains any number of packages', function () {

        var bundle = new Bundle(['package1', 'package2']);

        expect(bundle.packages.length).toBe(2);
        expect(bundle.packages[0]).toEqual(new Package('package1'));
        expect(bundle.packages[1]).toEqual(new Package('package2'))
    });

    it('lists all the files required by its combined packages', function () {

        var bundle = new Bundle(['package1', 'package2']);

        spyOn(bundle.packages[0], 'files').and.returnValue(['file1.js']);
        spyOn(bundle.packages[1], 'files').and.returnValue(['file2.js']);

        expect(bundle.files()).toEqual(['file1.js', 'file2.js']);
    });

});