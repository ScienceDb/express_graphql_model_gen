module.exports.transcript_countSchema = `
  module.exports = \`
  type transcript_count  {
    id: ID
      gene: String
      variable: String
      count: Float
      tissue_or_condition: String
        individual: individual
    }

  type VueTableTranscript_count{
    data : [transcript_count]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum transcript_countField {
    id
    gene
    variable
    count
    tissue_or_condition
  }

  input searchTranscript_countInput {
    field: transcript_countField
    value: typeValue
    operator: Operator
    search: [searchTranscript_countInput]
  }

  input orderTranscript_countInput{
    field: transcript_countField
    order: Order
  }

  type Query {
    transcript_counts(search: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationInput ): [transcript_count]
    readOneTranscript_count(id: ID!): transcript_count
    countTranscript_counts(search: searchTranscript_countInput ): Int
    vueTableTranscript_count : VueTableTranscript_count  }

  type Mutation {
    addTranscript_count( gene: String, variable: String, count: Float, tissue_or_condition: String, individual_id: Int   ): transcript_count
    deleteTranscript_count(id: ID!): String!
    updateTranscript_count(id: ID!, gene: String, variable: String, count: Float, tissue_or_condition: String, individual_id: Int  ): transcript_count!
    bulkAddTranscript_countXlsx: [transcript_count]
    bulkAddTranscript_countCsv: [transcript_count]
}
  \`;
`

module.exports.individualResolvers = `
/*
    Resolvers for basic CRUD operations
*/

const individual = require('../models/index').individual;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')


individual.prototype.transcript_countsFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countTranscript_counts(options).then(items => {
        if (order !== undefined) {
            options['order'] = order.map((orderItem) => {
                return [orderItem.field, orderItem.order];
            });
        }

        if (pagination !== undefined) {
            options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
            options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
        } else {
            options['offset'] = 0;
            options['limit'] = items;
        }

        if (globals.LIMIT_RECORDS < options['limit']) {
            throw new Error(\`Request of total transcript_countsFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getTranscript_counts(options);
    }).catch(error => {
        console.log("Catched the error in transcript_countsFilter ", error);
        return error;
    });
}

individual.prototype.countFilteredTranscript_counts = function({search},context){
  let options = {};

  if (search !== undefined) {
      let arg = new searchArg(search);
      let arg_sequelize = arg.toSequelize();
      options['where'] = arg_sequelize;
  }
  return this.countTranscript_counts(options);
}

module.exports = {

    individuals: function({
        search,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'individuals', 'read') == true) {
            let options = {};
            if (search !== undefined) {
                let arg = new searchArg(search);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return individual.count(options).then(items => {
                if (order !== undefined) {
                    options['order'] = order.map((orderItem) => {
                        return [orderItem.field, orderItem.order];
                    });
                }

                if (pagination !== undefined) {
                    options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                    options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
                } else {
                    options['offset'] = 0;
                    options['limit'] = items;
                }

                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total individuals exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }
                return individual.findAll(options);
            }).catch(error => {
                console.log("Catched the error in individuals ", error);
                return error;
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOneIndividual: function({
        id
    }, context) {
        if (checkAuthorization(context, 'individuals', 'read') == true) {
            return individual.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addIndividual: function(input, context) {
        if (checkAuthorization(context, 'individuals', 'create') == true) {
            return individual.create(input)
                .then(individual => {
                    if (input.addTranscript_counts) {
                        individual.setTranscript_counts(input.addTranscript_counts);
                    }
                    return individual;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddIndividualXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return individual.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddIndividualCsv: function(_, context) {
      delim = context.request.body.delim;
      cols = context.request.body.cols;
      tmpFile = path.join(__dirname, uuidv4()+'.csv')
      return context.request.files.csv_file.mv(tmpFile).then(() => {
        return fileTools.parseCsvStream(tmpFile, individual, delim, cols)
      }).catch((err) => {
        return new Error(err);
      }).then(() => {
        fs.unlinkSync(tmpFile)
      })
    },

    deleteIndividual: function({
        id
    }, context) {
        if (checkAuthorization(context, 'individuals', 'delete') == true) {
            return individual.findById(id)
                .then(individual => {
                    return individual.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updateIndividual: function(input, context) {
        if (checkAuthorization(context, 'individuals', 'update') == true) {
            return individual.findById(input.id)
                .then(individual => {
                  if (input.addTranscript_counts) {
                      individual.addTranscript_counts(input.addTranscript_counts);
                  }
                  if (input.removeTranscript_counts) {
                      individual.removeTranscript_counts(input.removeTranscript_counts);
                  }
                    return individual.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    countIndividuals: function({search}, context){
      let options = {};
      if (search !== undefined) {
          let arg = new searchArg(search);
          let arg_sequelize = arg.toSequelize();
          options['where'] = arg_sequelize;
      }
      return individual.count(options);
    },

    vueTableIndividual: function(_, context) {
        if (checkAuthorization(context, 'individuals', 'read') == true) {
            return helper.vueTable(context.request, individual, ["id", "name"]);
        } else {
            return "You don't have authorization to perform this action";
        }
    }
}
`

