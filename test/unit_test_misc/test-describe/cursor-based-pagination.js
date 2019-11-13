module.exports.connection_book_schema = `
type BookConnection{
  edges: [BookEdge]
  pageInfo: pageInfo!
}

type BookEdge{
  cursor: String!
  node: Book!
}
`

module.exports.connection_book_query = `
booksConnection(search: searchBookInput, order: [orderBookInput], pagination: paginationCursorInput): BookConnection
`

module.exports.model_read_all_connection = `
static readAllCursor(search, order, pagination){
  let options = {};
  options['where'] = {};
  if (search !== undefined) {
      let arg = new searchArg(search);
      let arg_sequelize = arg.toSequelize();
      options['where'] = arg_sequelize;
  }

  return super.count(options).then( items =>{
    options['offset'] = 0;
    options['order'] = [];

    if (order !== undefined) {
        options['order'] = order.map((orderItem) => {
            return [orderItem.field, orderItem.order];
        });
    }

    if( !options['order'].map( orderItem=>{return orderItem[0] }).includes("id") ){
        options['order'] = [ ...options['order'], ...[ ["id", "ASC"] ]];
    }

    if(pagination!== undefined && pagination.cursor ){
        let decoded_cursor = JSON.parse(this.base64Decode(pagination.cursor));
        options['where'] = {...options['where'], ...helper.parseOrderCursor(options['order'], decoded_cursor) } ;
    }

    options['limit'] = (pagination !== undefined && pagination.first!==undefined) ? pagination.first : items;


    if (globals.LIMIT_RECORDS < options['limit']) {
        throw new Error(\`Request of total books exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
    }
    return super.findAll(options).then( records =>{
      let edges = records.map( record=>{ return {
        node: record,
        cursor: record.base64Enconde()
      }})
      let last = options.limit;
      delete options.limit;
      let pageInfo = {
        hasNextPage: super.count(options).then(num =>{return num > last}),
        endCursor: edges[ edges.length - 1 ].cursor
      }

      return {
        edges,
        pageInfo
      };
    }).catch(error =>{
      console.log(error)
    });

  });

}

`

module.exports.resolver_read_all_connection = `
/**
 * booksConnection - Check user authorization and return certain number, specified in pagination argument, of records that
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
booksConnection: function({
    search,
    order,
    pagination
}, context) {
  return checkAuthorization(context, 'Book', 'read').then(authorization => {
      if (authorization === true) {
          return book.readAllCursor(search, order, pagination);
      } else {
          return new Error("You don't have authorization to perform this action");
      }
  }).catch(error => {
      handleError(error);
  })
}
`

module.exports.schema_to_many_association = `
"""
@search-request
"""
booksConnection(search: searchBookInput, order: [ orderBookInput ], pagination: paginationCursorInput): BookConnection

`

module.exports.resolver_to_many_association = `
/**
 * person.prototype.booksConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
person.prototype.booksConnection = function({
    search,
    order,
    pagination
}, context) {

    return this.booksConnectionImpl({
        search,
        order,
        pagination
    });
}
`

module.exports.model_many_to_many_association =`
booksConnectionImpl({
    search,
    order,
    pagination
}) {

    let options = {};
    options['where'] = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countBooks(options).then(items => {

      options['offset'] = 0;
      options['order'] = [];

        if (order !== undefined) {
            options['order'] = order.map((orderItem) => {
                return [orderItem.field, orderItem.order];
            });
        }

        if( !options['order'].map( orderItem=>{return orderItem[0] }).includes("id") ){
            options['order'] = [ ...options['order'], ...[ ["id", "ASC"] ]];
        }

        if (pagination !== undefined && pagination.cursor) {

            let decoded_cursor = JSON.parse(this.base64Decode(pagination.cursor));
            options['where'] = {...options['where'], ...helper.parseOrderCursor(options['order'], decoded_cursor) } ;
        }

        options['limit'] = (pagination !== undefined && pagination.first!==undefined) ? pagination.first : items;

        if (globals.LIMIT_RECORDS < options['limit']) {
            throw new Error(\`Request of total booksFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getBooks(options).then( records =>{
          let edges = [];
          let pageInfo = {
            hasNextPage: false,
            endCursor: null
          }

          if(records){
           edges = records.map(record=>{ return {
              node: record,
              cursor: record.base64Enconde()
            }});
            let last = options.limit;
            delete options.limit;
            delete options.order;
             pageInfo = {
              hasNextPage: this.countBooks(options).then(num =>{return num > last}),
              endCursor:  edges[edges.length - 1].cursor
            }
          }
            return {
              edges,
              pageInfo
            };
        }).catch(error =>{
          throw error;
        });
    });
}


`
