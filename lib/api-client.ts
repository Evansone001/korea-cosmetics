// API Client for Flask Backend Integration
// Uses NEXT_PUBLIC_API_URL for client-side browser calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000';

interface User {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
    phone?: string;
}
export interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
}

export interface StoreOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface StoreOrder {
  id: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  items?: StoreOrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreOrdersResponse {
  orders?: StoreOrder[];
}

export interface InventoryItem {
  product_id: string;
  product_name: string;
  stock_quantity: number;
  price: number;
  cost_price?: number;
  updated_at: string;
  reorder_level: number;
  category?: string;
  product_image?: string;
  ai_stockout_risk?: number;
  store_product_name?: string;
  store_description?: string;
}

export interface InventoryResponse {
  inventory?: InventoryItem[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp?: number;
  category: string;
  manufacturer?: string;
  brand?: string;
  images: string[];
  stock_quantity?: number;
  stock?: number; // for backward compatibility
  origin?: string;
  image_url?: string;
  status?: 'draft' | 'pending' | 'active' | 'inactive' | 'archived';
  in_stock?: boolean;
  featured?: boolean;
  slug?: string;
  store_id?: string;
  created_at?: string;
  updated_at?: string;
  alreadyAdded?: boolean;
}

export interface ProductsResponse {
  products?: Product[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface InventorySummary {
  total_products: number;
  low_stock: number;
}

export interface OrderStatsResponse {
  statistics?: {
    total_orders: number;
    total_revenue: number;
  };
}

export interface CustomerStatsResponse {
  total_customers: number;
}

export interface DashboardMetricsResponse {
  store_id: string;
  period: {
    current_month: { start: string; end: string };
    previous_month: { start: string; end: string };
  };
  metrics: {
    total_products: {
      current: number;
      current_month_added: number;
      previous_month_added: number;
      change: number;
      change_label: string;
    };
    total_orders: {
      current_month: number;
      previous_month: number;
      change: number;
      change_label: string;
    };
    total_revenue: {
      current_month: number;
      previous_month: number;
      change: number;
      change_label: string;
    };
    total_customers: {
      current_month: number;
      previous_month: number;
      change: number;
      change_label: string;
    };
  };
  top_products: Array<{
    id: string;
    product_id: string;
    name: string;
    category: string | null;
    price: number;
    sold_quantity: number;
    stock_quantity: number;
  }>;
  recent_orders: Array<{
    id: string;
    total: number;
    status: string;
    created_at: string | null;
    customer: { name: string; email: string | null } | null;
  }>;
}

export interface StoreCatalogProduct extends Product {
  store_price?: number;
  store_moq?: number;
  customer_type?: 'B2C' | 'B2B' | 'BOTH';
  warehouse_stock?: number;
  b2b_moq?: number;
}

export interface StoreCatalogResponse {
  products: StoreCatalogProduct[];
  store_customer_type: 'B2C' | 'B2B';
  total: number;
  limit: number;
  offset: number;
}

export interface WarehouseProduct extends Product {
  warehouse_stock: number;
  b2c_retail_price: number | null;
  b2b_wholesale_price: number | null;
  b2b_moq: number;
  customer_type: 'B2C' | 'B2B' | 'BOTH';
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'archived';
}

export interface WarehouseProductsResponse {
  products: WarehouseProduct[];
  total: number;
  limit: number;
  offset: number;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || API_BASE_URL;
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { suppressError?: boolean } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Get auth token from cookies
    const token = this.getAuthToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        let errorMessage = error.error || `HTTP ${response.status}: ${response.statusText}`;
        if (error.details) {
          errorMessage += `: ${JSON.stringify(error.details)}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (!options.suppressError) {
        console.error('API Request Error:', error);
      }
      throw error;
    }
  }

  private getAuthToken(): string | null {
    // Try to get token from cookies first
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
      if (authCookie) {
        return authCookie.split('=')[1];
      }
    }
    
    // Fallback to localStorage
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    
    return null;
  }

  private setAuthToken(token: string): void {
    // Set token in cookies
    if (typeof document !== 'undefined') {
      document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
    }
    
    // Also set in localStorage as fallback
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  }

  private removeAuthToken(): void {
    // Remove from cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
    
    // Remove from localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  }

  // Authentication endpoints
  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
    phone?: string;
  }): Promise<User> {
    const response = await this.request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token if registration successful
    if (response.access_token) {
      this.setAuthToken(response.access_token);
    }
    
    return response;
  }

  async login(credentials: {
    email: string;
    password: string;
  }) {
    const response = await this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token if login successful
    if (response.access_token) {
      this.setAuthToken(response.access_token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'DELETE' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeAuthToken();
    }
  }

  async verifyEmail(token: string) {
    return this.request('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(email: string) {
    return this.request('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  async refreshToken() {
    const response = await this.request<any>('/api/auth/refresh-token', {
      method: 'POST',
    });
    
    if (response.access_token) {
      this.setAuthToken(response.access_token);
    }
    
    return response;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  // Social authentication endpoints
  async getGoogleAuthUrl() {
    return `${this.baseURL}/api/auth/google`;
  }

  async getGitHubAuthUrl() {
    return `${this.baseURL}/api/auth/github`;
  }

  async linkSocialAccount(provider: 'google' | 'github', socialId: string) {
    return this.request('/api/auth/link-account', {
      method: 'POST',
      body: JSON.stringify({ provider, social_id: socialId }),
    });
  }

  async unlinkSocialAccount(provider: 'google' | 'github') {
    return this.request('/api/auth/unlink-account', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  }

  // Product endpoints
  async getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `/api/products${query ? `?${query}` : ''}`;

    return this.request<ProductsResponse>(endpoint);
  }

  async getProduct(id: string) {
    return this.request(`/api/products/${id}`);
  }

  // Store endpoints
  async getStores(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    const endpoint = `/api/stores${query ? `?${query}` : ''}`;
    
    return this.request(endpoint);
  }

  async getStore(id: string) {
    return this.request(`/api/stores/${id}`);
  }

  async createStore(storeData: any) {
    return this.request('/api/stores', {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
  }

  async updateStore(id: string, storeData: any) {
    return this.request(`/api/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(storeData),
    });
  }

