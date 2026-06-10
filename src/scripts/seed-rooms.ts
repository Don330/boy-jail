import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import outputs from '../../amplify_outputs.json';
import type { Schema } from '../../amplify/data/resource';

Amplify.configure(outputs);
const client = generateClient<Schema>({ authMode: 'userPool' });

const ROOMS = [
  {
    id: 'max-security',
    name: 'Maximum Security',
    x: 55, y: 55, width: 430, height: 400,
    capacity: 10,
    acceptsBoys: true,
  },
  {
    id: 'general-population',
    name: 'General Population',
    x: 490, y: 55, width: 555, height: 400,
    capacity: null,
    acceptsBoys: true,
  },
  {
    id: 'psych-ward',
    name: 'Psych Ward',
    x: 1050, y: 55, width: 435, height: 400,
    capacity: 8,
    acceptsBoys: true,
  },
  {
    id: 'death-row',
    name: 'Death Row',
    x: 55, y: 460, width: 430, height: 180,
    capacity: 6,
    acceptsBoys: true,
  },
  {
    id: 'solitary-confinement',
    name: 'Solitary Confinement',
    x: 1050, y: 460, width: 435, height: 255,
    capacity: 8,
    acceptsBoys: true,
  },
  {
    id: 'staff-office',
    name: 'Staff Office',
    x: 490, y: 460, width: 170, height: 315,
    capacity: null,
    acceptsBoys: false,
  },
  {
    id: 'processing',
    name: 'Processing',
    x: 665, y: 460, width: 200, height: 315,
    capacity: null,
    acceptsBoys: true,
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    x: 870, y: 460, width: 175, height: 315,
    capacity: null,
    acceptsBoys: true,
  },
  {
    id: 'yard',
    name: 'Yard',
    x: 55, y: 645, width: 430, height: 325,
    capacity: null,
    acceptsBoys: true,
  },
  {
    id: 'day-release',
    name: 'Day Release',
    x: 1050, y: 720, width: 435, height: 250,
    capacity: null,
    acceptsBoys: true,
  },
];

async function seed() {
  console.log('Checking for existing rooms...');
  const { data: existing } = await client.models.Room.list();
  if (existing && existing.length > 0) {
    console.log(`Found ${existing.length} existing rooms. Deleting...`);
    await Promise.all(existing.map((r) => client.models.Room.delete({ id: r.id })));
  }

  console.log('Seeding rooms...');
  for (const room of ROOMS) {
    const { data, errors } = await client.models.Room.create(room);
    if (errors?.length) {
      console.error(`Failed to create ${room.name}:`, errors);
    } else {
      console.log(`✓ ${data?.name}`);
    }
  }
  console.log('Done.');
}

seed().catch(console.error);
