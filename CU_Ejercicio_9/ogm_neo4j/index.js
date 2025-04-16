import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'lxoV41Xg')
);

const session = driver.session();
const createNodeQuery = 'CREATE (p:Animal {name: $name, age: $age}) RETURN p';
const parameters = { name: 'Dog', age: 5 };

session
  .run(createNodeQuery, parameters)
  .then(result => {
    result.records.forEach(record => {
      const node = record.get('p').properties;
      console.log(`Created node: ${node.name}, Age: ${node.age}`);
    });
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    session.close();
    driver.close();
  });