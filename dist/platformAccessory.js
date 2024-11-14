"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamplePlatformAccessory = void 0;
const axios_1 = __importDefault(require("axios"));
class ExamplePlatformAccessory {
    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        this.host = "http://ihost.local";
        this.state = {
            mode: 0,
            targetTemperature: 15,
        };
        this.validStates = [
            this.platform.Characteristic.TargetHeatingCoolingState.OFF,
            this.platform.Characteristic.TargetHeatingCoolingState.HEAT,
        ];
        this.maxTemp = 30;
        this.minTemp = 15;
        this.minStep = 0.5;
        this.pollInterval = 60;
        const { Characteristic, Service } = this.platform;
        this.temperatureDevice = this.accessory.context.device.sensor;
        this.temperatureSwitch = this.accessory.context.device.switch;
        this.token = this.accessory.context.token;
        if (this.accessory.context.host)
            this.host = this.accessory.context.host;
        // set accessory information
        this.accessory
            .getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Manufacturer, "iHost")
            .setCharacteristic(Characteristic.Model, "iHost Thermostat Group")
            .setCharacteristic(Characteristic.SerialNumber, `${this.temperatureDevice}-${this.temperatureSwitch}`);
        this.platform.log.debug("Context:", this.accessory.context);
        this.service =
            this.accessory.getService(Service.Thermostat) ||
                this.accessory.addService(Service.Thermostat);
        this.service.setCharacteristic(Characteristic.Name, accessory.context.device.name);
        this.service
            .getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .updateValue(0);
        this.service
            .getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .onSet(this.setTargetHeatingCoolingState.bind(this));
        this.service
            .getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .setProps({
            validValues: this.validStates,
        });
        this.service
            .getCharacteristic(Characteristic.TargetTemperature)
            .onSet(this.setTargetTemperature.bind(this))
            .setProps({
            minValue: this.minTemp,
            maxValue: this.maxTemp,
            minStep: this.minStep,
        });
        this.service
            .getCharacteristic(Characteristic.TargetTemperature)
            .onGet(() => this.state.targetTemperature);
        this.service
            .getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .onGet(() => this.state.mode);
        this._getStatus();
        setInterval(() => {
            this._getStatus();
        }, this.pollInterval * 1000);
    }
    async _getStatus() {
        const { Characteristic } = this.platform;
        try {
            const res = await axios_1.default
                .get(`${this.host}/open-api/v1/rest/devices/${this.temperatureDevice}`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            })
                .then((res) => res.data);
            const temperature = res.data.state.temperature.temperature;
            this.platform.log.debug("TargetTemperature:", this.state.targetTemperature);
            this.platform.log.debug("TargetHeatingCoolingState:", this.state.mode);
            this.service
                .getCharacteristic(Characteristic.CurrentTemperature)
                .updateValue(temperature);
            if (this.state.mode === 1) {
                if (temperature <= this.state.targetTemperature - this.minStep) {
                    this.service
                        .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
                        .updateValue(Characteristic.CurrentHeatingCoolingState.HEAT);
                    await axios_1.default.put(`${this.host}/open-api/v1/rest/devices/${this.temperatureSwitch}`, {
                        state: {
                            power: {
                                powerState: "on",
                            },
                        },
                    }, { headers: { Authorization: `Bearer ${this.token}` } });
                }
                else if (temperature >= this.state.targetTemperature + this.minStep) {
                    this.service
                        .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
                        .updateValue(Characteristic.CurrentHeatingCoolingState.OFF);
                    await axios_1.default.put(`${this.host}/open-api/v1/rest/devices/${this.temperatureSwitch}`, {
                        state: {
                            power: {
                                powerState: "off",
                            },
                        },
                    }, { headers: { Authorization: `Bearer ${this.token}` } });
                }
            }
            else {
                await axios_1.default.put(`${this.host}/open-api/v1/rest/devices/${this.temperatureSwitch}`, {
                    state: {
                        power: {
                            powerState: "off",
                        },
                    },
                }, { headers: { Authorization: `Bearer ${this.token}` } });
            }
        }
        catch (e) {
            this.platform.log.error("Error getting device status:", e);
        }
    }
    async setTargetTemperature(value) {
        this.state.targetTemperature = value;
        this._getStatus();
        this.platform.log.debug("Set Characteristic TargetTemperature ->", value);
    }
    async setTargetHeatingCoolingState(value) {
        this.state.mode = value;
        this._getStatus();
        this.platform.log.debug("Set Characteristic TargetHeatingCoolingState ->", value);
    }
}
exports.ExamplePlatformAccessory = ExamplePlatformAccessory;
//# sourceMappingURL=platformAccessory.js.map