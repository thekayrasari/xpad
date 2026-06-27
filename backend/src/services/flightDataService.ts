import { open, Protocol, SimConnectDataType, SimConnectConstants, SimConnectPeriod, SimConnectConnection } from 'node-simconnect';

export interface FlightData {
    altitude: number;
    latitude: number;
    longitude: number;
    heading: number;
    airspeed: number;
    com1: string;
    com2: string;
}

export type FlightDataCallback = (data: FlightData) => void;

export class FlightDataService {
    private subscribers = new Set<FlightDataCallback>();
    private handle: SimConnectConnection | null = null;
    private currentData: FlightData = {
        altitude: 0,
        latitude: 0,
        longitude: 0,
        heading: 0,
        airspeed: 0,
        com1: "122.800",
        com2: "122.800"
    };

    private REQUEST_ID = 1;
    private DEFINITION_ID = 1;
    private EVENT_ID_SET_COM = 1;

    constructor() {
        console.log("Initializing FlightDataService with MSFS SimConnect.");
        this.connect();
    }

    private formatFrequency(mhz: number): string {
        // e.g. 122.8 -> "122.800"
        return mhz.toFixed(3);
    }

    private connect() {
        open('xPad EFB', Protocol.FSX_SP2)
            .then(({ recvOpen, handle }) => {
                console.log('Connected to MSFS:', recvOpen.applicationName);
                this.handle = handle;

                handle.on('exception', (ex: any) => console.error('SimConnect exception:', ex));
                handle.on('quit', () => {
                    console.log('MSFS quit');
                    this.handle = null;
                    setTimeout(() => this.connect(), 5000); // Reconnect loop
                });
                handle.on('close', () => {
                    console.log('SimConnect connection closed');
                    this.handle = null;
                    setTimeout(() => this.connect(), 5000);
                });

                handle.mapClientEventToSimEvent(this.EVENT_ID_SET_COM, 'COM_RADIO_SET_HZ');

                // Request data definitions
                handle.addToDataDefinition(this.DEFINITION_ID, 'PLANE ALTITUDE', 'feet', SimConnectDataType.FLOAT64);
                handle.addToDataDefinition(this.DEFINITION_ID, 'PLANE LATITUDE', 'degrees', SimConnectDataType.FLOAT64);
                handle.addToDataDefinition(this.DEFINITION_ID, 'PLANE LONGITUDE', 'degrees', SimConnectDataType.FLOAT64);
                handle.addToDataDefinition(this.DEFINITION_ID, 'PLANE HEADING DEGREES TRUE', 'degrees', SimConnectDataType.FLOAT64);
                handle.addToDataDefinition(this.DEFINITION_ID, 'AIRSPEED INDICATED', 'knots', SimConnectDataType.FLOAT64);
                handle.addToDataDefinition(this.DEFINITION_ID, 'COM ACTIVE FREQUENCY:1', 'MHz', SimConnectDataType.FLOAT64);
                handle.addToDataDefinition(this.DEFINITION_ID, 'COM ACTIVE FREQUENCY:2', 'MHz', SimConnectDataType.FLOAT64);

                handle.requestDataOnSimObject(this.REQUEST_ID, this.DEFINITION_ID, SimConnectConstants.OBJECT_ID_USER, SimConnectPeriod.SIM_FRAME);

                handle.on('simObjectData', (recvSimObjectData: any) => {
                    if (recvSimObjectData.requestID === this.REQUEST_ID) {
                        try {
                            this.currentData = {
                                altitude: recvSimObjectData.data.readFloat64(),
                                latitude: recvSimObjectData.data.readFloat64(),
                                longitude: recvSimObjectData.data.readFloat64(),
                                heading: recvSimObjectData.data.readFloat64(),
                                airspeed: recvSimObjectData.data.readFloat64(),
                                com1: this.formatFrequency(recvSimObjectData.data.readFloat64()),
                                com2: this.formatFrequency(recvSimObjectData.data.readFloat64()),
                            };
                            this.emit(this.currentData);
                        } catch (e) {
                            console.error('Error parsing SimConnect data:', e);
                        }
                    }
                });

            })
            .catch((error: any) => {
                console.log('SimConnect connection failed, retrying in 5 seconds...');
                setTimeout(() => this.connect(), 5000);
            });
    }

    private emit(data: FlightData) {
        this.subscribers.forEach(cb => cb(data));
    }

    public subscribe(callback: FlightDataCallback): () => void {
        this.subscribers.add(callback);
        // Immediately send latest data upon subscription
        callback({ ...this.currentData });
        return () => this.subscribers.delete(callback);
    }

    public tuneCom1(frequencyMhz: number) {
        if (!this.handle) return;
        const freqHz = Math.round(frequencyMhz * 1000000);
        this.handle.transmitClientEvent(SimConnectConstants.OBJECT_ID_USER, this.EVENT_ID_SET_COM, freqHz, 1, 0);
    }

    public shutdown() {
        if (this.handle) {
            // No explicit close exposed easily, GC will handle it if we drop refs, or we can leave it
        }
    }
}
