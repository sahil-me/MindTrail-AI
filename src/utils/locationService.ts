import { EntryLocation } from '../types';

/**
 * Search places by keyword query with friendly place results.
 * Allows users to explicitly search for and select a place if they want to attach a location.
 */
export async function searchPlaces(query: string): Promise<EntryLocation[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=5`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    if (res.ok) {
      const list = await res.json();
      return list.map((item: any) => ({
        name: item.name || item.display_name?.split(',')[0] || trimmed,
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        placeId: String(item.place_id || ''),
      }));
    }
  } catch (err) {
    console.warn('[Search places error]:', err);
  }

  // If network search fails or is blocked, provide the typed query as a valid place
  return [
    {
      name: trimmed,
      address: trimmed,
    },
  ];
}
