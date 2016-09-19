/**
  * This library provides functionality to convert a JSON schema into a SQL
  * Query part, called dynamic columns. Currently this is only interesting
  * together with MariaDB.
  *
  * As MariaDB doesn't support array types, as of the 29th September 2015,
  * we don't handle arrays explicitly and just store them by their index, as the
  * specified key.
  * When extracting arrays back from a database, you going to receive an object
  * instead. You should be easily able to handle this, if you mind this little
  * fact.
  *
  * MariaDBs dynamic columns are created by `COLUMN_CREATE` and you can
  * manipulate the created column with the methods like `COLUMN_ADD`, to add,
  * update and delete columns. This library returns the JSON schema transposed
  * to the matching `COLUMN_CREATE(...)` SQL query string.
  *
  * This library gets useless, as soon as MariaDB supports parsing JSON, but
  * until we finally have this feature, this library will help you.
  */

module.exports = {

  /**
    * A non recursive way to resolve our json schema to the create query.
    *
    * We handle Numbers by default as double, booleans as unsigned integer
    * and everything else as string.
    *
    * If you need or want to specify the types, you can set the second parameter
    * to call the type defined variant instead.
    *
    * @return string
    */
  createQuery: function( json, typeSpecification, array ) {

      var keys,
          current = json,
          nested = [],
          nestedKeys = [],
          levels = [],
          query = 'COLUMN_CREATE(',
          root = true,
          curNest = '',
          curItem,
          item = 0,
          level = 0;

    while( current ) {

      keys = Object.keys( current );
      var len = keys.length;
      var _l;
      var deepestLevel = 1;

      for( var i = 0; i < len; ++i ) {

        if( ( _l = current[ keys[ i ] ] ) === null || _l === undefined ) {
          continue;
        }

        if( typeof( _l ) === 'object' ) {

          // skip empty objects, we do not store them,
          // this needs us to set NULL instead
          if( !Object.keys( _l ).length ) {

            _l = null;
            if( !typeSpecification ) {
              query += '\'' + keys[ i ].replace(/\\/g, '\\\\')
                .replace(/\u0008/g, '\\b')
                .replace(/'/g, '\\\'')
                .replace(/\u0000/g, '\\0') + '\', NULL, ';
            }
            else {
              query += '?, NULL, ';
              array.push( keys[ i ] );
            }

            continue;
          }

          nested.push( _l );
          nestedKeys.push( keys[ i ] );
          if ( curItem !== item ) {
              curItem = item;
              ++level;

              levels.push( { level: level - 1, nestSep: curNest + ')' } );
          }
          else {
            levels.push( { level: level - 1, nestSep: ')' } );
          }

          //save nesting level
        }
        else {

          var queryType = typeof( _l );
          if( !typeSpecification ) {
            query += '\'' + keys[ i ].replace(/\\/g, '\\\\')
              .replace(/\u0008/g, '\\b')
              .replace(/'/g, '\\\'')
              .replace(/\u0000/g, '\\0') + '\', ';
          }
          else {
            query += '?, ';
            array.push( keys[ i ] );
          }

          switch( queryType ) {

            case 'boolean':
              query += ( ( _l === true ) ? 1 : 0 ) + ' AS unsigned integer, ';
              break;

            case 'number':
              query += _l + ' AS double, ';
              break;

            default:

              if( !typeSpecification ) {

                query += '\'' + _l.replace(/\\/g, '\\\\')
                .replace(/\u0008/g, '\\b')
                .replace(/'/g, '\\\'')
                .replace(/\u0000/g, '\\0') + '\', ';
              }
              else {
                query += '?, ';
                array.push( _l );
              }
              break;
          }
        }
      }

      if( root ) {

        root = false;
      }
      else {

        if( level === 0 )
          query = query.substring( 0, query.length - 2 ) + curNest + ', ';
      }

      if( nested.length !== 0 ) {

        if( !typeSpecification ) {
          query += '\'' + nestedKeys.pop().replace(/\\/g, '\\\\')
            .replace(/\u0008/g, '\\b')
            .replace(/'/g, '\\\'')
            .replace(/\u0000/g, '\\0') + '\', COLUMN_CREATE(';
        }
        else {
          query += '?, COLUMN_CREATE(';
          array.push( nestedKeys.pop() );
        }
      }
      else {
        query = query.substring( 0, query.length - 2 );
      }

      current = nested.pop();
      ++item;

      //restore nesting level
      level = levels.pop() || 0;
      if ( level ) {

        curNest = level.nestSep;
        level = level.level;
      }

      deepestLevel = level + 1;
    }

    query += ')';

    return query;
  },

  /**
    * We create out of specified schema a update query for dynamic columns.
    * Queries can get quite complex on complex schemas.
    *
    * @return string
    */
  updateQuery: function( inputColumn, json, typeSpecification ) {

      var keys,
          current = json,
          nested = [],
          nestedKeys = [],
          nestedString = [],
          levels = [],
          query = 'COLUMN_ADD(`' + inputColumn + '`, ',
          root = true,
          accessString = 'COLUMN_GET(',
          baseString = 'COLUMN_GET(`' + inputColumn + '`, ',
          curString = baseString,
          curNest = '',
          item = 0,
          level = 0;

    while( current ) {

      keys = Object.keys( current );
      var len = keys.length;
      var _l;
      var curItem = undefined;

      for( var i = 0; i < len; ++i ) {

        if( ( _l = current[ keys[ i ] ] ) !== null &&
            _l !== undefined &&
            typeof( _l )  === 'object' ) {

          nested.push( _l );
          nestedKeys.push( keys[ i ] );
          if( root ) {

            nestedString.push( curString + '\'' + keys[ i ].replace(/\\/g, '\\\\')
              .replace(/\u0008/g, '\\b')
              .replace(/'/g, '\\\'')
              .replace(/\u0000/g, '\\0') +
              '\' AS CHAR), ');
          }
          else {

            nestedString.push( accessString + curString + '\'' + keys[ i ].replace(/\\/g, '\\\\')
              .replace(/\u0008/g, '\\b')
              .replace(/'/g, '\\\'')
              .replace(/\u0000/g, '\\0') +
              '\' AS CHAR), ');
          }

          if ( curItem !== item ) {
              curItem = item;
              ++level;
          }

          //save nesting level
          levels.push( { level: level - 1, nestSep: curNest + ')' } );
        }
        else {

          var queryType = typeof( _l );

          if( _l === null || _l === undefined )
            _l = 'NULL';

          query += '\'' + keys[ i ].replace(/\\/g, '\\\\')
            .replace(/\u0008/g, '\\b')
            .replace(/'/g, '\\\'')
            .replace(/\u0000/g, '\\0') + '\', ';

          switch( queryType ) {

            case 'boolean':
              query += ( ( _l === true ) ? 1 : 0 ) + ' AS unsigned integer, ';
              break;

            case 'number':
              query += _l + ' AS double, ';
              break;

            default:
              query += '\'' + _l.replace('\'', '\\\'')
                .replace(/\u0000/g, '\\0') + '\', ';
              break;
          }
        }
      }

      curString = nestedString.pop();

      if( root ) {

        root = false;
      }
      else {

        if( level === 0 )
          query = query.substring( 0, query.length - 2 ) + curNest + ', ';
      }

      if( nested.length !== 0 ) {
        query += '\'' + nestedKeys.pop().replace(/\\/g, '\\\\')
          .replace(/\u0008/g, '\\b')
          .replace(/'/g, '\\\'')
          .replace(/\u0000/g, '\\0') + '\', COLUMN_ADD(' + curString;
      }
      else {
        query = query.substring( 0, query.length - 2 );
      }

      current = nested.pop();
      ++item;

      //restore nesting level
      level = levels.pop() || 0;
      if ( level ) {

        curNest = level.nestSep;
        level = level.level;
      }
    }

    query += ')';

    return query;
  }
};
