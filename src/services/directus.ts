interface Recipe {
  id: string | number;
  title: string;
  // Add other recipe fields you expect to receive
  short_description?: string;
  slug?: string;
}

interface DirectusResponse<T> {
  data: T[];
  // We can add meta if needed for pagination later
  // meta?: { total_count: number; filter_count: number };
}

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL;

if (!DIRECTUS_URL) {
  throw new Error(
    "PUBLIC_DIRECTUS_URL is not set in your environment variables. Please check your .env file."
  );
}

export async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/recipes`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty object
      console.error("Directus API Error Status:", response.status);
      console.error("Directus API Error Response:", errorData);
      throw new Error(
        `Failed to fetch recipes. Status: ${response.status}. Response: ${JSON.stringify(errorData)}`
      );
    }

    const result: DirectusResponse<Recipe> = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching recipes from Directus:", error);
    // Re-throw the error or return an empty array/specific error object
    // For now, re-throwing to make it clear on the page that something went wrong.
    throw error;
  }
}

// Example of how you might fetch a single recipe by ID (if needed later)
// export async function fetchRecipeById(id: string | number): Promise<Recipe | null> {
//   try {
//     const response = await fetch(`${DIRECTUS_URL}/items/recipes/${id}`);
//     if (!response.ok) {
//       // ... error handling ...
//       return null;
//     }
//     const result: { data: Recipe } = await response.json();
//     return result.data;
//   } catch (error) {
//     console.error(`Error fetching recipe ${id}:`, error);
//     return null;
//   }
// } 