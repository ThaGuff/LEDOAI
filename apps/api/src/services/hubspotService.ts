import axios from 'axios'

const HUBSPOT_BASE = 'https://api.hubapi.com'

interface ContactData {
  firstName?: string
  lastName?: string
  phone: string
  email?: string
  notes?: string
  source?: string
}

export async function upsertHubSpotContact(contact: ContactData): Promise<string | null> {
  const apiKey = process.env.HUBSPOT_API_KEY
  if (!apiKey) {
    console.warn('HubSpot API key not configured')
    return null
  }

  try {
    // Search for existing contact by phone
    const searchRes = await axios.post(
      `${HUBSPOT_BASE}/crm/v3/objects/contacts/search`,
      {
        filterGroups: [{
          filters: [{ propertyName: 'phone', operator: 'EQ', value: contact.phone }],
        }],
        properties: ['firstname', 'lastname', 'phone', 'email'],
        limit: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const properties: Record<string, string> = {
      phone: contact.phone,
    }
    if (contact.firstName) properties.firstname = contact.firstName
    if (contact.lastName) properties.lastname = contact.lastName
    if (contact.email) properties.email = contact.email
    if (contact.notes) properties.hs_lead_status = 'NEW'

    if (searchRes.data.total > 0) {
      // Update existing contact
      const existingId = searchRes.data.results[0].id
      await axios.patch(
        `${HUBSPOT_BASE}/crm/v3/objects/contacts/${existingId}`,
        { properties },
        { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
      )
      return existingId
    } else {
      // Create new contact
      const createRes = await axios.post(
        `${HUBSPOT_BASE}/crm/v3/objects/contacts`,
        { properties },
        { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
      )
      return createRes.data.id
    }
  } catch (error: any) {
    console.error('HubSpot upsert error:', error?.response?.data || error.message)
    return null
  }
}

export async function createHubSpotNote(contactId: string, noteBody: string): Promise<void> {
  const apiKey = process.env.HUBSPOT_API_KEY
  if (!apiKey || !contactId) return

  try {
    // Create note (engagement)
    await axios.post(
      `${HUBSPOT_BASE}/crm/v3/objects/notes`,
      {
        properties: {
          hs_note_body: noteBody,
          hs_timestamp: Date.now().toString(),
        },
        associations: [{
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }],
        }],
      },
      { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('HubSpot note error:', error?.response?.data || error.message)
  }
}
