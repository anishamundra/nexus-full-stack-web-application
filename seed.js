require('dotenv').config();
const connectDB = require('./db/connect');
const mongoose = require('mongoose');

// Product Schema
const productSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    blurb: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);

// Sample products data with CORRECT .jfif extensions
const products = [
    {
        "sku": "SKU1001",
        "name": "Aurora Ceramic Mug",
        "price": 14.99,
        "imageUrl": "/images/mug.jfif",
        "blurb": "Stoneware, 350ml capacity"
    },
    {
        "sku": "SKU1002",
        "name": "Nebula Cotton Tee",
        "price": 24.00,
        "imageUrl": "/images/tee.jfif",
        "blurb": "100% premium cotton"
    },
    {
        "sku": "SKU1003",
        "name": "Cosmic Hardcover Notebook",
        "price": 12.50,
        "imageUrl": "/images/notebook.jfif",
        "blurb": "120 pages, dotted grid"
    },
    {
        "sku": "SKU1004",
        "name": "Stellar Gel Pen",
        "price": 8.99,
        "imageUrl": "/images/pen.jfif",
        "blurb": "Metal body, smooth writing"
    },
    {
        "sku": "SKU1005",
        "name": "Galaxy Travel Backpack",
        "price": 45.00,
        "imageUrl": "/images/backpack.jfif",
        "blurb": "Waterproof, 20L capacity"
    },
    {
        "sku": "SKU1006",
        "name": "Orbit Insulated Bottle",
        "price": 18.75,
        "imageUrl": "/images/bottle.jfif",
        "blurb": "Keeps drinks hot/cold for hours"
    },
    {
        "sku": "SKU1007",
        "name": "Nova LED Keychain",
        "price": 6.99,
        "imageUrl": "/images/keychain.jfif",
        "blurb": "Bright LED, durable build"
    },
    {
        "sku": "SKU1008",
        "name": "Comet Vinyl Stickers",
        "price": 4.50,
        "imageUrl": "/images/stickers.jfif",
        "blurb": "Set of 8 unique designs"
    },
    {
        "sku": "SKU1009",
        "name": "Solar Power Bank",
        "price": 32.99,
        "imageUrl": "/images/powerbank.jfif",
        "blurb": "10000mAh with solar charging"
    }
];

const seedProducts = async () => {
    try {
        await connectDB();

        console.log('Clearing existing products...');
        await Product.deleteMany({});

        console.log('Seeding new products...');
        await Product.insertMany(products);

        console.log('✅ Products seeded successfully!');
        console.log(`📦 Added ${products.length} products to database`);

        // Display seeded products with image paths
        const seededProducts = await Product.find();
        console.log('\n📋 Seeded Products with Image Paths:');
        seededProducts.forEach(product => {
            console.log(`   - ${product.name}: $${product.price} | Image: ${product.imageUrl}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();