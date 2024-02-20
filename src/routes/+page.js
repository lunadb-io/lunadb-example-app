/** @type {import('./$types').PageLoad} */
export function load({ url }) {
    return {
        document_id: url.searchParams.get('id')
    };
}