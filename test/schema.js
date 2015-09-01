
var dyncol = require( '../lib/index.js' ),
    Code = require( 'code' ),
    Lab = require( 'lab' ),
    lab = exports.lab = Lab.script();

var tests = [
  "COLUMN_CREATE('test', 'test', 'arrayone', COLUMN_CREATE('arr', " +
  "COLUMN_CREATE('0', 'arr', '1', 'imma pirate', '2', COLUMN_CREATE('yay', " +
  "'ditworks'))), 'another', COLUMN_CREATE('one', 'yey another one!'), " +
  "'qr', COLUMN_CREATE('test', 'tester', 'rofl', COLUMN_CREATE('jaja', " +
  "'neinnein', 'testagain', COLUMN_CREATE('yip', 'datworks', 'boolean', 1 " +
  "AS unsigned integer))))",

  "COLUMN_ADD(`testTable`, 'test', 'test', 'arrayone', " +
  "COLUMN_ADD(COLUMN_GET(`testTable`, 'arrayone' AS BLOB), 'arr', " +
  "COLUMN_ADD(COLUMN_GET(COLUMN_GET(`testTable`, 'arrayone' AS BLOB), 'arr' " +
  "AS BLOB), '0', 'arr', '1', 'imma pirate', '2', " +
  "COLUMN_ADD(COLUMN_GET(COLUMN_GET(COLUMN_GET(`testTable`, 'arrayone' " +
  "AS BLOB), 'arr' AS BLOB), '2' AS BLOB), 'yay', 'ditworks'))), 'another', " +
  "COLUMN_ADD(COLUMN_GET(`testTable`, 'another' AS BLOB), 'one', " +
  "'yey another one!'), 'qr', COLUMN_ADD(COLUMN_GET(`testTable`, 'qr' " +
  "AS BLOB), 'test', 'tester', 'rofl', " +
  "COLUMN_ADD(COLUMN_GET(COLUMN_GET(`testTable`, 'qr' AS BLOB), 'rofl' " +
  "AS BLOB), 'jaja', 'neinnein', 'testagain', " +
  "COLUMN_ADD(COLUMN_GET(COLUMN_GET(COLUMN_GET(`testTable`, 'qr' AS BLOB), " +
  "'rofl' AS BLOB), 'testagain' AS BLOB), 'yip', 'datworks', 'boolean', 1 " +
  "AS unsigned integer))))"


];

lab.experiment( 'schema/', { parallel: false }, function () {

  lab.experiment( 'create',
  {
      parallel: true
  }, function () {

    lab.test( 'returns true if the nested schema query was correctly builded',
        {
            parallel: true
        }, function ( done )
        {

            Code.expect( dyncol.createQuery( {
              test: 'test',
              qr: {
                test: 'tester',
                rofl: {
                  jaja: 'neinnein',
                  testagain: {
                    yip: 'datworks',
                    boolean: true
                  }
                }
              },
              another: {
                one: 'yey another one!'
              },
              arrayone: {
                arr: [ 'arr', 'imma pirate', {
                  yay: 'ditworks'
                }]
              }
            } ) ).equal( tests[0] );

            done();
        } );

    lab.test( 'returns true if the nested update query was correctly builded',
        {
            parallel: true
        }, function ( done )
        {

            Code.expect( dyncol.updateQuery( 'testTable', {
              test: 'test',
              qr: {
                test: 'tester',
                rofl: {
                  jaja: 'neinnein',
                  testagain: {
                    yip: 'datworks',
                    boolean: true
                  }
                }
              },
              another: {
                one: 'yey another one!'
              },
              arrayone: {
                arr: [ 'arr', 'imma pirate', {
                  yay: 'ditworks'
                }]
              }
            } ) ).equal( tests[1] );

            done();
        } );
  } );
} );