module.exports.individualModel = `
'use strict';

const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    var individual = sequelize.define('individual', {

        name: {
            type: Sequelize.STRING
        }
    });

    individual.associate = function(models) {
        individual.hasMany(models.transcript_count, {
            foreignKey: 'individual_id'
        });
    };

    return individual;
};
`

module.exports.transcript_count_no_assoc_schema = `
module.exports = \`
  type transcript_count  {
      id: ID
      gene: String
      variable: String
      count: Float
      tissue_or_condition: String
      }

    type VueTableTranscript_count{
      data : [transcript_count]
      total: Int
      per_page: Int
      current_page: Int
      last_page: Int
      prev_page_url: String
      next_page_url: String
      from: Int
      to: Int
    }

  enum transcript_countField {
    id
    gene
    variable
    count
    tissue_or_condition
  }

  input searchTranscript_countInput {
    field: transcript_countField
    value: typeValue
    operator: Operator
    search: [searchTranscript_countInput]
  }

  input orderTranscript_countInput{
    field: transcript_countField
    order: Order
  }

  type Query {
    transcript_counts(search: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationInput ): [transcript_count]
    readOneTranscript_count(id: ID!): transcript_count
    countTranscript_counts(search: searchTranscript_countInput ): Int
    vueTableTranscript_count : VueTableTranscript_count
  }

    type Mutation {
    addTranscript_count( gene: String, variable: String, count: Float, tissue_or_condition: String ): transcript_count
    deleteTranscript_count(id: ID!): String!
    updateTranscript_count(id: ID!, gene: String, variable: String, count: Float, tissue_or_condition: String): transcript_count!
    bulkAddTranscript_countXlsx: [transcript_count]
    bulkAddTranscript_countCsv: [transcript_count]
}
  \`;
`

module.exports.individual_no_assoc_resolvers = `
/*
    Resolvers for basic CRUD operations
*/

const individual = require('../models/index').individual;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')

module.exports = {

    individuals: function({
        search,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'individuals', 'read') == true) {
            let options = {};
            if (search !== undefined) {
                let arg = new searchArg(search);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return individual.count(options).then(items => {
                if (order !== undefined) {
                    options['order'] = order.map((orderItem) => {
                        return [orderItem.field, orderItem.order];
                    });
                }

                if (pagination !== undefined) {
                    options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                    options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
                } else {
                    options['offset'] = 0;
                    options['limit'] = items;
                }

                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total individuals exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }
                return individual.findAll(options);
            }).catch(error => {
                console.log("Catched the error in individuals ", error);
                return error;
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOneIndividual: function({
        id
    }, context) {
        if (checkAuthorization(context, 'individuals', 'read') == true) {
            return individual.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addIndividual: function(input, context) {
        if (checkAuthorization(context, 'individuals', 'create') == true) {
            return individual.create(input)
                .then(individual => {
                    return individual;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddIndividualXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return individual.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddIndividualCsv: function(_, context) {
      delim = context.request.body.delim;
      cols = context.request.body.cols;
      tmpFile = path.join(__dirname, uuidv4()+'.csv')
      return context.request.files.csv_file.mv(tmpFile).then(() => {
        return fileTools.parseCsvStream(tmpFile, individual, delim, cols)
      }).catch((err) => {
        return new Error(err);
      }).then(() => {
        fs.unlinkSync(tmpFile)
      })
    },

    deleteIndividual: function({
        id
    }, context) {
        if (checkAuthorization(context, 'individuals', 'delete') == true) {
            return individual.findById(id)
                .then(individual => {
                    return individual.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updateIndividual: function(input, context) {
        if (checkAuthorization(context, 'individuals', 'update') == true) {
            return individual.findById(input.id)
                .then(individual => {
                    return individual.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },
    countIndividuals: function({search}, context) {
            let options = {};
            if (search !== undefined) {
                let arg = new searchArg(search);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return individual.count(options);
        },

    vueTableIndividual: function(_, context) {
        if (checkAuthorization(context, 'individuals', 'read') == true) {
            return helper.vueTable(context.request, individual, ["id", "name"]);
        } else {
            return "You don't have authorization to perform this action";
        }
    }
}
`

