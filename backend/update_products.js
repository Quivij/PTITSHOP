import mongoose from "mongoose";
import slugify from "slugify";
import Product from "./src/models/Product.js";

async function updateDB() {
    console.log("Connecting to database...");
    await mongoose.connect('mongodb://localhost:27017/ptitshop');
    console.log("Connected. Fetching products...");
    const products = await Product.find({});
    let count = 0;
    for (const p of products) {
        let changed = false;
        let newName = p.name;
        let newDesc = p.description;

        if (newName && newName.includes('UTE')) {
            newName = newName.replace(/UTE/g, 'PTIT');
            changed = true;
        }
        if (newDesc && newDesc.includes('UTE')) {
            newDesc = newDesc.replace(/UTE/g, 'PTIT');
            changed = true;
        }
        
        if (changed) {
            const newSlug = slugify(newName, { lower: true, strict: true, locale: "vi" });
            await Product.updateOne({ _id: p._id }, { 
                $set: { 
                    name: newName, 
                    description: newDesc,
                    slug: newSlug
                } 
            });
            count++;
        }
    }
    console.log(`Updated ${count} products.`);
    await mongoose.disconnect();
}

updateDB().catch(err => {
    console.error(err);
    mongoose.disconnect();
});
