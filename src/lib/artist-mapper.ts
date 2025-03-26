export class ArtistMapper {
    private artistGroups: Map<string, Record<string, string>>;

    constructor() {
        this.artistGroups = new Map();
    }

    normalize(name: string): string {
        return name.toLowerCase()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    addArtist(name: string, service: string, id: string): void {
        const normalizedName = this.normalize(name);
        
        // Find existing group or create new one
        let group = [...this.artistGroups.entries()]
            .find(([key]) => this.normalize(key).includes(normalizedName) 
                || normalizedName.includes(this.normalize(key)));

        if (group) {
            // Add to existing group
            const [primaryName] = group;
            const data = this.artistGroups.get(primaryName) as Record<string, string>;
            data[service] = id;
        } else {
            // Create new group
            this.artistGroups.set(name, { [service]: id });
        }
    }

    getArtistGroups(): Record<string, Record<string, string>> {
        return Object.fromEntries(this.artistGroups);
    }
}