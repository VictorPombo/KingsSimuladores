import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), 'apps/site/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in apps/site/.env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Reading CSV...");
  const csvContent = fs.readFileSync('/Users/hadi/Documents/KingsSimuladores/produtos_2026-05-01-18-38-48.csv', 'utf-8');
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  console.log(`Parsed ${records.length} records from CSV.`);

  console.log("Fetching existing Seven products from Supabase...");
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('id, title, sku, stock, price, brand_id, tray_id')
    .eq('brand_id', '15c7f799-a994-4ea7-a38a-0fcc0c35b372');

  if (error) {
    console.error("Error fetching products:", error);
    process.exit(1);
  }

  console.log(`Found ${dbProducts.length} Seven products in Supabase.`);

  let updatedCount = 0;
  let notFoundCount = 0;

  for (const row of records) {
    // Skip variations
    if (row["Código do pai"] && row["Código do pai"].trim() !== '') {
      continue;
    }

    const title = row["Descrição"].trim();
    const sku = row["Código (SKU)"].trim();
    const description = row["Descrição complementar"];
    const ncm = row["Classificação fiscal"];
    const ean = row["GTIN/EAN"];
    
    // Parse numbers
    const weight_kg = parseFloat(row["Peso líquido (Kg)"].replace(',', '.'));
    const width_cm = parseFloat(row["Largura embalagem"].replace(',', '.'));
    const height_cm = parseFloat(row["Altura embalagem"].replace(',', '.'));
    const length_cm = parseFloat(row["Comprimento embalagem"].replace(',', '.'));
    
    // "1.320,0000000000" -> 1320.00
    const rawPrice = row["Preço"];
    const priceStr = rawPrice.split('.').join('').replace(',', '.');
    const price = parseFloat(priceStr);

    // "2,0000" -> 2
    const stock = Math.floor(parseFloat(row["Estoque"].replace(',', '.')));

    // Images
    const images = [];
    for (let i = 1; i <= 6; i++) {
      const imgUrl = row[`URL imagem ${i}`];
      if (imgUrl && imgUrl.trim() !== '') {
        images.push(imgUrl.trim());
      }
    }

    // Match by title (ilike equivalent in JS) or tray_id
    const matchedProduct = dbProducts.find(p => p.title.toLowerCase() === title.toLowerCase() || p.tray_id === row["ID"]);

    if (matchedProduct) {
      console.log(`Matched: "${title}" -> updating...`);
      
      const updateData = {
        sku,
        description,
        ncm,
        ean,
        weight_kg: isNaN(weight_kg) ? null : weight_kg,
        dimensions_cm: {
          width: isNaN(width_cm) ? null : width_cm,
          height: isNaN(height_cm) ? null : height_cm,
          length: isNaN(length_cm) ? null : length_cm
        },
        price: isNaN(price) ? matchedProduct.price : price,
        stock: isNaN(stock) ? matchedProduct.stock : stock
      };

      // Only update images if we have them from Tiny
      if (images.length > 0) {
        updateData.images = images;
      }

      const { error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', matchedProduct.id);

      if (updateError) {
        console.error(`Error updating product ${title}:`, updateError);
      } else {
        updatedCount++;
      }
    } else {
      console.log(`Not found in DB: "${title}"`);
      notFoundCount++;
    }
  }

  console.log("\n=============================");
  console.log("Upsert Report:");
  console.log(`Products Updated: ${updatedCount}`);
  console.log(`Products Not Found (or skipped because variation): ${notFoundCount}`);
  console.log("=============================\n");
}

run();
