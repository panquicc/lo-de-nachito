
import { CreateBookingData } from '../src/lib/api/bookings';

const BASE_URL = 'http://localhost:3000/api/bookings';

// Mock data
const courtId = 'e2e4d5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f'; // Replace with a valid court ID from your DB
// You might need to fetch a valid court ID first if you don't have one hardcoded.
// For this script to work, we need a valid court_id. 
// I will try to fetch courts first if possible, or user needs to provide one.
// Let's assume we can fetch courts.

async function getFirstCourtId() {
    try {
        const res = await fetch('http://localhost:3000/api/courts');
        const courts = await res.json();
        if (courts && courts.length > 0) {
            return courts[0].id;
        }
        throw new Error('No courts found');
    } catch (e) {
        console.error('Error fetching courts:', e);
        return null;
    }
}

async function createBooking(data: any) {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return { status: res.status, body: await res.json() };
}

async function runTests() {
    console.log('Starting Recurrence Tests...');

    const courtId = await getFirstCourtId();
    if (!courtId) {
        console.error('Could not get a valid court ID. Aborting.');
        return;
    }
    console.log('Using Court ID:', courtId);

    // 1. Test Single Booking
    console.log('\n--- Test 1: Single Booking ---');
    const singleBooking = {
        court_id: courtId,
        start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Tomorrow + 1h
        status: 'PENDIENTE',
        amount: 1000,
        payment_method: 'EFECTIVO',
        cash_amount: 1000,
        mercado_pago_amount: 0,
        hour_price: 1000,
        deposit_amount: 0
    };

    const res1 = await createBooking(singleBooking);
    console.log('Status:', res1.status);
    if (res1.status === 200) {
        console.log('SUCCESS: Single booking created');
    } else {
        console.log('FAILURE:', res1.body);
    }

    // 2. Test Recurring Booking (Daily, 3 times)
    console.log('\n--- Test 2: Recurring Booking (3 days) ---');
    const startDate = new Date(Date.now() + 172800000); // Day after tomorrow
    const endDate = new Date(startDate.getTime() + 3600000);

    const recurringBooking = {
        ...singleBooking,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        recurrence: {
            frequency: 'DAILY',
            occurrences: 3
        }
    };

    const res2 = await createBooking(recurringBooking);
    console.log('Status:', res2.status);
    if (res2.status === 200) {
        console.log('SUCCESS: Recurring bookings created');
    } else {
        console.log('FAILURE:', res2.body);
    }

    // 3. Test Conflict
    console.log('\n--- Test 3: Conflict Detection ---');
    // Try to book the second day of the recurrence
    const conflictDate = new Date(startDate.getTime() + 86400000); // Day after start
    const conflictEnd = new Date(conflictDate.getTime() + 3600000);

    const conflictBooking = {
        ...singleBooking,
        start_time: conflictDate.toISOString(),
        end_time: conflictEnd.toISOString()
    };

    const res3 = await createBooking(conflictBooking);
    console.log('Status:', res3.status);
    if (res3.status === 409) {
        console.log('SUCCESS: Conflict correctly detected');
        console.log('Conflict Message:', res3.body.conflict?.message);
    } else {
        console.log('FAILURE: Expected 409, got', res3.status, res3.body);
    }
}

runTests();
