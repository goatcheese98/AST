interface Recipe {
  id: string | number;
  title: string;
  cuisine?: string;
  prep_time?: string;
  cook_time?: string;
  image?: string; // Assuming image is an ID to an asset
  // Add other recipe fields you expect to receive
  short_description?: string;
  slug?: string;
}

interface DirectusAsset {
  id: string;
  // Add other asset fields if needed, like title, description, etc.
}

interface DirectusResponse<T> {
  data: T;
}
interface DirectusResponseArray<T> {
  data: T[];
}

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL;
const DIRECTUS_TOKEN = import.meta.env.PUBLIC_DIRECTUS_STATIC_TOKEN; // Optional static token

if (!DIRECTUS_URL) {
  throw new Error(
    "PUBLIC_DIRECTUS_URL is not set in your environment variables. Please check your .env file."
  );
}

export default class DirectusService {
  private apiUrl: string;
  private headers: Headers;

  constructor() {
    this.apiUrl = DIRECTUS_URL;
    this.headers = new Headers({
      'Content-Type': 'application/json',
    });
    if (DIRECTUS_TOKEN) {
      this.headers.append('Authorization', `Bearer ${DIRECTUS_TOKEN}`);
    }
    console.log('DirectusService initialized. API URL:', this.apiUrl, 'Token set:', !!DIRECTUS_TOKEN);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: this.headers,
    });

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use text
        errorData = { message: await response.text() };
      }
      console.error("Directus API Error Status:", response.status);
      console.error("Directus API Error Response:", errorData);
      throw new Error(
        `Directus API request failed to ${endpoint}. Status: ${response.status}. Response: ${JSON.stringify(errorData)}`
      );
    }
    return response.json() as Promise<T>;
  }

  async getRecipes(): Promise<Recipe[]> {
    console.log('Fetching recipes from Directus...');
    try {
      // Adjust fields as needed, e.g., '?fields=id,title,slug,image,cuisine,prep_time,cook_time'
      const result = await this.request<DirectusResponseArray<Recipe>>('/items/recipes?fields=*,image.id');
      console.log('Successfully fetched recipes:', result.data.length);
      return result.data;
    } catch (error) {
      console.error("Error in DirectusService getRecipes:", error);
      throw error; // Re-throw to be handled by the caller
    }
  }

  getAssetUrl(assetId: string): string {
    if (!assetId) return '';
    return `${this.apiUrl}/assets/${assetId}`;
  }

  // Example for fetching a single item - adapt as needed
  // async getRecipeById(id: string | number): Promise<Recipe | null> {
  //   try {
  //     const result = await this.request<DirectusResponse<Recipe>>(`/items/recipes/${id}`);
  //     return result.data;
  //   } catch (error) {
  //     console.error(`Error fetching recipe ${id}:`, error);
  //     return null;
  //   }
  // }
} 