module.exports.transcript_count_no_assoc_model = `
'use strict';

const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    var transcript_count = sequelize.define('transcript_count', {

        gene: {
            type: Sequelize.STRING
        },
        variable: {
            type: Sequelize.STRING
        },
        count: {
            type: Sequelize.FLOAT
        },
        tissue_or_condition: {
            type: Sequelize.STRING
        }
    });

    transcript_count.associate = function(models) {};

    return transcript_count;
};
`
module.exports.individual_no_assoc_model = `
'use strict';

const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    var individual = sequelize.define('individual', {

        name: {
            type: Sequelize.STRING
        }
    });

    individual.associate = function(models) {};

    return individual;
};
`

module.exports.transcript_count_no_assoc_migration = `
'use strict';

module.exports = {

    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('transcript_counts', {

            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },

            createdAt: {
                type: Sequelize.DATE
            },

            updatedAt: {
                type: Sequelize.DATE
            },

            gene: {
                type: Sequelize.STRING
            },
            variable: {
                type: Sequelize.STRING
            },
            count: {
                type: Sequelize.FLOAT
            },
            tissue_or_condition: {
                type: Sequelize.STRING
            }

        });
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('transcript_counts');
    }

};
`

module.exports.transcript_count_resolvers =`
/*
    Resolvers for basic CRUD operations
*/

const transcript_count = require('../models/index').transcript_count;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')

transcript_count.prototype.individual = function(_, context) {
    return this.getIndividual();
}




module.exports = {

    transcript_counts: function({
        search,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'transcript_counts', 'read') == true) {
            let options = {};
            if (search !== undefined) {
                let arg = new searchArg(search);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return transcript_count.count(options).then(items => {
                if (order !== undefined) {
                    options['order'] = order.map((orderItem) => {
                        return [orderItem.field, orderItem.order];
                    });
                }

                if (pagination !== undefined) {
                    options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                    options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
                } else {
                    options['offset'] = 0;
                    options['limit'] = items;
                }

                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total transcript_counts exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }
                return transcript_count.findAll(options);
            }).catch(error => {
                console.log("Catched the error in transcript_counts ", error);
                return error;
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOneTranscript_count: function({
        id
    }, context) {
        if (checkAuthorization(context, 'transcript_counts', 'read') == true) {
            return transcript_count.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addTranscript_count: function(input, context) {
        if (checkAuthorization(context, 'transcript_counts', 'create') == true) {
            return transcript_count.create(input)
                .then(transcript_count => {
                    return transcript_count;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddTranscript_countXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return transcript_count.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddTranscript_countCsv: function(_, context) {
      delim = context.request.body.delim;
      cols = context.request.body.cols;
      tmpFile = path.join(__dirname, uuidv4()+'.csv')
      return context.request.files.csv_file.mv(tmpFile).then(() => {
        return fileTools.parseCsvStream(tmpFile, transcript_count, delim, cols)
      }).catch((err) => {
        return new Error(err);
      }).then(() => {
        fs.unlinkSync(tmpFile)
      })
    },

    deleteTranscript_count: function({
        id
    }, context) {
        if (checkAuthorization(context, 'transcript_counts', 'delete') == true) {
            return transcript_count.findById(id)
                .then(transcript_count => {
                    return transcript_count.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updateTranscript_count: function(input, context) {
        if (checkAuthorization(context, 'transcript_counts', 'update') == true) {
            return transcript_count.findById(input.id)
                .then(transcript_count => {
                    return transcript_count.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

  countTranscript_counts: function({search}, context) {
    let options = {};
    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return transcript_count.count(options);
  },

    vueTableTranscript_count: function(_, context) {
        if (checkAuthorization(context, 'transcript_counts', 'read') == true) {
            return helper.vueTable(context.request, transcript_count, ["id", "gene", "variable", "tissue_or_condition"]);
        } else {
            return "You don't have authorization to perform this action";
        }
    }
}
`

