

export interface FlightData {
    altitude: number;
    latitude: number;
    longitude: number;
    heading: number;
    airspeed: number;
}

export type FlightDataCallback = (data: FlightData) => void;

export class FlightDataService {
    private updateInterval = 50; // ms
    private subscribers = new Set<FlightDataCallback>();
    private mockData: FlightData = {
        altitude: 35000,
        latitude: 47.4500,
        longitude: -122.3088,
        heading: 270,
        airspeed: 450
    };
    private mockInterval: NodeJS.Timeout | null = null;

    constructor() {
        console.log("Initializing FlightDataService in MOCK mode.");
        this.startMockPolling();
    }

    private startMockPolling() {
        this.mockInterval = setInterval(() => {
            this.mockData.latitude += 0.0001;
            this.mockData.longitude -= 0.0001;
            this.mockData.altitude += (Math.random() - 0.5) * 10;
            this.mockData.heading = (this.mockData.heading + (Math.random() - 0.5)) % 360;
            if (this.mockData.heading < 0) this.mockData.heading += 360;
            this.mockData.airspeed = Math.max(0, this.mockData.airspeed + (Math.random() - 0.5) * 5);

            this.emit({ ...this.mockData });
        }, this.updateInterval);
    }

    private emit(data: FlightData) {
        this.subscribers.forEach(cb => cb(data));
    }

    public subscribe(callback: FlightDataCallback): () => void {
        this.subscribers.add(callback);
        // Immediately send latest data upon subscription
        callback(this.mockData);
        return () => this.subscribers.delete(callback);
    }

    public shutdown() {
        if (this.mockInterval) {
            clearInterval(this.mockInterval);
            this.mockInterval = null;
        }
    }
}
