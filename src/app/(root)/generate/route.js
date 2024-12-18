import { lookupISRC, lookupUPC } from "@/lib/magic-lookup";

export async function GET(request) {
// get type and id from the URL
    const { type, id } = request.params;
    // get the data from the lookup function
    if (type === 'track') {
        const ISRC = await SpotifylookupISRC(id);
        const lookup = lookupISRC(ISRC, 'US');
        return {
            body: lookup
        };

    }
    else if (type === 'album') {
        const UPC = await SpotifylookupUPC(id);
        const lookup = lookupUPC(UPC, 'US');
        
        
        return {
            body: lookup
        };
    }
    else {
        throw new Error('Invalid type');
    }
}