module.exports.person_resolvers = `
/*
    Resolvers for basic CRUD operations
*/

const person = require('../models/index').person;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')

person.prototype.dogsFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countDogs(options).then(items => {
        if (order !== undefined) {
            options['order'] = order.map((orderItem) => {
                return [orderItem.field, orderItem.order];
            });
        }

        if (pagination !== undefined) {
            options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
            options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
        } else {
            options['offset'] = 0;
            options['limit'] = items;
        }

        if (globals.LIMIT_RECORDS < options['limit']) {
            throw new Error(\`Request of total dogsFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getDogs(options);
    }).catch(error => {
        console.log("Catched the error in dogsFilter ", error);
        return error;
    });
}

person.prototype.countFilteredDogs = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countDogs(options);
}

person.prototype.booksFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countBooks(options).then(items => {
        if (order !== undefined) {
            options['order'] = order.map((orderItem) => {
                return [orderItem.field, orderItem.order];
            });
        }

        if (pagination !== undefined) {
            options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
            options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
        } else {
            options['offset'] = 0;
            options['limit'] = items;
        }

        if (globals.LIMIT_RECORDS < options['limit']) {
            throw new Error(\`Request of total booksFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getBooks(options);
    }).catch(error => {
        console.log("Catched the error in booksFilter ", error);
        return error;
    });
}

person.prototype.countFilteredBooks = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countBooks(options);
}




module.exports = {

    people: function({
        search,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'people', 'read') == true) {
            let options = {};
            if (search !== undefined) {
                let arg = new searchArg(search);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return person.count(options).then(items => {
                if (order !== undefined) {
                    options['order'] = order.map((orderItem) => {
                        return [orderItem.field, orderItem.order];
                    });
                }

                if (pagination !== undefined) {
                    options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                    options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
                } else {
                    options['offset'] = 0;
                    options['limit'] = items;
                }

                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total people exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }
                return person.findAll(options);
            }).catch(error => {
                console.log("Catched the error in people ", error);
                return error;
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOnePerson: function({
        id
    }, context) {
        if (checkAuthorization(context, 'people', 'read') == true) {
            return person.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addPerson: function(input, context) {
        if (checkAuthorization(context, 'people', 'create') == true) {
            return person.create(input)
                .then(person => {
                  if (input.addDogs) {
                      person.setDogs(input.addDogs);
                  }
                  if (input.addBooks) {
                      person.setBooks(input.addBooks);
                  }
                  return person;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddPersonXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return person.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddPersonCsv: function(_, context) {
      delim = context.request.body.delim;
      cols = context.request.body.cols;
      tmpFile = path.join(__dirname, uuidv4()+'.csv')
      return context.request.files.csv_file.mv(tmpFile).then(() => {
        return fileTools.parseCsvStream(tmpFile, person, delim, cols)
      }).catch((err) => {
        return new Error(err);
      }).then(() => {
        fs.unlinkSync(tmpFile)
      })
    },

    deletePerson: function({
        id
    }, context) {
        if (checkAuthorization(context, 'people', 'delete') == true) {
            return person.findById(id)
                .then(person => {
                    return person.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updatePerson: function(input, context) {
        if (checkAuthorization(context, 'people', 'update') == true) {
            return person.findById(input.id)
                .then(person => {
                  if (input.addDogs) {
                    person.addDogs(input.addDogs);
                  }
                  if (input.removeDogs) {
                    person.removeDogs(input.removeDogs);
                  }
                  if (input.addBooks) {
                      person.addBooks(input.addBooks);
                  }
                  if (input.removeBooks) {
                      person.removeBooks(input.removeBooks);
                  }
                    return person.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    countPeople: function({
        search
    }, context) {
        let options = {};
        if (search !== undefined) {
            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        return person.count(options);
    },

    vueTablePerson: function(_, context) {
        if (checkAuthorization(context, 'people', 'read') == true) {
            return helper.vueTable(context.request, person, ["id", "firstName", "lastName", "email"]);
        } else {
            return "You don't have authorization to perform this action";
        }
    }
}
`

