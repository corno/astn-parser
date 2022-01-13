import * as astn from "../../../interface"

export type ILocationState = {
    getCurrentLocation(): astn.Location
    getNextLocation(): astn.Location
    increase(character: number): void
}