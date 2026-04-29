$body = @{
    query = "{ __schema { types { name kind fields { name args { name type { kind name } defaultValue } } } } }"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://ziona-api-staging.onrender.com/graphql/" -Method POST -ContentType "application/json" -Body $body

$json = $response.Content | ConvertFrom-Json

$schema = $json.data.__schema

$output = @"
type Query { __typename: String }
type Mutation { __typename: String }
"@

foreach ($type in $schema.types) {
    if ($type.name -eq "Query" -or $type.name -eq "Mutation" -or $type.name.StartsWith("__") -or $type.kind -ne "OBJECT") { continue }

    $output += @"

type $($type.name) {
"@

    foreach ($field in $type.fields) {
        $output += "  $($field.name): $($field.type.name)"
    }

    $output += "}
"
}

$output | Out-File -FilePath "schema.graphql" -Encoding utf8