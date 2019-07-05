module.exports.count_in_sequelize_model = `
static countRecords(search){
  let options = {};
  if (search !== undefined) {
      let arg = new searchArg(search);
      let arg_sequelize = arg.toSequelize();
      options['where'] = arg_sequelize;
  }
  return super.count(options);
}
`

module.exports.count_in_webservice_model = `
static countRecords(search){

  /*
  YOUR CODE GOES HERE
  */
  throw new Error('countPubli_shers is not implemented');
}
`

module.exports.count_in_resolvers = `
/**
 * countDogs - Count number of records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} Search argument for filtering records
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {number}          Number of records that holds the conditions specified in the search argument
 */
countDogs: function({
    search
}, context) {
    return checkAuthorization(context, 'Dog', 'read').then(authorization => {
        if (authorization === true) {
            return dog.countRecords(search);
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}
`
module.exports.read_all = `
static readAll(search, order, pagination){
  let options = {};
  if (search !== undefined) {
      let arg = new searchArg(search);
      let arg_sequelize = arg.toSequelize();
      options['where'] = arg_sequelize;
  }

  return super.count(options).then(items => {
      if (order !== undefined) {
          options['order'] = order.map((orderItem) => {
              return [orderItem.field, orderItem.order];
          });
      } else if (pagination !== undefined) {
          options['order'] = [
              ["id", "ASC"]
          ];
      }

      if (pagination !== undefined) {
          options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
          options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
      } else {
          options['offset'] = 0;
          options['limit'] = items;
      }

      if (globals.LIMIT_RECORDS < options['limit']) {
          throw new Error(\`Request of total dogs exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
      }
      return super.findAll(options);
  });
}

`

module.exports.read_all_resolver = `
/**
 * dogs - Check user authorization and return certain number, specified in pagination argument, of records that
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records holding conditions specified by search, order and pagination argument
 */
dogs: function({
    search,
    order,
    pagination
}, context) {
    return checkAuthorization(context, 'Dog', 'read').then(authorization => {
        if (authorization === true) {
            return dog.readAll(search, order, pagination);
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}
`

module.exports.add_one_model = `
static addOne(input){
  return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
      .then((valSuccess) => {
          return super.create(input)
              .then(item => {
                  if (input.addAuthors) {
                      super.setAuthors(input.addAuthors);
                  }
                  return item;
              });
      }).catch((err) => {
          return err
      })
}
`

module.exports.add_one_resolver = `
/**
 * addBook - Check user authorization and creates a new record with data specified in the input argument
 *
 * @param  {object} input   Info of each field to create the new record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {object}         New record created
 */
addBook: function(input, context) {
    return checkAuthorization(context, 'Book', 'create').then(authorization => {
        if (authorization === true) {

          return book.addOne(input);
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}
`

module.exports.delete_one_model = `
static deleteOne(id){
  return super.findByPk(id)
      .then(item => {

          if (item === null) return new Error(\`Record with ID = \${id} not exist\`);

          return validatorUtil.ifHasValidatorFunctionInvoke('validateForDelete', this, item)
              .then((valSuccess) => {
                  return item
                      .destroy()
                      .then(() => {
                          return 'Item successfully deleted';
                      });
              }).catch((err) => {
                  return err
              })
      });

}
`
module.exports.delete_one_resolver = `
/**
 * deleteBook - Check user authorization and delete a record with the specified id in the id argument.
 *
 * @param  {number} {id}    Id of the record to delete
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {string}         Message indicating if deletion was successfull.
 */
deleteBook: function({
    id
}, context) {
    return checkAuthorization(context, 'Book', 'delete').then(authorization => {
        if (authorization === true) {
          return book.deleteOne(id);
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}
`
