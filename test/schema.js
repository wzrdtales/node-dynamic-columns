
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
  "AS unsigned integer, 'emtpyone', NULL))))",

  "COLUMN_ADD(`testTable`, 'test', 'test', 'arrayone', " +
  "COLUMN_ADD(COLUMN_GET(`testTable`, 'arrayone' AS CHAR), 'arr', " +
  "COLUMN_ADD(COLUMN_GET(COLUMN_GET(`testTable`, 'arrayone' AS CHAR), 'arr' " +
  "AS CHAR), '0', 'arr', '1', 'imma pirate', '2', " +
  "COLUMN_ADD(COLUMN_GET(COLUMN_GET(COLUMN_GET(`testTable`, 'arrayone' " +
  "AS CHAR), 'arr' AS CHAR), '2' AS CHAR), 'yay', 'ditworks'))), 'another', " +
  "COLUMN_ADD(COLUMN_GET(`testTable`, 'another' AS CHAR), 'one', " +
  "'yey another one!'), 'qr', COLUMN_ADD(COLUMN_GET(`testTable`, 'qr' " +
  "AS CHAR), 'test', 'tester', 'rofl', " +
  "COLUMN_ADD(COLUMN_GET(COLUMN_GET(`testTable`, 'qr' AS CHAR), 'rofl' " +
  "AS CHAR), 'jaja', 'neinnein', 'testagain', " +
  "COLUMN_ADD(COLUMN_GET(COLUMN_GET(COLUMN_GET(`testTable`, 'qr' AS CHAR), " +
  "'rofl' AS CHAR), 'testagain' AS CHAR), 'yip', 'datworks', 'boolean', 1 " +
  "AS unsigned integer))))",

  "COLUMN_CREATE('test', 1 AS unsigned integer)",
  "COLUMN_CREATE('test', 12 AS double)",
  "COLUMN_CREATE('test', 'string')",

  "COLUMN_CREATE('test', COLUMN_CREATE('0', 1 AS double, '1', " +
  "1 AS unsigned integer, '2', 'string'))",

  "COLUMN_ADD(`testTable`, 'test', 1 AS unsigned integer)",
  "COLUMN_ADD(`testTable`, 'test', 12 AS double)",
  "COLUMN_ADD(`testTable`, 'test', 'string')",

  "COLUMN_ADD(`testTable`, 'test', " +
  "COLUMN_ADD(COLUMN_GET(`testTable`, 'test' AS CHAR), '0', 1 AS double, " +
  "'1', 1 AS unsigned integer, '2', 'string'))",

  "COLUMN_CREATE('test', 0 AS unsigned integer)",
  "COLUMN_ADD(`testTable`, 'test', 0 AS unsigned integer)",

  "COLUMN_ADD(`testTable`, 'test', 'test', 'meisnull', 'NULL', " +
  "'eq', COLUMN_ADD(COLUMN_GET(`testTable`, 'eq' AS CHAR), " +
  "'somenullvalue', 'NULL'))",

  "COLUMN_CREATE('test', 'test', 'other', " +
  "COLUMN_CREATE('nothinginhere', NULL))",

  "COLUMN_CREATE(?, ?, ?, COLUMN_CREATE(?, NULL))",
  [ 'test', 'test', 'other', 'nothinginhere' ]

];

lab.experiment( 'schema/', { parallel: true }, function () {

  lab.experiment( 'create',
  {
      parallel: true
  }, function () {

    lab.test( 'returns true if the emtpy nested schema was correctly builded',
        {
            parallel: true
        }, function ( done )
        {
            Code.expect( dyncol.createQuery( {
              test: 'test',
              other: {
                nothinginhere: []
              }
            } ) ).equal( tests[13] );

            done();
        } );

    lab.test( 'returns true if the emtpy nested schema was correctly builded',
        {
            parallel: true
        }, function ( done )
        {
          var array = [];

            Code.expect( dyncol.createQuery( {
              test: 'test',
              other: {
                nothinginhere: []
              }
            }, true, array ) ).equal( tests[14] );

            Code.expect( array ).deep.equal( tests[15] );

            done();
        } );

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
                    boolean: true,
                    emtpyone: []
                  },
                  somenullvalue: null
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

    lab.test( 'returns true if boolean builds as unsigned int 1',
        {
            parallel: true
        }, function ( done )
        {
            Code.expect( dyncol.createQuery( { test: true } ) )
              .equal( tests[2] );

            done();
        } );

    lab.test( 'returns true if boolean builds as unsigned int 0',
        {
            parallel: true
        }, function ( done )
        {
            Code.expect( dyncol.createQuery( { test: false } ) )
              .equal( tests[10] );

            done();
        } );

    lab.test( 'returns true if number builds as double',
        {
            parallel: true
        }, function ( done )
        {
            Code.expect( dyncol.createQuery( { test: 12 } ) )
              .equal( tests[3] );

            done();
        } );

    lab.test( 'returns true if string builds as nothing',
        {
            parallel: true
        }, function ( done )
        {
            Code.expect( dyncol.createQuery( { test: 'string' } ) )
              .equal( tests[4] );

            done();
        } );

    lab.test( 'returns true if string builds as nothing',
        {
            parallel: true
        }, function ( done )
        {
            Code.expect( dyncol.createQuery( { test: [ 1, true, 'string' ] } ) )
              .equal( tests[5] );

            done();
        } );
  } );

  lab.experiment( 'create',
  {
      parallel: true
  }, function () {

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

        lab.test( 'returns true if null values are build correctly',
        {
          parallel: true
        }, function ( done )
        {

          Code.expect( dyncol.updateQuery( 'testTable', {
            test: 'test',
            eq: {
              somenullvalue: undefined
            },
            meisnull: null
          } ) ).equal( tests[12] );

          done();
        } );
    } );


    lab.test( 'returns true if boolean builds as unsigned int 1',
        {
            parallel: true
        }, function ( done )
        {
            Code.expect( dyncol.updateQuery( 'testTable',
              { test: true } ) ).equal( tests[6] );

            done();
        } );


    lab.test( 'returns true if boolean builds as unsigned int 0',
        {
            parallel: true
        }, function ( done )
        {
            Code.expect( dyncol.updateQuery( 'testTable',
              { test: false } ) ).equal( tests[11] );

            done();
        } );

    lab.test( 'returns true if number builds as double',
        {
            parallel: true
        }, function ( done )
        {
            Code.expect( dyncol.updateQuery( 'testTable',
              { test: 12 } ) ).equal( tests[7] );

            done();
        } );

    lab.test( 'returns true if string builds as nothing',
        {
            parallel: true
        }, function ( done )
        {
            Code.expect( dyncol.updateQuery( 'testTable',
              { test: 'string' } ) ).equal( tests[8] );

            done();
        } );

    lab.test( 'returns true if string builds as nothing',
        {
            parallel: true
        }, function ( done )
        {
            Code.expect( dyncol.updateQuery( 'testTable',
              { test: [ 1, true, 'string' ] } ) ).equal( tests[9] );

            done();
        } );
} );
