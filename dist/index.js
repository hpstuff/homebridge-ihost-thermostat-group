import { PLATFORM_NAME } from "./settings";
import { ThermostatGroupHomebridgePlatform } from "./platform";
/**
 * This method registers the platform with Homebridge
 */
export default (api) => {
    api.registerPlatform(PLATFORM_NAME, ThermostatGroupHomebridgePlatform);
};
//# sourceMappingURL=index.js.map