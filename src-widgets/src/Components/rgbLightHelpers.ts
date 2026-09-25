/**
 * What the switches widget needs of the RGB light: the names of the states of a lamp, the roles they are found
 * by, and the color of a temperature in Kelvin.
 *
 * The RGB light itself moved into vis-2 (the set `devices`); these parts stayed here, because `Switches` shows
 * a lamp as one of its lines.
 */

export type RGB_NAMES_TYPE =
    | 'switch'
    | 'brightness'
    | 'rgb'
    | 'red'
    | 'green'
    | 'blue'
    | 'white'
    | 'color_temperature'
    | 'hue'
    | 'saturation'
    | 'luminance'
    | 'white_mode';

export const RGB_ROLES: { [role: string]: RGB_NAMES_TYPE } = {
    'switch.light': 'switch',
    switch: 'switch',
    'level.brightness': 'brightness',
    'level.dimmer': 'brightness',
    'level.color.red': 'red',
    'level.color.green': 'green',
    'level.color.blue': 'blue',
    'level.color.white': 'white',
    'level.color.rgb': 'rgb',
    'level.color.hue': 'hue',
    'level.color.saturation': 'saturation',
    'level.color.luminance': 'luminance',
    'level.color.temperature': 'color_temperature',
};

// From http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/

// Start with a temperature, in Kelvin, somewhere between 1000 and 40000.  (Other values may work,
//  but I can't make any promises about the quality of the algorithm's estimates above 40000 K.)
function limit(x: number, min: number, max: number): number {
    if (x < min) {
        return min;
    }
    if (x > max) {
        return max;
    }

    return x;
}

export const colorTemperatureToRGB = (kelvin: number): { red: number; green: number; blue: number } => {
    const temp = kelvin / 100;

    let red;
    let green;
    let blue;

    if (temp <= 66) {
        red = 255;

        green = temp;
        green = 99.4708025861 * Math.log(green) - 161.1195681661;

        if (temp <= 19) {
            blue = 0;
        } else {
            blue = temp - 10;
            blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
        }
    } else {
        red = temp - 60;
        red = 329.698727446 * red ** -0.1332047592;

        green = temp - 60;
        green = 288.1221695283 * green ** -0.0755148492;

        blue = 255;
    }

    return {
        red: limit(red, 0, 255),
        green: limit(green, 0, 255),
        blue: limit(blue, 0, 255),
    };
};

export const RGB_NAMES: RGB_NAMES_TYPE[] = [
    'switch',
    'brightness',
    'rgb',
    'red',
    'green',
    'blue',
    'white',
    'color_temperature',
    'hue',
    'saturation',
    'luminance',
    'white_mode',
];
