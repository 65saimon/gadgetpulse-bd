# GadgetPulse BD — Production-Ready Mobile & Gadget E-Commerce & Retail ERP Platform

A modern, full-stack, commercial-grade **Mobile Phone & Gadget E-Commerce Platform** and **Management ERP System** built specifically for the Bangladeshi electronics retail market.

---

## 🌟 Features Overview

### 🛒 Customer-Facing Storefront (`http://localhost:3000`)
- **Brand Identity**: GadgetPulse BD (Authorized Flagship Mobile & Gadget Retailer).
- **Bangladeshi Localization**: BDT currency (`৳`), `+880` phone format, cascading **Division $\to$ District $\to$ Upazila/Thana** address selectors.
- **Product Catalog & Technical Specs**: Multi-attribute filtering (Category, Brand, Price, Stock), dynamic variant switcher (Storage, RAM, Colors) updating price/SKU/stock in real time, technical specifications table, verified customer reviews.
- **Cart & Checkout**: Drawer & full cart views, promo coupons (`GADGET10`), Dhaka vs Outside Dhaka shipping calculation, **bKash & Nagad merchant payment instructions** with TrxID validation, Cash on Delivery, and celebratory confetti upon order completion.
- **Post-Purchase Logistics**: Real-time 6-step order tracking timeline (`/track-order`) and client-side high-resolution printable A4 tax invoice generator (`jsPDF`).
- **Customer Account Portal (`/account`)**: Order history, order tracking, address manager, and interactive wishlist.

### 🏢 Management ERP System (`http://localhost:3000/admin`)
- **Role-Based Access Control**: Super Admin, Sales Manager, and Inventory Manager with pre-configured 1-click test login buttons.
- **Executive Analytics**: Real-time sales velocity, estimated gross profits, category revenue breakdown, order status distribution, and top 5 bestsellers via interactive Recharts.
- **Catalog & Variant Engineering**: Master catalog with variant builder (Colors, Storage sizes, RAM, individual SKUs, cost prices, selling prices), duplicate draft creator, and stock alert thresholds.
- **Stock Valuation & Inventory Ledger**: Real-time asset valuation at cost vs retail potential, low stock alerts, manual adjustment modal with audit reasoning, and immutable inventory movement transactions ledger.
- **Transactional Order Fulfillment**: End-to-end status lifecycle (`PENDING` $\to$ `CONFIRMED` $\to$ `PROCESSING` $\to$ `PACKED` $\to$ `SHIPPED` $\to$ `DELIVERED`) with automatic inventory deduction on placement and auto-restoration upon cancellation/return.
- **Procurement & Restock Engine**: Vendor directory and Purchase Order (PO) creation that automatically increments warehouse stock and writes audit records.
- **Financial Reporting Center**: Date-range filtered reports for Sales, Product Profit Margins, Customer Spend, and Inventory Valuation with 1-click **Excel (`.xlsx`)**, **CSV**, and **PDF** export.
- **Security Audit Logs & Store Settings**: Immutable security audit trail and global payment gateway configuration (bKash & Nagad merchant numbers, VAT rates, shipping fees).

---

## 🚀 How to Run Locally

### 1. Start the Backend API (Terminal 1)
```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run dev
```
* Backend API: `http://localhost:5000/api`
* Swagger API Docs: `http://localhost:5000/api/docs`

### 2. Start the Frontend Application (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
* Storefront: `http://localhost:3000`
* Admin ERP Portal: `http://localhost:3000/admin`

---

## 🔑 Demo Login Credentials

### Admin ERP Portal (`http://localhost:3000/admin/login`)
| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@gadgetpulse.bd` | `admin123` |
| **Sales Manager** | `sales@gadgetpulse.bd` | `staff123` |
| **Inventory Manager** | `inventory@gadgetpulse.bd` | `staff123` |

### Customer Account (`http://localhost:3000/login`)
| User | Email | Password |
| :--- | :--- | :--- |
| **Rafid Al-Mahmud** | `rafid.mahmud@gmail.com` | `customer123` |

---

## 🧪 Automated Integration Tests
To execute the automated end-to-end test suite:
```bash
node test-e2e.js
```
