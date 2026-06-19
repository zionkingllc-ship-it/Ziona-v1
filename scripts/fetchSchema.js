const https = require('https');
const fs = require('fs');
const path = require('path');

const query = `query IntrospectionQuery {
  __schema {
    queryType { name }
    mutationType { name }
    types {
      kind
      name
      description
      fields(includeDeprecated: true) {
        name
        description
        args {
          name
          description
          type {
            kind
            name
            ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name } } } } } }
          }
          defaultValue
        }
        type {
          kind
          name
          ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name } } } } } }
        }
        isDeprecated
        deprecationReason
      }
      inputFields {
        name
        description
        type {
          kind
          name
          ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name } } } } } }
        }
        defaultValue
      }
      interfaces { kind name ofType { kind name } }
      enumValues(includeDeprecated: true) { name description isDeprecated deprecationReason }
      possibleTypes { kind name ofType { kind name } }
    }
    directives {
      name
      description
      locations
      args {
        name
        description
        type { kind name ofType { kind name ofType { kind name } } }
        defaultValue
      }
    }
  }
}`;

const postData = JSON.stringify({ query });

const rootDir = path.resolve(__dirname, '..');

const options = {
  hostname: 'ziona-api-staging.onrender.com',
  path: '/graphql/',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.data) {
      const introTypes = new Set([
        '__Schema', '__Type', '__TypeKind', '__Field',
        '__InputValue', '__EnumValue', '__Directive', '__DirectiveLocation'
      ]);
      result.data.__schema.types = result.data.__schema.types.filter(
        t => !introTypes.has(t.name)
      );
      result.data.__schema.directives = [];
      fs.writeFileSync(
        path.join(rootDir, 'schema.clean.json'),
        JSON.stringify(result.data, null, 2)
      );
      console.log('✓ Schema fetched and cleaned: ' + result.data.__schema.types.length + ' types');
    } else {
      console.error('✗ Failed to fetch schema:', JSON.stringify(result.errors || result));
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('✗ Network error:', e.message);
  process.exit(1);
});

req.write(postData);
req.end();
