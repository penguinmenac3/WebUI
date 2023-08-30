export interface Event {
    type: string  // Defines how to interpret the data
    data: any  // Anything JSON serializable
    allowNetwork: boolean  // Should it be synced live over network with other viewers?
}

export type OnEvent = (topic: string, event: Event) => void

export class Eventbus {
    private static registry = new Map<string, OnEvent[]>()

    public static register(topic: string, callback: OnEvent) {
        if (!this.registry.has(topic)) {
            this.registry.set(topic, [])
        }
        this.registry.get(topic)!.push(callback)
    }

    public static send(topic: string, event: Event) {
        let listeners = this.registry.get(topic) ?? []
        for(let listener of listeners) {
            listener(topic, event)
        }
        if (event.allowNetwork) {
            let listeners = this.registry.get("network") ?? []
            for(let listener of listeners) {
                listener(topic, event)
            }
        }
    }
}
