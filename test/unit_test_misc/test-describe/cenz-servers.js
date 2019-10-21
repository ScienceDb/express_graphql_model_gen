module.exports.server_url = `
  const url = "http://something.other:7000/graphql";
`

module.exports.read_by_id = `
static readById(id) {
  let query = \`query readOneBook{ readOneBook(id: \${id}){id  title genre publisher_id} }\`

  return axios.post(url,{query:query}).then( res => {
    let data = res.data.data.readOneBook;
    return new Book(data);
  }).catch( error =>{
    handleError(error);
  });
}
`

module.exports.read_all = `
static readAll(search, order, pagination) {
  let query = \`query
  books($search: searchBookInput $pagination: paginationInput $order: [orderBookInput] )
 {books(search:$search pagination:$pagination order:$order){id title genre publisher_id } }\`

 return axios.post(url,{query:query, variables: {
   search: search,
   order: order,
   pagination: pagination
 }}).then( res => {
    let data = res.data.data.books;
    return data.map(item => {return new Book(item)});
  }).catch( error =>{
    handleError(error);
  });

}
`
module.exports.count_records = `
static countRecords(search) {
  let query = \`query countBooks($search: searchBookInput ){
    countBooks(search: $search) }\`

    return axios.post(url, {query:query, variables:{
      search: search
    }}).then( res =>{
      return res.data.data.countBooks;
    }).catch(error =>{
      handleError(error);
    });
}
`

module.exports.add_one = `
static addOne(input) {
  let query = \`mutation addBook($title:String $genre:String $publisher_id:Int){
    addBook(title:$title genre:$genre publisher_id:$publisher_id){id  title genre publisher_id   }
  }\`;

  return axios.post(url, {query: query, variables: input}).then( res =>{
    let data = res.data.data.addBook;
    return new Book(data);
  }).catch(error =>{
    handleError(error);
  });
}
`
