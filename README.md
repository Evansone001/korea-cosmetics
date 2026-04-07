<div align="center">
  <h1>KoreaBeauty Hub</h1>
  <p>
    <strong>Premium Korean Cosmetics B2B Platform</strong>
  </p>
  <p>
    Your trusted gateway to authentic Korean cosmetics. B2B wholesale platform based in Kenya, serving the African market with genuine K-beauty products.
  </p>
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#screenshots">Screenshots</a> •
    <a href="#roadmap">Roadmap</a>
  </p>
</div>

---

## Features

### For Customers
- **Shop Korean Cosmetics** - Browse authentic products from top Korean brands
- **Dual Pricing** - View both retail and wholesale prices
- **Secure Checkout** - Multiple payment options including M-Pesa
- **Order Tracking** - Track orders from placement to delivery
- **Product Reviews** - Read authentic customer reviews

### For Store Owners (B2B)
- **Store Dashboard** - Manage your store and view analytics
- **Product Catalog** - Add products from the admin catalog to your store
- **Inventory Management** - Track stock levels and sales
- **Order Management** - Process customer orders efficiently
- **Wholesale Pricing** - Set custom wholesale prices for bulk buyers

### For Admin
- **Master Dashboard** - Platform-wide analytics and insights
- **Store Approval** - Review and approve new store applications
- **Product Catalog** - Manage the master product catalog
- **AI Analytics** - AI-powered business insights and anomaly detection
- **User Management** - Manage customers and store owners
- **Order Oversight** - View and manage all platform orders

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **State Management** | Redux Toolkit |
| **Database** | Prisma ORM (PostgreSQL) |
| **Authentication** | JWT with HTTP-only cookies |
| **Icons** | Lucide React |
| **UI Components** | Custom components with Tailwind |

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/korea-beauty-hub.git
   cd korea-beauty-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/korea_beauty_hub"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   
   # App Config
   NEXT_PUBLIC_CURRENCY_SYMBOL="$"
   NEXT_PUBLIC_APP_NAME="KoreaBeauty Hub"
   ```

4. **Database Setup**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed  # Optional: seed with sample data
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
korea-beauty-hub/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public-facing routes
│   │   ├── page.tsx       # Homepage
│   │   ├── shop/          # Product listing
│   │   ├── product/       # Product details
│   │   ├── cart/          # Shopping cart
│   │   ├── checkout/      # Checkout flow
│   │   ├── orders/        # Order history
│   │   ├── wholesale/     # B2B wholesale page
│   │   └── manufacturers/ # Brand/manufacturer directory
│   ├── admin/             # Admin dashboard
│   ├── store/             # Store owner dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   └── store/            # Store-specific components
├── lib/                   # Utilities and services
│   ├── features/         # Redux slices
│   └── services/         # API services
├── types/                 # TypeScript types
├── prisma/                # Database schema
└── assets/               # Static assets
```

---

## Screenshots

### Customer Experience
*Coming soon - screenshots of homepage, product page, cart, and checkout*

### Store Dashboard
*Coming soon - screenshots of store analytics and product management*

### Admin Panel
*Coming soon - screenshots of master dashboard and AI analytics*

---

## Roadmap

### Phase 1 - Core Platform (Completed)
- [x] Customer-facing storefront
- [x] Product catalog with search/filter
- [x] Shopping cart and checkout
- [x] User authentication
- [x] Order management

### Phase 2 - B2B Features (Completed)
- [x] Store owner dashboard
- [x] Product catalog for stores
- [x] Inventory management
- [x] Wholesale pricing
- [x] Store registration workflow

### Phase 3 - Admin & Analytics (In Progress)
- [x] Master admin dashboard
- [x] Store approval workflow
- [x] AI-powered analytics
- [x] Anomaly detection
- [ ] Advanced reporting
- [ ] Commission management

### Phase 4 - Mobile & Scale (Planned)
- [ ] React Native mobile app
- [ ] Multi-language support
- [ ] Multi-currency support
- [ ] Advanced search with AI
- [ ] Live chat support

---

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify` - Verify JWT token
- `DELETE /api/auth/login` - Logout

### Products
- `GET /api/store/catalog` - Get available products for stores
- `POST /api/store/catalog` - Add product to store
- `GET /api/store/products` - Get store's products
- `PATCH /api/store/products/:id` - Update product status
- `DELETE /api/store/products/:id` - Remove product from store

### Admin
- `GET /api/admin/master/ai-analysis` - Get AI insights
- `GET /api/admin/master/anomalies` - Get detected anomalies
- `PUT /api/admin/master/anomalies/:id` - Update anomaly status
- `GET /api/admin/master/alerts` - Get platform alerts

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Build the project: `npm run build`
6. Submit a pull request

---

## License

This project is licensed under the MIT License - see [LICENSE.md](./LICENSE.md) for details.

---

## Support

For support, email contact@koreabeautyhub.com or open an issue on GitHub.

---

## Acknowledgments

- Korean beauty brands: COSRX, Innisfree, Some By Mi, Beauty of Joseon, Laneige
- Open source community
- Contributors and testers

---

<div align="center">
  <p>Built with ❤️ in Kenya for the African market</p>
  <p><strong>KoreaBeauty Hub</strong> - Bringing the best of K-beauty to Africa</p>
</div>