module.exports.book_resolver_limit = `
/*
    Resolvers for basic CRUD operations
*/

const book = require('../models/index').book;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')
const publisher = require('./publisher');


book.prototype.peopleFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countPeople(options).then(items => {
        if (order !== undefined) {
            options['order'] = order.map((orderItem) => {
                return [orderItem.field, orderItem.order];
            });
        }

        if (pagination !== undefined) {
            options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
            options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
        } else {
            options['offset'] = 0;
            options['limit'] = items;
        }

        if (globals.LIMIT_RECORDS < options['limit']) {
            throw new Error(\`Request of total peopleFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getPeople(options);
    }).catch(error => {
        console.log("Catched the error in peopleFilter ", error);
        return error;
    });
}


book.prototype.countFilteredPeople = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countPeople(options);
  }

book.prototype.publisher = function(_, context) {
    return publisher.readOnePublisher({
        "id": this.publisherId
    }, context);
}



module.exports = {

    books: function({
        search,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'books', 'read') == true) {
            let options = {};
            if (search !== undefined) {
                let arg = new searchArg(search);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return book.count(options).then(items => {
                if (order !== undefined) {
                    options['order'] = order.map((orderItem) => {
                        return [orderItem.field, orderItem.order];
                    });
                }

                if (pagination !== undefined) {
                    options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                    options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
                } else {
                    options['offset'] = 0;
                    options['limit'] = items;
                }

                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total books exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }
                return book.findAll(options);
            }).catch(error => {
                console.log("Catched the error in books ", error);
                return error;
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOneBook: function({
        id
    }, context) {
        if (checkAuthorization(context, 'books', 'read') == true) {
            return book.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addBook: function(input, context) {
        if (checkAuthorization(context, 'books', 'create') == true) {
            return book.create(input)
                .then(book => {
                    if (input.addPeople) {
                        book.setPeople(input.addPeople);
                    }
                    return book;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddBookXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return book.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddBookCsv: function(_, context) {
      delim = context.request.body.delim;
      cols = context.request.body.cols;
      tmpFile = path.join(__dirname, uuidv4()+'.csv')
      return context.request.files.csv_file.mv(tmpFile).then(() => {
        return fileTools.parseCsvStream(tmpFile, book, delim, cols)
      }).catch((err) => {
        return new Error(err);
      }).then(() => {
        fs.unlinkSync(tmpFile)
      })
    },

    deleteBook: function({
        id
    }, context) {
        if (checkAuthorization(context, 'books', 'delete') == true) {
            return book.findById(id)
                .then(book => {
                    return book.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updateBook: function(input, context) {
        if (checkAuthorization(context, 'books', 'update') == true) {
            return book.findById(input.id)
                .then(book => {
                  if (input.addPeople) {
                    book.addPeople(input.addPeople);
                  }
                  if (input.removePeople) {
                    book.removePeople(input.removePeople);
                  }
                    return book.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    countBooks: function({search}, context){
      let options = {};
      if (search !== undefined) {
          let arg = new searchArg(search);
          let arg_sequelize = arg.toSequelize();
          options['where'] = arg_sequelize;
      }
      return book.count(options);
    },

    vueTableBook: function(_, context) {
        if (checkAuthorization(context, 'books', 'read') == true) {
            return helper.vueTable(context.request, book, ["id", "title", "genre"]);
        } else {
            return "You don't have authorization to perform this action";
        }
    }


}

`
module.exports.researcher_schema = `
module.exports = \`
  type Researcher  {
    id: ID
      firstName: String
      lastName: String
      email: String
        dog: Dog
        projectsFilter(search: searchProjectInput, order: [ orderProjectInput ], pagination: paginationInput): [Project]
    countFilteredProjects(search: searchProjectInput) : Int
  }

  type VueTableResearcher{
    data : [Researcher]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum ResearcherField {
    id
    firstName
    lastName
    email
  }

  input searchResearcherInput {
    field: ResearcherField
    value: typeValue
    operator: Operator
    search: [searchResearcherInput]
  }

  input orderResearcherInput{
    field: ResearcherField
    order: Order
  }

  type Query {
    researchers(search: searchResearcherInput, order: [ orderResearcherInput ], pagination: paginationInput ): [Researcher]
    readOneResearcher(id: ID!): Researcher
    countResearchers(search: searchResearcherInput ): Int
    vueTableResearcher : VueTableResearcher
  }

    type Mutation {
    addResearcher( firstName: String, lastName: String, email: String, addProjects:[ID] ): Researcher
    deleteResearcher(id: ID!): String!
    updateResearcher(id: ID!, firstName: String, lastName: String, email: String, addProjects:[ID], removeProjects:[ID]): Researcher!
    bulkAddResearcherXlsx: [Researcher]
    bulkAddResearcherCsv: [Researcher]
}
  \`;
`

