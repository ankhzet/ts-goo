import type {
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute,
    HasManyGetAssociationsMixin,
    HasManySetAssociationsMixin,
} from '@sequelize/core';
import { sql, DataTypes, Sequelize, Model } from '@sequelize/core';
import { Attribute, PrimaryKey, Default, NotNull, HasMany } from '@sequelize/core/decorators-legacy';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const LAYER_TYPES = ['copper', 'silkscreen', 'adhesive', 'paste', 'mask', 'drill', 'cuts'] as const;
export type LayerType = 'copper' | 'silkscreen' | 'adhesive' | 'paste' | 'mask' | 'drill' | 'cuts';

export type IBoard = InferAttributes<Board> & { layers: NonAttribute<ILayer[]> };
export type ILayer = InferAttributes<Layer>;

Array.prototype.toSorted = function (c: (a: any, b: any) => number) {
    return this.slice().sort(c);
}

const root = path.resolve('public');

const PATH_TEMPLATES = {
    board: 'boards/$0.$1',
    layer: 'boards/$0/layers/$1.$2',
};

const makeTemplatedPath = (template: string, identifiers: string[]) => {
    return template.replace(/\$(\d+)/g, (_, idx) => {
        const index = +idx || 0;
        const value = identifiers[index];

        if (value) {
            return value.replace(/\W/g, '');
        }

        return randomUUID();
    });
}
const makeUploadPath = (type: 'preview', template: string, identifiers: string[]) => {
    switch (type) {
        case 'preview':
            return path.join('/media/preview', makeTemplatedPath(template, identifiers || []));

        default:
            throw new Error(`Unknown upload type "${type}"`);
    }
};

export const makeAssetPath = (pathname: string) => path.join(root, pathname);

export class Board extends Model<IBoard, InferCreationAttributes<Board>> {
    @Attribute(DataTypes.UUID)
    @PrimaryKey()
    @Default(sql.uuidV4)
    declare id: CreationOptional<string>;

    @Attribute(DataTypes.STRING(255))
    @NotNull
    declare name: string;

    @Attribute(DataTypes.STRING(255))
    @NotNull
    declare preview: string;

    @Attribute(DataTypes.VIRTUAL(DataTypes.STRING, ['id', 'preview']))
    get previewUrl(): string {
        return makeUploadPath('preview', PATH_TEMPLATES.board, [this.id, path.extname(this.preview).replace(/^\./, '')]);
    }

    @Attribute(DataTypes.DATE)
    declare createdAt: Date;

    @HasMany(() => Layer, { foreignKey: 'boardId', inverse: { as: 'board' } })
    declare layers: NonAttribute<Layer[]>;

    declare getLayers: HasManyGetAssociationsMixin<Layer>;
    declare setLayers: HasManySetAssociationsMixin<Layer, Layer['id']>;
}

export class Layer extends Model<ILayer, InferCreationAttributes<Layer>> {
    @Attribute(DataTypes.UUID)
    @PrimaryKey()
    @Default(sql.uuidV4)
    declare id: CreationOptional<string>;

    @Attribute(DataTypes.UUID)
    @NotNull
    declare boardId: string;
    declare board: NonAttribute<Board>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare index: number;

    @Attribute(DataTypes.BOOLEAN)
    @Default(false)
    declare enabled: boolean;

    @Attribute(DataTypes.STRING(255))
    @NotNull
    declare type: LayerType;

    @Attribute(DataTypes.STRING(255))
    @NotNull
    declare name: string;

    @Attribute(DataTypes.STRING(255))
    @NotNull
    declare geometry: string;

    @Attribute(DataTypes.VIRTUAL(DataTypes.STRING, ['boardId', 'id']))
    get geometryUrl(): string {
        return makeUploadPath('preview', PATH_TEMPLATES.layer, [this.boardId, this.id, path.extname(this.geometry).replace(/^\./, '')]);
    }
}

export const db = new Sequelize({
    database: 'goo',
    dialect: 'sqlite',
    storage: '.data/database.sqlite',
    models: [Board, Layer],
});

// await db.sync({});
