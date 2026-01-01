export class Event {
    allFunctions: Record<string, any> [] = [];
    // Hier noch einbauen das man es nur einmal verwenden möchte
    subscribe(name: string, fn: (args: Record<string, any> | Array<any>) => void): void {
        this.allFunctions.push({
            [name]: fn
        });
    };

    publish(name: string, args?: Record<string, any>): void {
        this.allFunctions.forEach(fnObject => {
            if(name === Object.keys(fnObject)[0]) {
                fnObject[name](args);
            }
        });
    };

    unsubscribe(name: string): void {
        for(let i = 0; i < this.allFunctions.length; i++) {
            if(Object.keys(this.allFunctions[i])[0] === name) {
                this.allFunctions.splice(i, 1);
            }
        };
    };

    removeEvent(): void {

    };
}