module.exports.researcher_resolver = `
/*
    Resolvers for basic CRUD operations
*/

const researcher = require('../models/index').researcher;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')

researcher.prototype.dog = function(_, context) {
    return this.getDog();
}

researcher.prototype.projectsFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countProjects(options).then(items => {
        if (order !== undefined) {
            options['order'] = order.map((orderItem) => {
                return [orderItem.field, orderItem.order];
            });
        }

        if (pagination !== undefined) {
            options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
            options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
        } else {
            options['offset'] = 0;
            options['limit'] = items;
        }

        if (globals.LIMIT_RECORDS < options['limit']) {
            throw new Error(\`Request of total projectsFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getProjects(options);
    }).catch(error => {
        console.log("Catched the error in projectsFilter ", error);
        return error;
    });
}

researcher.prototype.countFilteredProjects = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countProjects(options);
}




module.exports = {

    researchers: function({
        search,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'researchers', 'read') == true) {
            let options = {};
            if (search !== undefined) {
                let arg = new searchArg(search);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return researcher.count(options).then(items => {
                if (order !== undefined) {
                    options['order'] = order.map((orderItem) => {
                        return [orderItem.field, orderItem.order];
                    });
                }

                if (pagination !== undefined) {
                    options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                    options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
                } else {
                    options['offset'] = 0;
                    options['limit'] = items;
                }

                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total researchers exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }
                return researcher.findAll(options);
            }).catch(error => {
                console.log("Catched the error in researchers ", error);
                return error;
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOneResearcher: function({
        id
    }, context) {
        if (checkAuthorization(context, 'researchers', 'read') == true) {
            return researcher.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addResearcher: function(input, context) {
        if (checkAuthorization(context, 'researchers', 'create') == true) {
            return researcher.create(input)
                .then(researcher => {
                    if (input.addProjects) {
                        researcher.setProjects(input.addProjects);
                    }
                    return researcher;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddResearcherXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return researcher.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddResearcherCsv: function(_, context) {
      delim = context.request.body.delim;
      cols = context.request.body.cols;
      tmpFile = path.join(__dirname, uuidv4()+'.csv')
      return context.request.files.csv_file.mv(tmpFile).then(() => {
        return fileTools.parseCsvStream(tmpFile, researcher, delim, cols)
      }).catch((err) => {
        return new Error(err);
      }).then(() => {
        fs.unlinkSync(tmpFile)
      })
    },

    deleteResearcher: function({
        id
    }, context) {
        if (checkAuthorization(context, 'researchers', 'delete') == true) {
            return researcher.findById(id)
                .then(researcher => {
                    return researcher.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updateResearcher: function(input, context) {
        if (checkAuthorization(context, 'researchers', 'update') == true) {
            return researcher.findById(input.id)
                .then(researcher => {
                  if (input.addProjects) {
                      researcher.addProjects(input.addProjects);
                  }
                  if (input.removeProjects) {
                      researcher.removeProjects(input.removeProjects);
                  }
                    return researcher.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    countResearchers: function({
        search
    }, context) {
        let options = {};
        if (search !== undefined) {
            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        return researcher.count(options);
    },

    vueTableResearcher: function(_, context) {
        if (checkAuthorization(context, 'researchers', 'read') == true) {
            return helper.vueTable(context.request, researcher, ["id", "firstName", "lastName", "email"]);
        } else {
            return "You don't have authorization to perform this action";
        }
    }
}
`
module.exports.individual_schema = `
module.exports = \`
  type individual  {
    id: ID
      name: String
          transcript_countsFilter(search: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationInput): [transcript_count]
      countFilteredTranscript_counts(search: searchTranscript_countInput): Int
  }

  type VueTableIndividual{
    data : [individual]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }
  enum individualField {
    id
    name
  }

  input searchIndividualInput {
    field: individualField
    value: typeValue
    operator: Operator
    search: [searchIndividualInput]
  }

  input orderIndividualInput{
    field: individualField
    order: Order
  }

  type Query {
    individuals(search: searchIndividualInput, order: [ orderIndividualInput ], pagination: paginationInput ): [individual]
    readOneIndividual(id: ID!): individual
    countIndividuals(search: searchIndividualInput): Int
    vueTableIndividual : VueTableIndividual
  }

    type Mutation {
    addIndividual( name: String, addTranscript_counts:[ID] ): individual
    deleteIndividual(id: ID!): String!
    updateIndividual(id: ID!, name: String, addTranscript_counts:[ID], removeTranscript_counts:[ID]): individual!
    bulkAddIndividualXlsx: [individual]
    bulkAddIndividualCsv: [individual]
}
  \`;
`

module.exports.specie_resolvers = `
const specie = require('../models-webservice/specie');
const searchArg = require('../utils/search-argument');
const resolvers = require('./index');



specie.prototype.projectsFilter = function({
    search,
    order,
    pagination
}, context) {
    if (search === undefined) {
        return resolvers.projects({
            "search": {
                "field": "specieId",
                "value": {
                    "value": this.id
                },
                "operator": "eq"
            },
            order,
            pagination
        }, context);
    } else {
        return resolvers.projects({
            "search": {
                "operator": "and",
                "search": [{
                    "field": "specieId",
                    "value": {
                        "value": this.id
                    },
                    "operator": "eq"
                }, search]
            },
            order,
            pagination
        }, context)
    }

}

specie.prototype.countFilteredProjects = function({search},context){
  if (search === undefined) {
      return resolvers.countProjects({
          "search": {
              "field": "specieId",
              "value": {
                  "value": this.id
              },
              "operator": "eq"
          }
      }, context);
  } else {
      return resolvers.countProjects({
          "search": {
              "operator": "and",
              "search": [{
                  "field": "specieId",
                  "value": {
                      "value": this.id
                  },
                  "operator": "eq"
              }, search]
          }
      }, context)
  }
}

module.exports = {
    species: function({
        search,
        order,
        pagination
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
    },

    readOneSpecie: function({
        id
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
    },

    countSpecies: function({search}, context){
      /*
      YOUR CODE GOES HERE
      */
    }
}
`

