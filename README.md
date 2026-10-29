# 🇪🇹 Made in Ethiopia — Local Creator Marketplace

### Discover Ethiopian Creativity. Support Local Talent.

**Made in Ethiopia** is a web-based marketplace designed to connect talented Ethiopian creators with customers who appreciate locally made products.

Our platform provides a digital space where local artisans can showcase their creations, reach potential customers, and promote Ethiopian craftsmanship and culture.

This project was developed as a team capstone for the **Full-Stack Software Development Training Program at IBT College of Canada**.

---

## 🌍 About the Project

Ethiopia is home to talented artisans and creators who produce unique handmade products, including traditional textiles, pottery, jewelry, and home decorations.

However, many local creators face challenges in promoting their products and reaching customers beyond their immediate communities.

**Made in Ethiopia** aims to address this problem by creating an accessible digital marketplace that connects creators with customers.

Our mission is to support local talent, celebrate Ethiopian culture, and create more opportunities for independent creators through technology.

---

## ✨ Features

### 🏠 Welcome Page and Homepage

- Welcome page with Creator and Customer options
- Separate registration and login experiences
- Marketplace homepage with Ethiopian cultural imagery
- Featured product carousel
- Automatic product sliding
- Manual carousel navigation
- Responsive design for different screen sizes

### 🛍️ Customer Features

- Customer registration and login
- Personalized customer dashboard
- Browse locally made Ethiopian products
- Search and explore the marketplace
- Discover local creators and shops
- View individual product details
- Save and remove favorite products
- Add products to a shopping cart
- Update product quantities
- Remove products from the cart
- View shopping cart totals
- Complete a demonstration checkout

### 🎨 Creator Features

- Creator registration and login
- Dedicated creator dashboard
- Product listing and management interface
- Forms for adding and editing products
- Product deletion functionality
- Creator profile management interface
- Logout functionality

### 🔐 Authentication and Security

- Authentication using Supabase
- Separate Creator and Customer roles
- Role-based dashboard access
- Protected routes
- Password reset functionality
- Login and logout functionality

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Next.js | Web application framework |
| React | Building interactive user interfaces |
| JavaScript | Application logic |
| CSS3 | Styling and responsive design |
| Supabase | Authentication and database integration |
| Git | Version control |
| GitHub | Team collaboration and source code hosting |
| Visual Studio Code | Development environment |

---

## 📁 Project Structure

```text
Made-in-Ethiopia-Local-Creator-Marketplace/
│
├── app/
│   ├── auth/                 # Authentication callback
│   ├── cart/                 # Shopping cart
│   ├── checkout/             # Checkout page
│   ├── customer/             # Customer dashboard
│   ├── dashboard/            # Creator dashboard
│   ├── demo/                 # Development preview pages
│   ├── home/                 # Marketplace homepage
│   ├── login/                # Login page
│   ├── marketplace/          # Product marketplace
│   ├── products/             # Product details
│   ├── register/             # Registration page
│   ├── reset-password/       # Password recovery
│   ├── shops/                # Creator shops
│   ├── globals.css           # Global styling
│   ├── layout.js             # Root layout
│   └── page.js               # Welcome page
│
├── components/
│   ├── AddToCartButton.js
│   ├── CartButton.js
│   ├── DashboardClient.js
│   ├── FeaturedCarousel.js
│   ├── Footer.js
│   ├── LogoutButton.js
│   ├── Navbar.js
│   ├── ProductCard.js
│   ├── ShopCard.js
│   └── SiteLayout.js
│
├── data/                     # Product and shop data
│
├── lib/                      # Authentication and cart logic
│
├── public/                   # Images and static assets
│
├── supabase/                 # Supabase configuration and database files
│
├── .gitignore
├── eslint.config.mjs
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Before running the project, make sure you have:

- Node.js
- npm
- Git
- A configured Supabase project

### 1. Clone the Repository

```bash
git clone https://github.com/Fikre-tsion/Made-in-Ethiopia-Local-Creator-Marketplace.git
```

### 2. Navigate to the Project Directory

```bash
cd Made-in-Ethiopia-Local-Creator-Marketplace
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root.

Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

The application also requires the appropriate Supabase database tables, authentication settings, and access policies.

In Supabase, open **Authentication > Providers > Email** and turn off **Confirm email**. The registration form is configured to sign users in immediately and route them to the customer or creator area after account creation.

**Important:** Never commit `.env.local` or private credentials to GitHub.

### 5. Start the Development Server

```bash
npm run dev
```

Open your browser and visit:

`http://localhost:3000`

---

## 🧭 How the Platform Works

### For Customers

1. Visit the welcome page.
2. Select **Continue as Customer**.
3. Register or log in.
4. Access the customer dashboard.
5. Explore products and creator shops.
6. Save favorite products.
7. Add products to the shopping cart.
8. Review the cart and proceed to the demonstration checkout.

### For Creators

1. Visit the welcome page.
2. Select **Continue as Creator**.
3. Register or log in.
4. Access the creator dashboard.
5. Explore the product management interface.
6. Add, edit, or remove product listings using the available management features.

---

### 🤝 Team Collaboration

Each team member contributed to different parts of the application, including frontend development, user interface design, authentication, database integration, and marketplace functionality.

Throughout the development process, we collaborated using Git and GitHub, divided responsibilities, integrated our work, and worked together to solve technical challenges.

Our teamwork allowed us to combine different features into a single platform designed to support Ethiopian creators and customers.

---

## 🎯 Project Objectives

Our main objectives are to:

1. Support Ethiopian artisans and independent creators.
2. Provide a digital platform for showcasing locally made products.
3. Connect creators with potential customers.
4. Promote Ethiopian craftsmanship and cultural heritage.
5. Make Ethiopian products easier to discover.
6. Encourage local entrepreneurship through technology.

---

## ⚠️ Current Limitations

Made in Ethiopia is currently a capstone demonstration project.

- Checkout demonstrates the ordering process but does not process real payments.
- Some products and shops use sample data.
- Certain creator management features may require additional database integration.
- Real order processing and delivery tracking are not yet implemented.
- The application is not yet intended for production e-commerce transactions.

---

## 🔮 Future Improvements

We aim to expand the platform with:

- Integration with Ethiopian payment services such as Telebirr
- Real order management and tracking
- Product image uploads
- Customer reviews and ratings
- Creator sales analytics
- Advanced product search and filtering
- Delivery management
- Improved customer-to-creator communication
- Support for more Ethiopian artisans and small businesses

---

## 💚 Our Vision

We believe Ethiopian creativity deserves greater visibility.

**Made in Ethiopia** is more than an online marketplace. It is a platform designed to celebrate Ethiopian craftsmanship, support local businesses, and create opportunities for talented creators.

Through technology, we hope to make Ethiopian handmade products easier to discover while helping preserve and promoting our cultural heritage.

### Made with Culture. Made in Ethiopia. 🇪🇹