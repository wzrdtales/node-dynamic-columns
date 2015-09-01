var test = require('./lib/index.js');

console.log(test.updateQuery( 'testTable', {
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
    }],
    yes: 12355
  }
}));
console.log( typeof( false ) );
