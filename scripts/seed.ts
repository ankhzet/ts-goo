import bcrypt from 'bcrypt';

import { invoices, customers, revenue, users } from '../app/lib/placeholder-data.js';
import { User, Invoice, Customer, Revenue, db } from '../models';

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

async function seedUsers() {
    return seed('users', User, await Promise.all(users.map(async (data) => ({
        ...data,
        password: await bcrypt.hash(data.password, 10),
    }))));
}

async function seedInvoices() {
    return seed('invoices', Invoice, invoices);
}

async function seedCustomers() {
    return seed('customers', Customer, customers);
}

async function seedRevenue() {
    return seed('revenue', Revenue, revenue);
}

try {
    await db.sync({ force: true });

    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
} catch (e) {
    console.error(e);
    process.exit(1);
}
