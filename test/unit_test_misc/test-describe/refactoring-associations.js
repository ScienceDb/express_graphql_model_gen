module.exports.count_associations = `

/**
 * @static countAllAssociatedRecords - Count records associated with another given record
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
 static async countAllAssociatedRecords(id, context ){

   let accession = await this.readById(id);
   //check that record actually exists
   if (accession === null) throw new Error(\`Record with ID = \${id} does not exist\`);

   let promises_to_many = [];
   let promises_to_one = [];

   promises_to_many.push( accession.countFilteredIndividuals({}, context) );
   promises_to_many.push( accession.countFilteredMeasurements({}, context) );
   promises_to_one.push( accession.location({}, context) );

   let result_to_many = await Promise.all( promises_to_many);
   let result_to_one = await Promise.all(promises_to_one);

   let get_to_many_associated = result_to_many.reduce( (accumulator, current_val )=> accumulator + current_val ,  0 );
   let get_to_one_associated = result_to_one.filter( (r, index) => r !== null ).length;

   return get_to_one_associated + get_to_many_associated;
 }

`

module.exports.validate_for_deletion = `
/**
 * @static validForDeletion - Checks wether a record is allowed to be deleted
 *
 * @param  {ID} id      Id of record to check if it can be deleted
 * @param  {object} context Default context by resolver
 * @return {boolean}         True if it is allowed to be deleted and false otherwise
 */
static async validForDeletion(id, context){
  if( await this.countAllAssociatedRecords(id, context) > 0 ){
    throw new Error(\`Accession with accession_id \${id} has associated records and is NOT valid for deletion. Please clean up before you delete.\`);
  }

  return true;
}
`