module.exports.book_schema = `
module.exports = \`
  type Book  {
      id: ID
      title: String
      genre: String
        publisher: Publisher
        peopleFilter(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationInput): [Person]
    countFilteredPeople(search: searchPersonInput) : Int
  }

type VueTableBook{
  data : [Book]
  total: Int
  per_page: Int
  current_page: Int
  last_page: Int
  prev_page_url: String
  next_page_url: String
  from: Int
  to: Int
}

  enum BookField {
    id
    title
    genre
  }

  input searchBookInput {
    field: BookField
    value: typeValue
    operator: Operator
    search: [searchBookInput]
  }

  input orderBookInput{
    field: BookField
    order: Order
  }

  type Query {
    books(search: searchBookInput, order: [ orderBookInput ], pagination: paginationInput ): [Book]
    readOneBook(id: ID!): Book
    countBooks(search: searchBookInput ): Int
    vueTableBook : VueTableBook
  }

    type Mutation {
    addBook( title: String, genre: String, publisherId: Int, addPeople:[ID]   ): Book
    deleteBook(id: ID!): String!
    updateBook(id: ID!, title: String, genre: String, publisherId: Int, addPeople:[ID], removePeople:[ID]  ): Book!
    bulkAddBookXlsx: [Book]
    bulkAddBookCsv: [Book]
}
  \`;
`

module.exports.book_resolver_table = `
/*
    Resolvers for basic CRUD operations
*/

const book = require('../models/index').book;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')
const publisher = require('./publisher');


book.prototype.peopleFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countPeople(options).then(items => {
        if (order !== undefined) {
            options['order'] = order.map((orderItem) => {
                return [orderItem.field, orderItem.order];
            });
        }

        if (pagination !== undefined) {
            options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
            options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
        } else {
            options['offset'] = 0;
            options['limit'] = items;
        }

        if (globals.LIMIT_RECORDS < options['limit']) {
            throw new Error(\`Request of total peopleFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getPeople(options);
    }).catch(error => {
        console.log("Catched the error in peopleFilter ", error);
        return error;
    });
}

book.prototype.countFilteredPeople = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countPeople(options);
}

book.prototype.publisher = function(_, context) {
    return publisher.readOnePublisher({
        "id": this.publisherId
    }, context);
}



module.exports = {

    books: function({
        search,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'books', 'read') == true) {
            let options = {};
            if (search !== undefined) {
                let arg = new searchArg(search);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return book.count(options).then(items => {
                if (order !== undefined) {
                    options['order'] = order.map((orderItem) => {
                        return [orderItem.field, orderItem.order];
                    });
                }

                if (pagination !== undefined) {
                    options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                    options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
                } else {
                    options['offset'] = 0;
                    options['limit'] = items;
                }

                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total books exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }
                return book.findAll(options);
            }).catch(error => {
                console.log("Catched the error in books ", error);
                return error;
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOneBook: function({
        id
    }, context) {
        if (checkAuthorization(context, 'books', 'read') == true) {
            return book.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addBook: function(input, context) {
        if (checkAuthorization(context, 'books', 'create') == true) {
            return book.create(input)
                .then(book => {
                    if (input.addPeople) {
                        book.setPeople(input.addPeople);
                    }
                    return book;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddBookXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return book.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddBookCsv: function(_, context) {
      delim = context.request.body.delim;
      cols = context.request.body.cols;
      tmpFile = path.join(__dirname, uuidv4()+'.csv')
      return context.request.files.csv_file.mv(tmpFile).then(() => {
        return fileTools.parseCsvStream(tmpFile, book, delim, cols)
      }).catch((err) => {
        return new Error(err);
      }).then(() => {
        fs.unlinkSync(tmpFile)
      })
    },

    deleteBook: function({
        id
    }, context) {
        if (checkAuthorization(context, 'books', 'delete') == true) {
            return book.findById(id)
                .then(book => {
                    return book.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updateBook: function(input, context) {
        if (checkAuthorization(context, 'books', 'update') == true) {
            return book.findById(input.id)
                .then(book => {
                  if (input.addPeople) {
                    book.addPeople(input.addPeople);
                  }
                  if (input.removePeople) {
                    book.removePeople(input.removePeople);
                  }
                  return book.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    countBooks: function({
        search
    }, context) {
        let options = {};
        if (search !== undefined) {
            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        return book.count(options);
    },

    vueTableBook: function(_, context){
        if (checkAuthorization(context, 'books', 'read') == true) {
          return helper.vueTable(context.request, book, ["id","title","genre" ]);
        } else {
            return  "You don't have authorization to perform this action";
        }
      }
}
`

