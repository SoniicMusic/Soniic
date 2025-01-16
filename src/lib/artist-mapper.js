export class ArtistMapper {
    constructor() {
        this.artistGroups = new Map();
    }

    normalize(name) {
        return name.toLowerCase()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    addArtist(name, service, id) {
        const normalizedName = this.normalize(name);
        
        // Find existing group or create new one
        let group = [...this.artistGroups.entries()]
            .find(([key]) => this.normalize(key).includes(normalizedName) 
                || normalizedName.includes(this.normalize(key)));

        if (group) {
            // Add to existing group
            const [primaryName] = group;
            const data = this.artistGroups.get(primaryName);
            data[service] = id;
        } else {
            // Create new group
            this.artistGroups.set(name, { [service]: id });
        }
    }

    getArtistGroups() {
        return Object.fromEntries(this.artistGroups);
    }
}