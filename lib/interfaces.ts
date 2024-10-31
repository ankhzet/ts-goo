export interface Vec2<T> {
    x: T;
    y: T;
}

export interface Vec3<T> {
    x: T;
    y: T;
    z: T;
}

export type GlobalConfig<T> = {
    bottom: T;
    common: T;
};

export type LiftRetract<T> = {
    lift: T;
    retract: T;
}

export type Motions<T> = {
    first: T;
    second: T;
};

/**
 * Motion timings, in seconds
 */
export interface MotionTimes {
    before: {
        lift: number; // 4b float, s
    };
    after: {
        lift: number; // 4b float, s
        retract: number; // 4b float, s
    };
}

export type LayerTimings = GlobalConfig<MotionTimes>;

export type MotionConfig = {
    // 4b float
    distance: number;
    // 4b float
    speed: number;
};

export type GlobalLiftRetract = LiftRetract<GlobalConfig<MotionConfig>>;
export type GlobalLayerMotions = Motions<GlobalLiftRetract>;
export type LayerMotions = LiftRetract<Motions<MotionConfig>>;

export type PWM = GlobalConfig<number>; // 2*2b short int, 0~255

export type GooLayersConfig = {
    // 4b float, mm
    thickness: number;
    // 4b float, s
    commonExposure: number;
    // 1b, false - TurnOffTime, true - StaticTime
    exposureDelay: boolean;
    // 4b float, s
    turnOffTime: number;
    timings: LayerTimings;
    // 4b float, s
    bottomExposure: number;
    // 4b int
    bottomLayers: number;
    // 2b short int
    transitionLayers: number;
    // 1b, false - normal, true - use Layer Definition Content
    advance: boolean;
    motions: GlobalLayerMotions;
    pwm: PWM;
};

export type GooSummary = {
    // 4b int, s
    time: number;
    // 4b float, mm3
    volume: number;
    // 4b float, g
    weight: number;
    // 4b float
    price: number;
    // 8b
    currency: string;
};

export type SliceTransform = {
    invert: boolean;
    translate: Vec2<number>;
    scale: Vec2<number>;
    rotate: {
        angle: number; // 0-360
        origin: Vec2<number>;
    };
};

export type PrinterDefinition = {
    name: string;
    type: string;
    resolution: Vec2<number>;
    mirror: Vec2<boolean>;
    platform: Vec3<number>;
    resinProfile: string; // 32b

    grayscale: boolean; // 1b, false - (0x00 ~ 0x01), true - (0x00 ~ 0xFF)
    antialiasing: number; // 2b short int
    gray: number; // 2b short int
    blur: number; // 2b short int
};

export type ImageChannels = 1|2|3|4;
export type ImageDescriptor = string | {
    buffer: Buffer;
    channels: ImageChannels;
};

export type GooPreview = {
    dimensions: Vec2<number>;
    input: ImageDescriptor;
};

export type GooHeader = {
    date: Date;
    generator?: {
        description: string;
        version: string;
    };
    printer: PrinterDefinition;
    // RGB_565 { 2*116*116, Delimiter, 2*290*290, Delimiter }
    previews: GooPreview[];
    layers: number; // 4b
    layerConfig: GooLayersConfig;
    summary: GooSummary;
    next?: number;
};

export type LayerDefinition = {
    pause: {
        mode: number; // 2b short int, 0 - reserved, 1 - current layer pause
        z: number; // 4b float, mm
    };
    z: number; // 4b float, mm
    exposure: number; // 4b float, s
    offTime: number; // 4b float, s (when Exposure delay mode is 'false')
    times: MotionTimes;
    motions: LayerMotions;
    pwm: number; // 2b short int, 0 ~ 255
};

/*
type:
    00 - all 0x00
    01 - gray
    10 - diff
    11 - all 0xff
length (if type !== diff):
    00 - 4bit b0[3:0]
    01 - 12bit b1[7:0] b0[3:0]
    10 - 20bit b1[7:0] b2[7:0] b0[3:0]
    11 - 28bit
diff:
    00 - b0[3:0] diff value is positive diff (cur - prev > 0)
    01 - b0[3:0] is positive diff, b1[7:0] is run length
    10 - b0[3:0] diff value is negative diff (cur - prev < 0)
    11 - b0[3:0] is negative diff, b1[7:0] is run length
 */
export type ChunkData =
    | {
        type: number; // b0[7:6]
        length: number; // b0[5:4]
    } | {
        type: number;
        diff: number;
    };

export type GooLayer = {
    definition: LayerDefinition;
    slice: ImageDescriptor;
    transform?: SliceTransform;
};

export type Goo = {
    header: GooHeader;
    layers: GooLayer[];
}
