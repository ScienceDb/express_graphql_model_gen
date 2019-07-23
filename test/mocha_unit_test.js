const expect = require('chai').expect;
//const test = require('./unit_test_misc/data_test');
const models = require('./unit_test_misc/data_models');
const funks = require('../funks');
const models_webservice = require('./unit_test_misc/data_models_webservice');
const test_webservice = require('./unit_test_misc/data_test_webservice');
const requireFromString = require('require-from-string');

//const components_code = require('./unit_test_misc/components_code');

describe('Lower-case models', function(){

  let data_test = require('./unit_test_misc/test-describe/lower-case-models');

  it('Check correct queries and mutations in GraphQL Schema - transcript_count', async function(){
    let opts = funks.getOptions(models.transcript_count);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.transcript_count_schema.replace(/\s/g, '');
    expect(g_schema, 'Incorrect schema').to.have.string(test_schema);
  });

  it('Check correct association name in resolver - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.individual_resolvers_association.replace(/\s/g, '');
    expect(g_resolvers, 'Incorrect resolver').to.have.string(test_resolvers);
  });

  it('Check correct attributes and associations in model - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');

    let test_model_attributes = data_test.individual_model_attributes.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model_attributes);

    let test_model_associations = data_test.individual_model_associations.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model_associations);
  });

});

describe('Empty associations', function(){

  let data_test = require('./unit_test_misc/test-describe/empty-association');

  it('Check correct queries and mutations in GraphQL Schema - transcript_count (no assoc)', async function(){
    let opts = funks.getOptions(models.transcript_count_no_assoc);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.transcript_count_no_assoc_schema.replace(/\s/g, '');
    expect(g_schema, 'Incorrect schema').to.have.string(test_schema);
  });

  it('Check no association in resolvers - individual (no assoc)', async function(){
    let opts = funks.getOptions(models.individual_no_assoc);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.individual_no_assoc_resolvers.replace(/\s/g, '');
    expect(g_resolvers, 'Incorrect resolvers').to.have.string(test_resolvers);
  });

  it('Check no associations in model - transcript_count (no assoc)', async function(){
    let opts = funks.getOptions(models.transcript_count_no_assoc);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.transcript_count_no_assoc_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });


});

describe('Limit for records', function(){
  let data_test = require('./unit_test_misc/test-describe/limit-for-records');
  it('Model - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.limit_records_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });
});

describe('Better name for search argument', function(){

  let data_test = require('./unit_test_misc/test-describe/better-name-search-arg');

  it('Check search argument in GraphQL Schema - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.researcher_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Check search argument in resolvers - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.researcher_resolver.replace(/\s/g, '');
    expect(g_resolvers,'Incorrect resolvers').to.have.string(test_resolvers);
  });
});

describe('Count functionality', function(){
  let data_test = require('./unit_test_misc/test-describe/count-functionality');
  it('GraphQL Schema - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.individual_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Resolvers - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.individual_resolvers.replace(/\s/g, '');
    expect(g_resolvers,'Incorrect resolvers').to.have.string(test_resolvers);
  });

  it('Resolvers - specie', async function(){
    let opts = funks.getOptions(models.specie);
    let generated_resolvers =await funks.generateJs('create-resolvers-webservice', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.specie_resolvers.replace(/\s/g, '');
    expect(g_resolvers,'Incorrect resolvers').to.have.string(test_resolvers);
  });
});


describe('VueTable - tableTemplate', function(){

  let data_test = require('./unit_test_misc/test-describe/vuetable-template');
  it('GraphQL Schema - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.book_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Resolvers - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.book_resolvers.replace(/\s/g, '');
    expect(g_resolvers,'Incorrect resolvers').to.have.string(test_resolvers);
  });
});

describe('Associations in query and resolvers', function(){
  let data_test = require('./unit_test_misc/test-describe/associations-in-query-and-resolver');
  it('GraphQL Schema - person', async function(){
    let opts = funks.getOptions(models.person);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.person_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Models - person', async function(){
    let opts = funks.getOptions(models.person);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.person_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });
});

