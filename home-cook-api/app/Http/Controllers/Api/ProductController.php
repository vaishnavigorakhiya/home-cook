<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category')->active();

        if ($request->category) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }
        if ($request->featured) $query->where('is_featured', true);
        if ($request->new_arrivals) $query->where('is_new_arrival', true);
        if ($request->bestsellers) $query->where('is_bestseller', true);

        $sortField = match($request->sort) {
            'price_asc'  => ['price', 'asc'],
            'price_desc' => ['price', 'desc'],
            'rating'     => ['rating', 'desc'],
            'newest'     => ['created_at', 'desc'],
            default      => ['created_at', 'desc'],
        };
        $query->orderBy($sortField[0], $sortField[1]);

        if ($request->min_price) $query->where('price', '>=', $request->min_price);
        if ($request->max_price) $query->where('price', '<=', $request->max_price);

        $products = $query->paginate($request->per_page ?? 12);

        return response()->json($products);
    }

    public function show($slug)
    {
        $product = Product::with(['category', 'reviews.user'])
            ->where('slug', $slug)
            ->active()
            ->firstOrFail();

        return response()->json($product);
    }

    public function featured()
    {
        $products = Product::with('category')->active()->featured()->take(8)->get();
        return response()->json($products);
    }

    public function categories()
    {
        $categories = Category::where('is_active', true)
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();
        return response()->json($categories);
    }
}
