<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{

    public function run(): void
    {
        // User::factory(10)->create();

         User::create([
            'name' => 'Admin User',
            'email' => 'admin@homeandcook.in',
            'password' => Hash::make('admin@123'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Priya Sharma',
            'email' => 'priya@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'phone' => '9876543210',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
        ]);

        $categories = [
            ['name' => 'Cookware', 'slug' => 'cookware', 'description' => 'Premium pots, pans, and cooking vessels', 'sort_order' => 1],
            ['name' => 'Ceramics', 'slug' => 'ceramics', 'description' => 'Handcrafted bowls, plates and mugs', 'sort_order' => 2],
            ['name' => 'Cutting Boards', 'slug' => 'cutting-boards', 'description' => 'Artisan wood and bamboo boards', 'sort_order' => 3],
            ['name' => 'Glassware', 'slug' => 'glassware', 'description' => 'Glasses, carafes and decanters', 'sort_order' => 4],
            ['name' => 'Utensils', 'slug' => 'utensils', 'description' => 'Spoons, spatulas and kitchen tools', 'sort_order' => 5],
            ['name' => 'Storage', 'slug' => 'storage', 'description' => 'Canisters, jars and organizers', 'sort_order' => 6],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        $products = [
            ['category_id' => 1, 'name' => 'Enamelled Cast Iron Pot', 'slug' => 'enamelled-cast-iron-pot', 'price' => 12499, 'sale_price' => null, 'stock' => 32, 'is_featured' => true, 'is_new_arrival' => true, 'rating' => 4.8, 'review_count' => 124, 'material' => 'Cast Iron', 'weight' => '3.2 kg'],
            ['category_id' => 1, 'name' => 'Stainless Steel Kadai', 'slug' => 'stainless-steel-kadai', 'price' => 3299, 'sale_price' => 2799, 'stock' => 58, 'is_featured' => true, 'is_bestseller' => true, 'rating' => 4.5, 'review_count' => 89],
            ['category_id' => 2, 'name' => 'Hand-thrown Cereal Bowl', 'slug' => 'hand-thrown-cereal-bowl', 'price' => 3499, 'sale_price' => 2699, 'stock' => 0, 'is_featured' => true, 'rating' => 4.3, 'review_count' => 42, 'material' => 'Stoneware'],
            ['category_id' => 2, 'name' => 'Artisan Coffee Mug Set', 'slug' => 'artisan-coffee-mug-set', 'price' => 1899, 'sale_price' => null, 'stock' => 24, 'is_new_arrival' => true, 'rating' => 4.7, 'review_count' => 67],
            ['category_id' => 3, 'name' => 'Walnut Cutting Board', 'slug' => 'walnut-cutting-board', 'price' => 7499, 'sale_price' => null, 'stock' => 7, 'is_featured' => true, 'is_bestseller' => true, 'rating' => 4.9, 'review_count' => 203, 'material' => 'Walnut Wood'],
            ['category_id' => 3, 'name' => 'Bamboo Board Set', 'slug' => 'bamboo-board-set', 'price' => 2199, 'sale_price' => 1799, 'stock' => 45, 'rating' => 4.2, 'review_count' => 31],
            ['category_id' => 4, 'name' => 'Borosilicate Water Carafe', 'slug' => 'borosilicate-water-carafe', 'price' => 1499, 'sale_price' => null, 'stock' => 20, 'is_new_arrival' => true, 'rating' => 4.6, 'review_count' => 55],
            ['category_id' => 5, 'name' => 'Copper Measuring Cups Set', 'slug' => 'copper-measuring-cups-set', 'price' => 5299, 'sale_price' => null, 'stock' => 16, 'is_featured' => true, 'rating' => 4.4, 'review_count' => 78, 'material' => 'Copper'],
            ['category_id' => 5, 'name' => 'Wooden Spoon Set', 'slug' => 'wooden-spoon-set', 'price' => 899, 'sale_price' => 699, 'stock' => 120, 'is_bestseller' => true, 'rating' => 4.5, 'review_count' => 156],
            ['category_id' => 6, 'name' => 'Glass Spice Jar Set', 'slug' => 'glass-spice-jar-set', 'price' => 2499, 'sale_price' => null, 'stock' => 38, 'rating' => 4.3, 'review_count' => 44],
        ];

        foreach ($products as $p) {
            Product::create(array_merge($p, [
                'short_description' => 'Premium quality kitchen essential, crafted for the everyday cook.',
                'description' => 'A beautifully crafted kitchen essential that brings both function and elegance to your cooking space. Made with the finest materials, this piece is built to last a lifetime.',
                'sku' => 'HAC-' . strtoupper(substr($p['slug'], 0, 8)) . rand(100, 999),
                'is_active' => true,
            ]));
        }
    }
}