describe('Stream upload file', function(){
  let data_test = require('./unit_test_misc/test-describe/stream-upload-file');
  it('Resolver - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.dog_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

});

describe('Migrations', function(){
  let data_test = require('./unit_test_misc/test-describe/migrations');
  it('Migration cross table - project_to_researcher', async function(){
    let assoc = models.assoc_through_project_researcher;
    let generated_migration =await funks.generateJs('create-through-migration', assoc);
    let g_migration = generated_migration.replace(/\s/g, '');
    let test_migration = data_test.project_to_researcher_migration.replace(/\s/g, '');
    expect(g_migration).to.have.string(test_migration);
  });

  it('Migration - Person', async function(){
    let opts = funks.getOptions(models.person_indices);
    let generated_resolvers =await funks.generateJs('create-migrations', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.person_indices_migration.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });
});

describe('Model naming cases ', function(){
  let data_test = require('./unit_test_misc/test-describe/model-naming-cases');
  it('Resolvers - aminoAcidSequence', async function(){
    let opts = funks.getOptions(models.aminoAcidSequence);
    let generated_resolvers =await funks.generateJs('create-resolvers-webservice', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.resolvers_webservice_aminoAcid.replace(/\s/g, '');
      expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('GraphQL Schema - aminoAcidSequence', async function(){
    let opts = funks.getOptions(models.aminoAcidSequence);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.schema_webservice_aminoAcid.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Model - aminoAcidSequence', async function(){
    let opts = funks.getOptions(models.aminoAcidSequence);
    let generated_model =await funks.generateJs('create-models-webservice', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.model_webservice_aminoAcid.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('Resolvers - inDiVIdual', async function(){
    let opts = funks.getOptions(models.inDiVIdual_camelcase);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.individual_resolvers_camelcase.replace(/\s/g, '');
      expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('GraphQL Schema - inDiVIdual', async function(){
    let opts = funks.getOptions(models.inDiVIdual_camelcase);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.individual_schema_camelcase.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Model - inDiVIdual', async function(){
    let opts = funks.getOptions(models.inDiVIdual_camelcase);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.individual_model_camelcase.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('GraphQL Schema - transcriptCount', async function(){
    let opts = funks.getOptions(models.transcriptCount_camelcase);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.transcriptCount_schema_camelcase.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Resolvers - transcriptCount', async function(){
    let opts = funks.getOptions(models.transcriptCount_indiv);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.transcriptCount_resolvers_camelcase.replace(/\s/g, '');
      expect(g_resolvers).to.have.string(test_resolvers);
  });

});

describe('Association naming', function(){

  let data_test = require('./unit_test_misc/test-describe/association-naming');

  it('Resolvers - Dog', async function(){
    let opts = funks.getOptions(models.dog_owner);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.dog_owner_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('GraphQL Schema - Dog', async function(){
    let opts = funks.getOptions(models.dog_owner);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.dog_owner_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Model - Dog', async function(){
    let opts = funks.getOptions(models.dog_owner);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.dog_owner_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('Resolvers - academicTeam', async function(){
    let opts = funks.getOptions(models.academicTeam);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.academicTeam_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('GraphQL Schema - academicTeam', async function(){
    let opts = funks.getOptions(models.academicTeam);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.academicTeam_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Model - academicTeam', async function(){
    let opts = funks.getOptions(models.academicTeam);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.academicTeam_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });


});

describe('Indices', function(){

  let data_test = require('./unit_test_misc/test-describe/indices');

  it('Migration - Person', async function(){
    let opts = funks.getOptions(models.person_indices);
    let generated_migration =await funks.generateJs('create-migrations', opts);
    let g_migration = generated_migration.replace(/\s/g, '');
    let test_migration = data_test.person_indices_migration.replace(/\s/g, '');
    expect(g_migration).to.have.string(test_migration);
  });

  it('Model - Person', async function(){
    let opts = funks.getOptions(models.person_indices);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.person_indices_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });
});

describe('Monkey patching templates', function(){

  let data_test = require('./unit_test_misc/test-describe/monkey-patching');

    it('Validation - transcriptCount_indiv', async function(){
        let opts = funks.getOptions(models.transcriptCount_indiv);
        let generated_validation =await funks.generateJs('create-validations', opts);
        let g_validation = generated_validation.replace(/\s/g, '');
        let test_validation = data_test.transcriptCount_indiv_validation.replace(/\s/g, '');
        expect(g_validation).to.have.string(test_validation);
    });

    it('Patch - dog_owner', async function(){
        let opts = funks.getOptions(models.dog_owner);
        let generated_patch =await funks.generateJs('create-patches', opts);
        let g_patch = generated_patch.replace(/\s/g, '');
        let test_patch = data_test.dog_owner_patch.replace(/\s/g, '');
        expect(g_patch).to.have.string(test_patch);
    });
});

describe('All webservice models', function(){

  let data_test = require('./unit_test_misc/test-describe/all-webservice');

  it('GraphQL Schema - book', async function(){
    let opts = funks.getOptions(models_webservice.book);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.schema_book.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Resolvers - book', async function(){
    let opts = funks.getOptions(models_webservice.book);
    let generated_resolvers =await funks.generateJs('create-resolvers-webservice', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.resolvers_book.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('Model - book', async function(){
    let opts = funks.getOptions(models_webservice.book);
    let generated_model =await funks.generateJs('create-models-webservice', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.model_book.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('GraphQL Schema - person', async function(){
    let opts = funks.getOptions(models_webservice.person);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.schema_person.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Resolvers - person', async function(){
    let opts = funks.getOptions(models_webservice.person);
    let generated_resolvers =await funks.generateJs('create-resolvers-webservice', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = data_test.resolvers_person.replace(/\s/g, '');
    expect(g_resolvers).to.have.string(test_resolvers);
  });

  it('Model - person', async function(){
    let opts = funks.getOptions(models_webservice.person);
    let generated_model =await funks.generateJs('create-models-webservice', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.model_person.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

});

// // describe('Model definition', function(){
// //
// //   it('Access local model definition property', async function(){
// //     let opts = funks.getOptions(models.individual);
// //     let generated_model =await funks.generateJs('create-models', opts);
// //
// //     // replace real Sequelize import with a plain object
// //     let str = "const Sequelize = require('sequelize');";
// //     generated_model = generated_model.replace(str, 'let Sequelize = {}; Sequelize.STRING = "";');
// //
// //     // pass fake connection into the module and get the model defined
// //     let fake_sequelize = {};
// //     fake_sequelize.define = function(a, b){ return b; };
// //     let model = requireFromString(generated_model)(fake_sequelize);
// //
// //     // check any existing property of the 'individual' definition
// //     expect(model.definition.associations.transcript_counts.type === "hasMany");
// //   });
// //
// //   it('Access web-service model definition property', async function(){
// //     let opts = funks.getOptions(models_webservice.publisher);
// //     let generated_model =await funks.generateJs('create-models-webservice', opts);
// //     let model = requireFromString(generated_model);
// //
// //     // check any existing property of the 'publisher' definition
// //     expect(model.definition.associations.publications.target === 'book');
// //   });
// //
// // });
//
describe('Implement date/time types', function(){

  let data_test = require('./unit_test_misc/test-describe/date-time');

  it('Model - Person', async function(){
    let opts = funks.getOptions(models.person_date);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.person_date_model.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('Schema - Person', async function(){
    let opts = funks.getOptions(models.person_date);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.person_date_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('Migration - Person', async function(){
    let opts = funks.getOptions(models.person_date);
    let generated_migration =await funks.generateJs('create-migrations', opts);
    let g_migration = generated_migration.replace(/\s/g, '');
    let test_migration = data_test.person_date_migration.replace(/\s/g, '');
    expect(g_migration).to.have.string(test_migration);
  });

});

describe('Update sequelize model to class', function(){

  let data_test = require('./unit_test_misc/test-describe/sequelize-model-class');
  it('Model init - Book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.book_model_init.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('Model associations - Book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.book_model_associations.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });

  it('Model read by id - Book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.book_model_read_by_id.replace(/\s/g, '');
    expect(g_model, 'Incorrect model').to.have.string(test_model);
  });



});


describe('Model Layer', function(){

  let data_test = require('./unit_test_misc/test-describe/model-layer');
  it('Count method in sequelize model - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.count_in_sequelize_model.replace(/\s/g, '');
    expect(g_model, 'No count method found').to.have.string(test_model);
  });

  it('Model - publisher', async function(){
    let opts = funks.getOptions(models_webservice.publisher);
    let generated_model =await funks.generateJs('create-models-webservice', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.count_in_webservice_model.replace(/\s/g, '');
    expect(g_model, 'No count method found').to.have.string(test_model);
  })

  it('Count resolver - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.count_in_resolvers.replace(/\s/g, '');
    expect(g_resolvers, 'No count method found').to.have.string(test_resolver);
  });

  it('Read all model - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.read_all.replace(/\s/g, '');
    expect(g_model, 'No read all method found').to.have.string(test_model);
  })

  it('Read all resolver - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.read_all_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No read all method found').to.have.string(test_resolver);
  });

  it('Add one model - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.add_one_model.replace(/\s/g, '');
    expect(g_model, 'No add one method found').to.have.string(test_model);
  })

  it('Add one resolver - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.add_one_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No add one method found').to.have.string(test_resolver);
  });

  it('Delete one model - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.delete_one_model.replace(/\s/g, '');
    expect(g_model, 'No add one method found').to.have.string(test_model);
  })

  it('Add one resolver - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.delete_one_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No add one method found').to.have.string(test_resolver);
  });

  it('Update one model - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.update_one_model.replace(/\s/g, '');
    expect(g_model, 'No add one method found').to.have.string(test_model);
  })

  it('Update one resolver - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.update_one_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No add one method found').to.have.string(test_resolver);
  });


  it('Bulk Add model - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.bulk_add_model.replace(/\s/g, '');
    expect(g_model, 'No add one method found').to.have.string(test_model);
  })

  it('Bulk Add resolver - book', async function(){
    let opts = funks.getOptions(models.book_authors);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.bulk_add_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No add one method found').to.have.string(test_resolver);
  });


  it('Table template model - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.table_template_model.replace(/\s/g, '');
    expect(g_model, 'No add one method found').to.have.string(test_model);
  })

  it('Table template resolver - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.table_template_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No add one method found').to.have.string(test_resolver);
  });


});



describe('Decouple association from resolvers', function(){

  let data_test = require('./unit_test_misc/test-describe/decouple-associations');

  it('BelongsTo implementation in model - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.belongsTo_model.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('BelongsTo implementation in resolver - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.belongsTo_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No method found').to.have.string(test_resolver);
  });

  it('HasOne implementation in model - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.hasOne_model.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('HasOne implementation in resolver - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.hasOne_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No method found').to.have.string(test_resolver);
  });

  it('BelongsTo implementation in schema - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.belongsTo_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('HasOne implementation in schema - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = data_test.hasOne_schema.replace(/\s/g, '');
    expect(g_schema,'Incorrect schema').to.have.string(test_schema);
  });

  it('HasMany implementation in model - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = data_test.hasMany_model.replace(/\s/g, '');
    expect(g_model, 'No method found').to.have.string(test_model);
  })

  it('HasMany implementation in resolver - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolver = data_test.hasMany_resolver.replace(/\s/g, '');
    expect(g_resolvers, 'No method found').to.have.string(test_resolver);
  });


});