module.exports.person_schema = `
module.exports = \`
  type Person  {
    id: ID
    firstName: String
    lastName: String
    email: String
      dogsFilter(search: searchDogInput, order: [ orderDogInput ], pagination: paginationInput): [Dog]
    countFilteredDogs(search: searchDogInput) : Int
  booksFilter(search: searchBookInput, order: [ orderBookInput ], pagination: paginationInput): [Book]
    countFilteredBooks(search: searchBookInput) : Int
  }

  type VueTablePerson{
    data : [Person]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum PersonField {
    id
    firstName
    lastName
    email
  }

  input searchPersonInput {
    field: PersonField
    value: typeValue
    operator: Operator
    search: [searchPersonInput]
  }

  input orderPersonInput{
    field: PersonField
    order: Order
  }

  type Query {
    people(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationInput ): [Person]
    readOnePerson(id: ID!): Person
    countPeople(search: searchPersonInput ): Int
    vueTablePerson : VueTablePerson  }

    type Mutation {
    addPerson( firstName: String, lastName: String, email: String, addDogs:[ID], addBooks:[ID]): Person
    deletePerson(id: ID!): String!
    updatePerson(id: ID!, firstName: String, lastName: String, email: String, addDogs:[ID], removeDogs:[ID], addBooks:[ID], removeBooks:[ID]): Person!
    bulkAddPersonXlsx: [Person]
    bulkAddPersonCsv: [Person]
}
  \`;
`

module.exports.dog_resolvers =`
/*
    Resolvers for basic CRUD operations
*/

const dog = require('../models/index').dog;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')

dog.prototype.person = function(_, context) {
    return this.getPerson();
}
dog.prototype.researcher = function(_, context) {
    return this.getResearcher();
}




module.exports = {

    dogs: function({
        search,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'dogs', 'read') == true) {
            let options = {};
            if (search !== undefined) {
                let arg = new searchArg(search);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return dog.count(options).then(items => {
                if (order !== undefined) {
                    options['order'] = order.map((orderItem) => {
                        return [orderItem.field, orderItem.order];
                    });
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
                return dog.findAll(options);
            }).catch(error => {
                console.log("Catched the error in dogs ", error);
                return error;
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOneDog: function({
        id
    }, context) {
        if (checkAuthorization(context, 'dogs', 'read') == true) {
            return dog.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addDog: function(input, context) {
        if (checkAuthorization(context, 'dogs', 'create') == true) {
            return dog.create(input)
                .then(dog => {
                    return dog;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddDogXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return dog.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddDogCsv: function(_, context) {
        delim = context.request.body.delim;
        cols = context.request.body.cols;
        tmpFile = path.join(__dirname, uuidv4()+'.csv')
        return context.request.files.csv_file.mv(tmpFile).then(() => {
          return fileTools.parseCsvStream(tmpFile, dog, delim, cols)
        }).catch((err) => {
          return new Error(err);
        }).then(() => {
          fs.unlinkSync(tmpFile)
        })
    },

    deleteDog: function({
        id
    }, context) {
        if (checkAuthorization(context, 'dogs', 'delete') == true) {
            return dog.findById(id)
                .then(dog => {
                    return dog.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updateDog: function(input, context) {
        if (checkAuthorization(context, 'dogs', 'update') == true) {
            return dog.findById(input.id)
                .then(dog => {
                    return dog.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    countDogs: function({
        search
    }, context) {
        let options = {};
        if (search !== undefined) {
            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        return dog.count(options);
    },

    vueTableDog: function(_, context) {
        if (checkAuthorization(context, 'dogs', 'read') == true) {
            return helper.vueTable(context.request, dog, ["id", "name", "breed"]);
        } else {
            return "You don't have authorization to perform this action";
        }
    }
}
`

module.exports.project_to_researcher_migration = `
'use strict';

module.exports = {

    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('project_to_researcher', {

            createdAt: {
                type: Sequelize.DATE
            },

            updatedAt: {
                type: Sequelize.DATE
            },

            researcherId: {
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'researchers',
                    key: 'id'
                }
            },

            projectId: {
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'projects',
                    key: 'id'
                }
            }
        }).then(()=> {
            return queryInterface.addIndex('project_to_researcher', ['researcherId']);
        }).then(()=>{
            return queryInterface.addIndex('project_to_researcher', ['projectId']);
        });
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('project_to_researcher');
    }

};
`
module.exports.researcher_model = `
'use strict';

const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    var Researcher = sequelize.define('researcher', {

        firstName: {
            type: Sequelize.STRING
        },
        lastName: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        }
    });

    Researcher.associate = function(models) {
        Researcher.hasOne(models.dog, {
            foreignKey: 'researcherId'
        });
        Researcher.belongsToMany(models.project, {
            through: 'project_to_researcher',
            onDelete: 'CASCADE'
        });
    };

    return Researcher;
};
`
module.exports.add_column_dogs_migration = `
'use strict';

module.exports = {

    up: function(queryInterface, Sequelize) {
        return queryInterface.addColumn('dogs', 'researcherId', {
            type: Sequelize.INTEGER,
            references: {
                model: 'researchers',
                key: 'id'
            }
        }).then(()=>{
          return queryInterface.addIndex('dogs',['researcherId']);
        });
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.removeColumn('dogs', 'researcherId');
    }

};
`
