// Product Service
class ProductService {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    // Get all products
    async getAllProducts() {
        try {
            const { data: products, error } = await this.supabase
                .from('products')
                .select('*')
                .order('category_id', { ascending: true });

            if (error) throw error;

            return { products, error: null };
        } catch (error) {
            console.error('Error fetching products:', error);
            return { products: null, error };
        }
    }

    // Get product by ID
    async getProductById(productId) {
        try {
            const { data: product, error } = await this.supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;

            return { product, error: null };
        } catch (error) {
            console.error('Error fetching product:', error);
            return { product: null, error };
        }
    }

    // Get products by category
    async getProductsByCategory(categoryId) {
        try {
            const { data: products, error } = await this.supabase
                .from('products')
                .select('*')
                .eq('category_id', categoryId)
                .order('name');

            if (error) throw error;

            return { products, error: null };
        } catch (error) {
            console.error('Error fetching products by category:', error);
            return { products: null, error };
        }
    }

    // Search products
    async searchProducts(searchTerm) {
        try {
            const { data: products, error } = await this.supabase
                .from('products')
                .select('*')
                .ilike('name', `%${searchTerm}%`)
                .order('name');

            if (error) throw error;

            return { products, error: null };
        } catch (error) {
            console.error('Error searching products:', error);
            return { products: null, error };
        }
    }
}

// Create product service instance
const productService = new ProductService(supabaseClient);
