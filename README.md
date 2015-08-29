# Dynamic Columns Helper

This library provides functionality to convert a JSON schema into a SQL
Query part, called dynamic columns. Currently this is only interesting
together with MariaDB.

As MariaDB doesn't support array types, as of the 29th September 2015,
we don't handle arrays explicitly and just store them by their index, as the
specified key.
When extracting arrays back from a database, you going to receive an object
instead. You should be easily able to handle this, if you mind this little
fact.

MariaDBs dynamic columns are created by `COLUMN_CREATE` and you can
manipulate the created column with the methods like `COLUMN_ADD`, to add,
update and delete columns. This library returns the JSON schema transposed
to the matching `COLUMN_CREATE(...)` SQL query string.

This library gets useless, as soon as MariaDB supports parsing JSON, but
until we finally have this feature, this library will help you.

# API

### Important

We handle numbers by default as double, booleans as unsigned integer
and everything else as string.
If you need or want to specify the types, you can set the second parameter to
call the type defined variant instead.

## createQuery: ( json, typeSpecification )

A non recursive way to resolve our json schema to the create query.

### Parameters
* json - Your input schema
* typeSpecficiation - trigger the type defined version

### Example

```javascript
var dyncol = require('dyncol');

var schema = {
  user: {
    uuid: 122
    name: 'test'
  },
  activated: true
};

var sql = 'INSERT INTO `user` (`data`) VALUES (' +
  dyncol.createQuery( schema ) + ')';
```

## updateQuery: ( inputColumn, json, typeSpecification )

A non recursive way to resolve our json schema to the update query.

### Parameters
* inputColumn - the column containing the current dynamic column
* json - Your input schema
* typeSpecficiation - trigger the type defined version

### Example

```javascript
var dyncol = require('dyncol');

var schema = {
  user: {
    uuid: 122
    name: 'test'
  },
  activated: true
};

var sql = 'UPDATE `user` SET `data` = ' +
  dyncol.updateQuery( 'data', schema ) + ')';
```

# Example of Complex schema

To give you an example of a complex schema and how the result looks like, you
can view the following input and result. You will see, especially the update
query is quite complex and long, due to the nesting of elements.

## JSON create Input

```javascript
test.createQuery( {
  test: 'test',
  qr: {
    test: 'tester',
    rofl: {
      jaja: 'neinnein',
      testagain: {
        yip: 'datworks'
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
} );
```

## Query create Output

```SQL
COLUMN_CREATE (
	'test',
	'test',
	'arrayone',
	COLUMN_CREAT
),
 'arr',
 COLUMN_CREATE (
	'0',
	'arr',
	'1',
	'imma pirate'
),
 '2',
 COLUMN_CREATE ('yay', 'ditworks'),
 'another',
 COLUMN_CREATE ('one', 'yey another one!'),
 'qr',
 COLUMN_CREATE ('test', 'tester'),
 'rofl',
 COLUMN_CREATE ('jaja', 'neinnein'),
 'testagain',
 COLUMN_CREATE ('yip', 'datworks')
)
```

## JSON update Input

```javascript
test.updateQuery( 'test', {
  test: 'test',
  qr: {
    test: 'tester',
    rofl: {
      jaja: 'neinnein',
      testagain: {
        yip: 'datworks'
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
} );
```

## Query update Output

```SQL
COLUMN_ADD (
	`test`,
	'test',
	'test',
	'arrayone',
	COLUMN_ADD (
		COLUMN_GET (`test`, 'arrayone' AS CHAR),
		'arr',
		COLUMN_ADD (
			COLUMN_GET (
				COLUMN_GET (`test`, 'arrayone' AS CHAR),
				'arr' AS CHAR
			),
			'0',
			'arr',
			'1',
			'imma pirate',
			'2',
			COLUMN_ADD (
				COLUMN_GET (
					COLUMN_GET (
						COLUMN_GET (`test`, 'arrayone' AS CHAR),
						'arr' AS CHAR
					),
					'2' AS CHAR
				),
				'yay',
				'ditworks'
			)
		)
	),
	'another',
	COLUMN_ADD (
		COLUMN_GET (`test`, 'another' AS CHAR),
		'one',
		'yey another one!'
	),
	'qr',
	COLUMN_ADD (
		COLUMN_GET (`test`, 'qr' AS CHAR),
		'test',
		'tester',
		'rofl',
		COLUMN_ADD (
			COLUMN_GET (
				COLUMN_GET (`test`, 'qr' AS CHAR),
				'rofl' AS CHAR
			),
			'jaja',
			'neinnein',
			'testagain',
			COLUMN_ADD (
				COLUMN_GET (
					COLUMN_GET (
						COLUMN_GET (`test`, 'qr' AS CHAR),
						'rofl' AS CHAR
					),
					'testagain' AS CHAR
				),
				'yip',
				'datworks'
			)
		)
	)
)
```