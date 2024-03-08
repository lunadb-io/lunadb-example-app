/** @type {import('./$types').PageLoad} */
export function load({ params }) {
    return {
        document_id: params.id
    };
}