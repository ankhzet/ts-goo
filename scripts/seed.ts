import { db } from '../models';

const seed = async <T, R>(key: string, klass: { create: (data: T) => Promise<R> }, data: T[]) => {
    try {
        const result = await Promise.all(
            data.map((item) => klass.create(item)),
        );

        console.log(`Seeded ${result.length} ${key}`);

        return result;
    } catch (error) {
        console.error(`Error seeding ${key}:`, error);
        throw error;
    }
}

// async function seedX() {
//     return seed('x', X, xs);
// }

try {
    await db.sync({ force: true });

    // await seedX();
} catch (e) {
    console.error(e);
    process.exit(1);
}
