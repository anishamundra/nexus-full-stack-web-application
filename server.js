require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./db/connect');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Debug static file serving
app.use((req, res, next) => {
    if (req.url.includes('.jfif') || req.url.includes('.css') || req.url.includes('.jpg')) {
        console.log('Static file request:', req.url);
    }
    next();
});

// Database connection
connectDB();

// Models
const productSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    blurb: { type: String, required: true }
});

const cartItemSchema = new mongoose.Schema({
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, default: 1 },
    imageUrl: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    items: [{
        sku: String,
        name: String,
        price: Number,
        qty: Number,
        priceAtPurchase: Number,
        imageUrl: String
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const CartItem = mongoose.model('CartItem', cartItemSchema);
const Order = mongoose.model('Order', orderSchema);

// Routes

// Home page - Catalog
app.get('/', async (req, res) => {
    try {
        const products = await Product.find().limit(9);
        const cartItems = await CartItem.find();
        const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);

        console.log(`Rendering home page with ${products.length} products, cart has ${cartCount} items`);

        res.render('index', {
            products,
            cartCount,
            successMessage: req.query.added ? `${req.query.product} added to cart!` : null
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error loading products');
    }
});

// Cart Routes

// Add to cart (stays on home page)
app.post('/cart/add', async (req, res) => {
    try {
        const { sku, qty = 1 } = req.body;

        console.log('Adding to cart:', { sku, qty });

        // Find product
        const product = await Product.findOne({ sku });
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Check if item already in cart
        let cartItem = await CartItem.findOne({ sku });

        if (cartItem) {
            // Update quantity
            cartItem.qty += parseInt(qty);
            await cartItem.save();
            console.log(`Updated cart item: ${cartItem.name}, new quantity: ${cartItem.qty}`);
        } else {
            // Add new item
            cartItem = new CartItem({
                sku: product.sku,
                name: product.name,
                price: product.price,
                qty: parseInt(qty),
                imageUrl: product.imageUrl
            });
            await cartItem.save();
            console.log(`Added new item to cart: ${cartItem.name}`);
        }

        // Redirect back to home page with success message
        res.redirect('/?added=true&product=' + encodeURIComponent(product.name));
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).send('Error adding item to cart');
    }
});

// View cart
app.get('/cart', async (req, res) => {
    try {
        const cartItems = await CartItem.find().sort({ addedAt: -1 });

        // Calculate subtotal
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

        console.log(`Cart page: ${cartItems.length} items, subtotal: $${subtotal.toFixed(2)}`);

        res.render('cart', {
            cartItems,
            subtotal: subtotal.toFixed(2)
        });
    } catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).send('Error loading cart');
    }
});

// Update cart quantity
app.post('/cart/update', async (req, res) => {
    try {
        const { sku, qty } = req.body;

        console.log('Updating cart:', { sku, qty });

        if (parseInt(qty) <= 0) {
            // Remove item if quantity is 0 or less
            await CartItem.findOneAndDelete({ sku });
            console.log(`Removed item from cart: ${sku}`);
        } else {
            // Update quantity
            await CartItem.findOneAndUpdate(
                { sku },
                { qty: parseInt(qty) }
            );
            console.log(`Updated quantity for ${sku} to ${qty}`);
        }

        res.redirect('/cart');
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).send('Error updating cart');
    }
});

// Remove from cart
app.post('/cart/remove', async (req, res) => {
    try {
        const { sku } = req.body;

        console.log('Removing from cart:', { sku });

        await CartItem.findOneAndDelete({ sku });
        console.log(`Removed item from cart: ${sku}`);

        res.redirect('/cart');
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).send('Error removing item from cart');
    }
});

// Checkout and Order Routes

// Checkout process
app.post('/checkout', async (req, res) => {
    try {
        // Get current cart items
        const cartItems = await CartItem.find();

        if (cartItems.length === 0) {
            return res.redirect('/cart');
        }

        console.log(`Processing checkout with ${cartItems.length} items`);

        // Calculate totals
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const tax = subtotal * 0.13; // 13% HST
        const shipping = 20.00; // Flat shipping
        const total = subtotal + tax + shipping;

        // Create order document
        const order = new Order({
            items: cartItems.map(item => ({
                sku: item.sku,
                name: item.name,
                price: item.price,
                qty: item.qty,
                priceAtPurchase: item.price,
                imageUrl: item.imageUrl
            })),
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            shipping: parseFloat(shipping.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        });

        await order.save();
        console.log(`Order created: ${order._id}`);

        // Clear cart
        await CartItem.deleteMany({});
        console.log('Cart cleared after checkout');

        // Redirect to order confirmation page
        res.redirect(`/order/${order._id}`);
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).send('Error processing checkout');
    }
});

// Order confirmation page
app.get('/order/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).send('Order not found');
        }

        console.log(`Displaying order: ${order._id}`);

        res.render('order', {
            order,
            cartCount: 0 // Cart is empty after checkout
        });
    } catch (error) {
        console.error('Error loading order:', error);
        res.status(500).send('Error loading order');
    }
});

// Test routes (keep these for debugging)

// Test CSS route
app.get('/test-css', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="/css/styles.css">
        </head>
        <body>
            <h1 style="color: #3498db;">CSS is working!</h1>
            <button class="btn btn-primary">Test Button</button>
        </body>
        </html>
    `);
});

// Test database route
app.get('/test-db', async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        const cartCount = await CartItem.countDocuments();
        const orderCount = await Order.countDocuments();

        res.json({
            message: 'Database working!',
            products: productCount,
            cartItems: cartCount,
            orders: orderCount,
            database: mongoose.connection.db.databaseName
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test images route
app.get('/test-images', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Test Images</title></head>
        <body>
            <h1>Testing Image Loading</h1>
            <h2>Mug Image:</h2>
            <img src="/images/mug.jfif" alt="Mug" style="width: 200px;">
            <p>If you see the image above, images are working!</p>
        </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📁 Views directory:', path.join(__dirname, 'views'));
    console.log('🎨 Static files:', path.join(__dirname, 'public'));
    console.log('💾 Database:', process.env.DB_NAME);
});