  async deleteStore(id: string) {
    return this.request(`/api/stores/${id}`, {
      method: 'DELETE',
    });
  }

  // AI endpoints
  async getAIInsights(params: {
    entity_type?: string;
    entity_id?: string;
    category?: string;
    severity?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    const endpoint = `/api/ai/insights${query ? `?${query}` : ''}`;
    
    return this.request(endpoint);
  }

  async getAIForecasts(params: {
    entity_type?: string;
    entity_id?: string;
    forecast_type?: string;
    horizon_days?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    const endpoint = `/api/ai/forecasts${query ? `?${query}` : ''}`;
    
    return this.request(endpoint);
  }

  async getAIRecommendations(params: {
    user_id?: string;
    product_id?: string;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    const endpoint = `/api/ai/recommendations${query ? `?${query}` : ''}`;
    
    return this.request(endpoint);
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Helper method to get current user info (would need an endpoint for this)
  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Seller Orders endpoints
  async getStoreOrders(params: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<StoreOrdersResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    const query = searchParams.toString();
    return this.request<StoreOrdersResponse>(`/api/orders/store${query ? `?${query}` : ''}`);
  }

  async getWholesaleOrders(params: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<StoreOrdersResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    const query = searchParams.toString();
    return this.request<StoreOrdersResponse>(`/api/orders/store/wholesale${query ? `?${query}` : ''}`);
  }

  async getWholesaleOrderStats(days?: number): Promise<any> {
    const query = days ? `?days=${days}` : '';
    return this.request(`/api/orders/store/wholesale/stats${query}`);
  }

  async getOrder(orderId: string) {
    return this.request(`/api/orders/${orderId}`);
  }

  async fulfillOrder(orderId: string, trackingNumber?: string, carrier?: string) {
    return this.request(`/api/orders/${orderId}/fulfill`, {
      method: 'POST',
      body: JSON.stringify({ tracking_number: trackingNumber, carrier }),
    });
  }

  async getOrderStats(days?: number): Promise<OrderStatsResponse> {
    const query = days ? `?days=${days}` : '';
    return this.request<OrderStatsResponse>(`/api/orders/store/stats${query}`);
  }

  // Seller Inventory endpoints
  async getInventory(params: {
    low_stock?: boolean;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<InventoryResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    const query = searchParams.toString();
    return this.request<InventoryResponse>(`/api/inventory${query ? `?${query}` : ''}`);
  }

  async updateStock(storeProductId: string, stockQuantity: number) {
    return this.request(`/api/inventory/${storeProductId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stock_quantity: stockQuantity }),
    });
  }

  async updateStoreProduct(storeProductId: string, data: {
    store_product_name?: string;
    store_description?: string;
    price?: number;
    reorder_level?: number;
  }) {
    return this.request(`/api/inventory/${storeProductId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getStoreProductByProductId(productId: string): Promise<{
    store_product?: {
      store_product_name?: string;
      store_description?: string;
      price: number;
    };
    product?: Product;
  }> {
    return this.request(`/api/inventory/product/${productId}`);
  }

  async restockItem(storeProductId: string, quantity: number, notes?: string) {
    return this.request(`/api/inventory/${storeProductId}/restock`, {
      method: 'POST',
      body: JSON.stringify({ quantity, notes }),
    });
  }

  async getLowStockAlerts(): Promise<InventorySummary> {
    return this.request('/api/inventory/alerts');
  }

  async getInventorySummary(): Promise<InventorySummary> {
    return this.request('/api/inventory/summary');
  }

  // Seller Customers endpoints
  async getStoreCustomers(params: {
    limit?: number;
    offset?: number;
    min_orders?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    const query = searchParams.toString();
    return this.request(`/api/customers/store${query ? `?${query}` : ''}`);
  }

  async getCustomerDetails(customerId: string) {
    return this.request(`/api/customers/${customerId}`);
  }

  async getCustomerStats(): Promise<CustomerStatsResponse> {
    return this.request<CustomerStatsResponse>('/api/customers/stats');
  }

  // Seller Ratings endpoints
  async getStoreRatings(params: {
    limit?: number;
    offset?: number;
    min_rating?: number;
    max_rating?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    const query = searchParams.toString();
    return this.request(`/api/ratings/store${query ? `?${query}` : ''}`);
  }

  async getRatingsSummary() {
    return this.request('/api/ratings/summary');
  }

  async respondToRating(ratingId: string, response: string) {
    return this.request(`/api/ratings/${ratingId}/response`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  // Seller Wholesale endpoints
  async getWholesaleTiers() {
    return this.request('/api/wholesale/tiers');
  }

  async getWholesaleProducts() {
    return this.request('/api/wholesale/products');
  }

  async getWholesaleCustomers() {
    return this.request('/api/wholesale/customers');
  }

  async addWholesaleCustomer(customerData: any) {
    return this.request('/api/wholesale/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async calculateWholesaleQuote(items: any[], tierId: string) {
    return this.request('/api/wholesale/quote', {
      method: 'POST',
      body: JSON.stringify({ items, tier_id: tierId }),
    });
  }

  // Store Management endpoints
  async getMyStore() {
    try {
      return await this.request('/api/stores/my-store', { suppressError: true });
    } catch (error: any) {
      // If it's a 404 error (store not found), return null
      if (error.message?.includes('404') || error.message?.includes('No store found')) {
        return null;
      }
      // For other errors, re-throw
      throw error;
    }
  }

  async uploadStoreDocument(file: File, documentType: 'business' | 'identity') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const url = `${this.baseURL}/api/stores/documents`;
    const token = this.getAuthToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async deleteStoreDocument(documentId: string) {
    return this.request(`/api/stores/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async getPendingStores() {
    return this.request('/api/stores/pending');
  }

  async getAllStoresAdmin(params?: {
    status?: string;
    query?: string;
    sort_by?: string;
    sort_order?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.query) queryParams.append('query', params.query);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/api/stores/admin/all?${queryString}` : '/api/stores/admin/all';

    return this.request(url);
  }

  async approveStore(storeId: string, adminComments?: string) {
    return this.request(`/api/stores/${storeId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ admin_comments: adminComments }),
    });
  }

  async rejectStore(storeId: string, rejectionReason?: string, adminComments?: string) {
    return this.request(`/api/stores/${storeId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({
        rejection_reason: rejectionReason,
        admin_comments: adminComments
      }),
    });
  }

  async suspendStore(storeId: string, reason: string) {
    return this.request(`/api/stores/${storeId}/suspend`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async reactivateStore(storeId: string) {
    return this.request(`/api/stores/${storeId}/reactivate`, {
      method: 'PUT',
    });
  }

  async sendStoreNotification(storeId: string, message: string, type: 'comment' | 'status_change' = 'comment') {
    return this.request(`/api/stores/${storeId}/notifications`, {
      method: 'POST',
      body: JSON.stringify({ message, type }),
    });
  }

  async markNotificationAsRead(storeId: string, notificationId: string) {
    return this.request(`/api/stores/${storeId}/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async getStoreNotifications(storeId: string) {
    return this.request(`/api/stores/${storeId}/notifications`);
  }

  // Store Catalog endpoints
  async addToStoreCatalog(productId: string) {
    return this.request('/api/store/catalog', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  // Product endpoints
  async createProduct(productData: any) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: string, productData: any) {
    return this.request(`/api/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  // Manufacturer endpoints
  async getManufacturers() {
    return this.request('/api/manufacturers', {
      method: 'GET',
    });
  }

  async createManufacturer(name: string) {
    return this.request('/api/manufacturers', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteManufacturer(manufacturerId: string) {
    return this.request(`/api/manufacturers/${manufacturerId}`, {
      method: 'DELETE',
    });
  }

  async getCategories() {
    return this.request('/api/categories', {
      method: 'GET',
    });
  }

  async getCategoriesHierarchical() {
    return this.request('/api/categories', {
      method: 'GET',
    });
  }

  async createCategory(name: string, parentId?: string) {
    const body: any = { name };
    if (parentId) {
      body.parent_id = parentId;
    }
    return this.request('/api/categories', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async deleteCategory(categoryId: string) {
    return this.request(`/api/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  async deleteProduct(productId: string) {
    return this.request(`/api/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // Product Approval endpoints
  async getPendingProducts() {
    return this.request('/api/products/pending');
  }

  async approveProduct(productId: string, adminComments?: string) {
    return this.request(`/api/products/${productId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ admin_comments: adminComments }),
    });
  }

  async getProductNotifications() {
    return this.request('/api/products/notifications');
  }

  async markNotificationRead(notificationId: string) {
    return this.request(`/api/products/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async rejectProduct(productId: string, rejectionReason?: string, adminComments?: string) {
    return this.request(`/api/products/${productId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({
        rejection_reason: rejectionReason,
        admin_comments: adminComments
      }),
    });
  }

  // Upload endpoint
  async uploadProductImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/api/products/upload`;
    const token = this.getAuthToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // ==================== WAREHOUSE API (Admin) ====================

  async getWarehouseProducts(params?: { customer_type?: string; status?: string; limit?: number; offset?: number }): Promise<WarehouseProductsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.customer_type) queryParams.append('customer_type', params.customer_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request<WarehouseProductsResponse>(`/api/admin/warehouse/products?${queryParams.toString()}`);
  }

  async createWarehouseProduct(productData: any) {
    return this.request('/api/admin/warehouse', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateWarehouseProduct(productId: string, productData: any) {
    return this.request(`/api/admin/warehouse/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async updateWarehouseStock(productId: string, warehouseStock: number) {
    return this.request(`/api/admin/warehouse/${productId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ warehouse_stock: warehouseStock }),
    });
  }

  async deleteWarehouseProduct(productId: string) {
    return this.request(`/api/admin/warehouse/${productId}`, {
      method: 'DELETE',
    });
  }

  // ==================== STORE CATALOG & PURCHASE API ====================

  async getStoreCatalog(params?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<StoreCatalogResponse> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request<StoreCatalogResponse>(`/api/admin/warehouse/store/catalog?${queryParams.toString()}`);
  }

  async purchaseFromWarehouse(productId: string, quantity: number) {
    return this.request('/api/admin/warehouse/store/purchase', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  // ==================== STORE WHOLESALE API ====================

  async getStoreWholesaleCatalog(params?: { category?: string; search?: string; limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request<{ products: any[]; total: number; limit: number; offset: number; store_customer_type: string }>(`/api/store/wholesale?${queryParams.toString()}`);
  }

  async purchaseFromWholesale(productId: string, quantity: number, couponCode?: string, addressId?: string) {
    return this.request('/api/store/wholesale/purchase', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity, coupon_code: couponCode, address_id: addressId }),
    });
  }

  async getAddresses() {
    return this.request<{ addresses: any[] }>('/api/addresses');
  }

  async createAddress(addressData: {
    name: string;
    email: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    address_line2?: string;
    address_type?: string;
  }) {
    return this.request<{ message: string; address: any }>('/api/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async getStorePurchases(params?: { status?: string; limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    return this.request(`/api/admin/warehouse/store/purchases?${queryParams.toString()}`);
  }

  // Store Dashboard Metrics
  async getStoreDashboardMetrics(storeId?: string): Promise<DashboardMetricsResponse> {
    const queryParams = new URLSearchParams();
    if (storeId) queryParams.append('store_id', storeId);
    
    const queryString = queryParams.toString();
    return this.request<DashboardMetricsResponse>(`/api/admin/metrics/store/dashboard${queryString ? `?${queryString}` : ''}`);
  }

  // Cart endpoints
  async getCart() {
    return this.request<{ cartItems: Array<{ productId: string; quantity: number; price: number; name?: string; images?: string[]; category?: string }>; total: number }>('/api/cart');
  }

  async addToCart(cartItem: { productId: string; quantity: number; price: number; name?: string; images?: string[] }) {
    return this.request('/api/cart', {
      method: 'POST',
      body: JSON.stringify(cartItem),
    });
  }

  // Customer orders endpoints
  async getMyOrders(params?: { status?: string; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    return this.request<{ orders: any[]; count: number }>(`/api/orders/my-orders${queryString ? `?${queryString}` : ''}`);
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types for TypeScript
export type { ApiClient };
