
async function fetchGraphql(query) {
    let token = localStorage.getItem('token');    
   
    const response = await fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            query: query,
        }),
    });

    const result = await response.json();
    if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error('Failed to fetch data');
    }
    return result.data;
}


export { fetchGraphql };