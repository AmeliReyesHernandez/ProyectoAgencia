
// using native fetch
// Node 18+ has native fetch.

async function testUpdate() {
    const API_URL = 'http://localhost:4000/api';

    console.log('--- Starting Reproduction Test ---');

    // 1. Create a Persona
    console.log('1. Creating Persona...');
    let personaId;
    try {
        const createRes = await fetch(`${API_URL}/personas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: 'TestUser',
                apellido_paterno: 'TestLastName',
                telefono: '555-1234'
            })
        });

        if (!createRes.ok) throw new Error(`Create failed: ${createRes.status} ${await createRes.text()}`);
        const createData = await createRes.json();
        personaId = createData.id;
        console.log(`   Created Persona ID: ${personaId}`);
    } catch (e) {
        console.error('Failed to create:', e.message);
        return;
    }

    // 2. Update a field (Standard Update)
    console.log('2. Updating Name to "TestUserUpdated"...');
    try {
        const updateRes = await fetch(`${API_URL}/personas/${personaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: 'TestUserUpdated'
            })
        });
        if (!updateRes.ok) throw new Error(`Update failed: ${updateRes.status} ${await updateRes.text()}`);
        const updateData = await updateRes.json();
        console.log(`   Update response: ${JSON.stringify(updateData)}`);

        // Check if updated
        if (updateData.persona.nombre === 'TestUserUpdated') {
            console.log('   SUCCESS: Name updated.');
        } else {
            console.error('   FAILURE: Name did NOT update.');
        }
    } catch (e) {
        console.error('Failed to update:', e.message);
    }

    // 3. Attempt to Clear a field (e.g. telefono)
    console.log('3. Clearing Phone Number (sending empty string)...');
    try {
        const clearRes = await fetch(`${API_URL}/personas/${personaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telefono: ''
            })
        });
        if (!clearRes.ok) throw new Error(`Clear failed: ${clearRes.status} ${await clearRes.text()}`);
        const clearData = await clearRes.json();

        // Check if cleared
        if (clearData.persona.telefono === null || clearData.persona.telefono === '') {
            console.log('   SUCCESS: Phone cleared.');
        } else {
            console.error(`   FAILURE: Phone did NOT clear. Current value: "${clearData.persona.telefono}"`);
        }
    } catch (e) {
        console.error('Failed to clear:', e.message);
    }

    // Cleanup
    console.log('4. Cleaning up...');
    await fetch(`${API_URL}/personas/${personaId}`, { method: 'DELETE' });
    console.log('   Deleted test persona.');
}

testUpdate();
