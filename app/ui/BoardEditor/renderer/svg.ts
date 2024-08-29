import { Color, DoubleSide, Material, MeshBasicMaterial } from 'three';

export const isLike = <T>(value: unknown | T): value is T => {
    return !!value;
};

type Units =
    | 'unknown'
    | 'number'
    | 'percentage'
    | 'ems'
    | 'exs'
    | 'px'
    | 'cm'
    | 'mm'
    | 'in'
    | 'pt'
    | 'pc';

const LENGTHS = {
    SVG_LENGTHTYPE_UNKNOWN: 0,
    SVG_LENGTHTYPE_NUMBER: 1,
    SVG_LENGTHTYPE_PERCENTAGE: 2,
    SVG_LENGTHTYPE_EMS: 3,
    SVG_LENGTHTYPE_EXS: 4,
    SVG_LENGTHTYPE_PX: 5,
    SVG_LENGTHTYPE_CM: 6,
    SVG_LENGTHTYPE_MM: 7,
    SVG_LENGTHTYPE_IN: 8,
    SVG_LENGTHTYPE_PT: 9,
    SVG_LENGTHTYPE_PC: 10,
}

const UNIT_MAP: Record<number, Units> = {
    [LENGTHS.SVG_LENGTHTYPE_UNKNOWN]: 'px',
    [LENGTHS.SVG_LENGTHTYPE_NUMBER]: 'px',
    [LENGTHS.SVG_LENGTHTYPE_PERCENTAGE]: 'percentage',
    [LENGTHS.SVG_LENGTHTYPE_EMS]: 'ems',
    [LENGTHS.SVG_LENGTHTYPE_EXS]: 'exs',
    [LENGTHS.SVG_LENGTHTYPE_PX]: 'px',
    [LENGTHS.SVG_LENGTHTYPE_CM]: 'cm',
    [LENGTHS.SVG_LENGTHTYPE_MM]: 'mm',
    [LENGTHS.SVG_LENGTHTYPE_IN]: 'in',
    [LENGTHS.SVG_LENGTHTYPE_PT]: 'pt',
    [LENGTHS.SVG_LENGTHTYPE_PC]: 'pc',
};

const ppi = 96;
const pppt = 72;
const mmpi = 25.4;
const ppmm = ppi / mmpi;
const units = 'mm';
const valueToPixels = (value: number, units: Units) => {
    switch (units) {
        case 'unknown':
        case 'number':
        case 'px': return value;
        case 'pt': return value * pppt;
        case 'mm': return value * ppmm;
        case 'cm': return value * ppmm * 10;
        case 'in': return value * ppi;
        default: throw new Error(`Can't convert ${value} ${units} to pixels`);
    }
}

export const convertLength = (value: number, units: Units, to: Units) => {
    if (!value) {
        return 0;
    }

    if (units === 'percentage' && value === 100) {
        return 100;
    }

    if (units !== 'px') {
        value = valueToPixels(value, units);
    }

    return value / valueToPixels(1, to);
};

export const getLengthFromSVGLength = (l: SVGAnimatedLength) => convertLength(
    l.baseVal.valueInSpecifiedUnits,
    UNIT_MAP[l.baseVal.unitType] || 'px',
    units,
);

export const makeMaterials = () => {
    const materials: Record<string, Material> = {};
    const hash = (color: Color, opacity?: number) => `${color.getHex()}-${opacity || 1}`;

    return (colorStr: string, opacity?: number) => {
        if (colorStr === undefined || colorStr === 'none' || opacity === 0) {
            return;
        }

        const color = new Color().setStyle(colorStr);
        const key = hash(color, opacity);
        let got = materials[key];

        if (!got) {
            const isBlack = !color.getHex();
            got = new MeshBasicMaterial({
                color,
                opacity: isBlack ? 0.2 : opacity,
                transparent: true,
                side: DoubleSide,
                depthWrite: false,
                // wireframe: isBlack,
            });

            materials[key] = got;
        }

        return got;
    };
}
