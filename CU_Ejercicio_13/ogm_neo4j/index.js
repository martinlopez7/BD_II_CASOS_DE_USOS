import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('architect', 'architect2024')
);

const session = driver.session({
  database: 'laboral',
  defaultAccessMode: neo4j.session.WRITE
});

const createNodeQuery = 'UNWIND $props AS map CREATE (n:Person) SET n = map RETURN n';

const parameters={
  "props":[
    {
      "name": "Melissa",
      "twitter": "@melissa",
      "yearsExperience": 0,
      "birthDate": "",
    },
    {
      "name": "Dan",
      "twitter": "@dan",
      "yearsExperience": 6,
      "birthDate": "",
    }
  ]
}

session
  .run(createNodeQuery, parameters)
  .then(result => {
    result.records.forEach(record => {
      console.log(record.get('n').properties);
    });
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    session.close();
    driver.close();
  });