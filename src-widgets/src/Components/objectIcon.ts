/** What an object has to carry for its icon to be found */
export interface ObjectWithIcon {
    type?: string;
    common?: { icon?: string; name?: ioBroker.StringOrTranslated } | null;
}

/**
 * Where the browser finds the icon of an object, seen from a page of vis-2.
 *
 * An adapter writes `common.icon` relative to its own admin files: `icons/shellyplugsg3.png` of a shelly device
 * lies in `/adapter/shelly/icons/`. Taken as it is, the browser looks for it next to the page, under
 * `/vis-2/icons/`, and finds nothing - the widget shows a broken image.
 *
 * @param obj - the object that carries the icon
 * @param id - its id: the adapter is the first part of it, or the third of a `system.adapter.*` id
 * @param imagePrefix - the way from the page to the root of the web server
 * @returns the address of the icon, the icon itself when it needs none, or null when there is no icon
 */
export function getObjectIcon(
    obj: ObjectWithIcon | null | undefined,
    id: string,
    imagePrefix = '../..',
): string | null {
    if (!obj?.common?.icon || typeof obj.common.icon !== 'string') {
        return null;
    }
    const common = obj.common;
    const icon = obj.common.icon;
    // nothing to look for: a character that is drawn as text, a picture of its own, or an address of its own
    if (icon.length < 3 || icon.startsWith('data:') || /^https?:\/\//.test(icon)) {
        return icon;
    }
    // no file
    if (!icon.includes('.')) {
        return null;
    }

    let adapter: string;
    if ((obj.type === 'instance' || obj.type === 'adapter') && typeof common.name === 'string') {
        adapter = common.name;
    } else if (id.startsWith('system.adapter.')) {
        adapter = id.split('.')[2];
    } else {
        adapter = id.split('.')[0];
    }

    return `${imagePrefix}/adapter/${adapter}${icon.startsWith('/') ? '' : '/'}${icon}`;
}
