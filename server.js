require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;



// Serve static files from root (if needed)
app.use(express.static(__dirname));

// Route to serve intro.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "intro.html")); 
});

// ✅ PostgreSQL Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=no-verify`,
    ssl: { rejectUnauthorized: false },
});

// ✅ Test Database Connection
pool.connect()
    .then(() => console.log("✅ Connected to Aiven PostgreSQL successfully!"))
    .catch((err) => {
        console.error("❌ Database Connection Error:", err);
        process.exit(1);
    });


// ✅ Middleware
app.use(cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization"
}));

app.options("*", cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve images


// Define Storage Engine
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage });


// Upload Route
app.post("/api/upload-item", upload.single("itemImage"), async (req, res) => {
    try {
        const { item_name, item_price } = req.body;
        const newItem = new AuctionItem({
            item_name,
            item_price,
            item_image: req.file.path, // Store file path in DB
        });

        await newItem.save();
        res.json({ message: "Item uploaded successfully", item: newItem });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Error uploading item" });
    }
});

// 📌 Buyer Signup Route
app.post("/api/buyer/signup", async (req, res) => {
    const { firstName, lastName, email, username, dob, password, shippingAddress } = req.body;
    if (!firstName || !lastName || !email || !username || !dob || !password || !shippingAddress) {
        return res.status(400).json({ message: "All buyer fields must be filled." });
    }
    try {
        const userExists = await pool.query("SELECT id FROM users WHERE email = $1 OR username = $2", [email, username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Email or username already exists." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            `INSERT INTO users (first_name, last_name, email, username, dob, password, role, shipping_address)
             VALUES ($1, $2, $3, $4, $5, $6, 'buyer', $7)
             RETURNING id, username, email, role`,
            [firstName, lastName, email, username, dob, hashedPassword, shippingAddress]
        );
        res.status(201).json({ success: true, message: "Buyer registered successfully!", user: newUser.rows[0] });
    } catch (error) {
        console.error("❌ Buyer Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 📌 Seller Signup Route
app.post("/api/seller/signup", async (req, res) => {
    const { firstName, lastName, email, username, dob, password, storeName, storeAddress } = req.body;
    if (!firstName || !lastName || !email || !username || !dob || !password || !storeName || !storeAddress) {
        return res.status(400).json({ message: "All seller fields must be filled." });
    }
    try {
        const userExists = await pool.query("SELECT id FROM users WHERE email = $1 OR username = $2", [email, username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Email or username already exists." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            `INSERT INTO users (first_name, last_name, email, username, dob, password, role, store_name, store_address)
             VALUES ($1, $2, $3, $4, $5, $6, 'seller', $7, $8)
             RETURNING id, username, email, role`,
            [firstName, lastName, email, username, dob, hashedPassword, storeName, storeAddress]
        );
        res.status(201).json({ success: true, message: "Seller registered successfully!", user: newUser.rows[0] }); 
    } catch (error) {
        console.error("❌ Seller Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// 📌 Buyer Login Route
app.post("/api/buyer/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    try {
        const userQuery = await pool.query("SELECT * FROM users WHERE email = $1 AND role = 'buyer'", [email]);
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: "Buyer not found." });
        }
        const user = userQuery.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password." });
        }
        res.status(200).json({ success: true, message: "Login successful", user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (error) {
        console.error("❌ Buyer Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// 📌 Seller Login Route
app.post("/api/seller/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const userQuery = await pool.query("SELECT * FROM users WHERE email = $1 AND role = 'seller'", [email]);

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: "Seller not found." });
        }

        const user = userQuery.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password." });
        }

        res.status(200).json({ 
            success: true, 
            message: "Login successful", 
            user: { id: user.id, username: user.username, email: user.email, role: user.role } 
        });

    } catch (error) {
        console.error("❌ Seller Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 📌 POST: List a new auction item (Now using Multer)
app.post("/api/seller/list-item", upload.single("itemImage"), async (req, res) => {
    const { itemName, itemDescription, itemPrice, sellerName, bidEndTime } = req.body;

    if (!req.file || !itemName || !itemDescription || !itemPrice || !sellerName || !bidEndTime) {
        return res.status(400).json({ message: "All fields must be filled." });
    }

    try {
        // Convert bidEndTime to a valid timestamp format
        const formattedBidEndTime = new Date(Number(bidEndTime)).toISOString();

        // Store the local image file path
        const imagePath = `/uploads/${req.file.filename}`;

        // Save item details to the database
        const newItem = await pool.query(
            `INSERT INTO auction_items (item_name, item_description, item_price, seller_name, item_image, watchers, bid_count, bidendtime)
             VALUES ($1, $2, $3, $4, $5, 0, 0, $6)
             RETURNING *`,
            [itemName, itemDescription, itemPrice, sellerName, imagePath, formattedBidEndTime]
        );

        res.status(201).json({ success: true, message: "Item listed successfully!", item: newItem.rows[0] });

    } catch (error) {
        console.error("❌ Error in /api/seller/list-item:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


// 📌 GET: Fetch all auction items
app.get("/api/auction-items", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM auction_items");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching auction items:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 GET: Fetch a specific auction item
app.get("/api/auction-items/:id", async (req, res) => {
    const itemId = req.params.id;
    try {
        const result = await pool.query("SELECT * FROM auction_items WHERE id = $1", [itemId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching item:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📌 GET: Fetch seller's listed auction items
app.get("/api/my-auction-items/:seller", async (req, res) => {
    try {
        const seller = req.params.seller;
        const result = await pool.query("SELECT * FROM auction_items WHERE seller_name = $1", [seller]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching seller items:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📌 DELETE: Delete an auction item by ID
app.delete("/api/seller/delete-item/:id", async (req, res) => {
    const itemId = req.params.id;

    try {
        // First, check if the item exists
        const itemQuery = await pool.query("SELECT * FROM auction_items WHERE id = $1", [itemId]);
        
        if (itemQuery.rows.length === 0) {
            return res.status(404).json({ message: "Item not found." });
        }

        // If item exists, proceed with the deletion
        await pool.query("DELETE FROM auction_items WHERE id = $1", [itemId]);

        res.status(200).json({ success: true, message: "Item deleted successfully!" });
    } catch (error) {
        console.error("❌ Error deleting item:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// **Buyer Profile Endpoint**
app.get("/api/buyer/profile", async (req, res) => {
    const { userId } = req.query;

    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const user = database.buyers[userId];

    if (!user) return res.status(404).json({ error: "Buyer not found" });

    res.json(user);
});

// **Seller Profile Endpoint**
app.get("/api/seller/profile", async (req, res) => {
    const { userId } = req.query;

    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const user = database.sellers[userId];

    if (!user) return res.status(404).json({ error: "Seller not found" });

    res.json(user);
});


// 🏁 Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
