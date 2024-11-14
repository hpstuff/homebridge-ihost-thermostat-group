import { PlatformAccessory, CharacteristicValue } from "homebridge";
import { ThermostatGroupHomebridgePlatform } from "./platform";
export declare class ExamplePlatformAccessory {
    private readonly platform;
    private readonly accessory;
    private service;
    private temperatureDevice;
    private temperatureSwitch;
    private token;
    private host;
    private state;
    private maxTemp;
    private minTemp;
    private minStep;
    private pollInterval;
    constructor(platform: ThermostatGroupHomebridgePlatform, accessory: PlatformAccessory);
    _getStatus(): Promise<void>;
    setTargetTemperature(value: CharacteristicValue): Promise<void>;
    setTargetHeatingCoolingState(value: CharacteristicValue): Promise<void>;
}
