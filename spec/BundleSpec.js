
var Bundle = require('./../src/Bundle');
var Package = require('./../src/Package');

describe('Bundle', function () {

    it('contains any number of packages', function () {

        var bundle = new Bundle(['package1', 'package2']);

        expect(bundle.packages.length).toBe(2);
        expect(bundle.packages[0]).toEqual(new Package('package1'));
        expect(bundle.packages[1]).toEqual(new Package('package2'))
    });

    describe('files', function () {

        var bundle;

        beforeEach(function () {
            bundle = new Bundle(['package1', 'package2', 'package3']);

            spyOn(bundle.packages[0], 'files').and.returnValue(['file1.js', 'file2.css']);
            spyOn(bundle.packages[1], 'files').and.returnValue(['file3.js', 'file4.png']);
            spyOn(bundle.packages[2], 'files').and.returnValue(['file5.css']);
        });


        it('lists all the files required by its combined packages', function () {
            expect(bundle.files()).toEqual(['file1.js', 'file2.css', 'file3.js', 'file4.png', 'file5.css']);
        });

        it('can filter to list only CSS files', function () {
            expect(bundle.css()).toEqual(['file2.css', 'file5.css']);
        });

        it('can filter to list only JS files', function () {
            expect(bundle.js()).toEqual(['file1.js', 'file3.js']);
        });

        it('can filter to list only non-JS and non-CSS files', function () {
            expect(bundle.misc()).toEqual(['file4.png']);
        });
    });

});