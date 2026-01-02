# 🛍️ SHOPLANE - Your Modern Shopping Destination

![Project Banner](https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop) 
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73C92?style=for-the-badge&logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

## 🚀 Introduction

**ShopLane** is a full-stack e-commerce web application designed to provide a seamless shopping experience for fashion enthusiasts. Built with modern web technologies, it features dynamic product filtering, secure authentication, a shopping cart system, and a comprehensive admin dashboard for inventory management.

This project demonstrates proficiency in frontend architecture, state management, and responsive UI design.

🔗 **Live Demo:** [https://shoplane-store.vercel.app](https://shoplane-store.vercel.app)

---

## ✨ Key Features

### 🛒 For Customers
* **Dynamic Product Browsing:** Filter products by Category (Clothing, Shoes, Accessories), Gender, Price Range, and Brand.
* **Search Functionality:** Real-time search for products.
* **Shopping Cart & Wishlist:** Add items to cart or save for later with persistent state.
* **Secure Checkout:** Integrated checkout flow with order summary.
* **Order Tracking:** Track order status in real-time.
* **Responsive Design:** Fully optimized for Mobile, Tablet, and Desktop.

### 👨‍💻 For Admins
* **Admin Dashboard:** Overview of sales, orders, and total products.
* **Product Management:** Add, edit, or delete products.
* **Order Management:** View and update order statuses.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React.js, TypeScript, Vite |
| **Styling** | Tailwind CSS, Shadcn UI, Lucide React (Icons) |
| **State Management** | React Context API, TanStack Query (React Query) |
| **Routing** | React Router DOM (v6) |
| **Backend/Auth** | Supabase (Authentication & Database) |
| **Deployment** | Vercel |

---

## 📸 Screenshots

| Home Page | Product Detail |
| :---: | :---: |
| <img src="https://via.placeholder.com/400x200?text=Home+Page+Screenshot" alt="Home Page" width="100%"> | <img src="https://via.placeholder.com/400x200?text=Product+Page+Screenshot" alt="Product Detail" width="100%"> |

| Cart & Checkout | Admin Dashboard |
| :---: | :---: |
| <img src="https://via.placeholder.com/400x200?text=Cart+Screenshot" alt="Cart" width="100%"> | <img src="https://via.placeholder.com/400x200?text=Admin+Panel+Screenshot" alt="Admin" width="100%"> |

*(Note: Replace these placeholder links with actual screenshots of your project)*

---

## 💻 Installation & Local Setup

Follow these steps to run the project locally on your machine.

**Prerequisites:** Node.js (v18+) and Git installed.

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/shoplane.git](https://github.com/your-username/shoplane.git)
    cd shoplane
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory and add your API keys (e.g., Supabase credentials).
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

---

## 📂 Project Structure

```bash
src/
├── components/     # Reusable UI components (Navbar, Footer, Cards)
├── contexts/       # Global State (Cart, Wishlist, Auth, RecentlyViewed)
├── data/           # Static data (Mock products)
├── pages/          # Page components (Home, Cart, Checkout, Admin)
│   ├── admin/      # Admin specific routes
├── lib/            # Utilities and helper functions
├── App.tsx         # Main application component with Routes
└── main.tsx        # Entry point
