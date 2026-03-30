<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Str;


class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('sku', 'like', "%{$request->search}%");
            });
        }
        if ($request->category_id) $query->where('category_id', $request->category_id);
        if ($request->status === 'active') $query->where('is_active', true);
        if ($request->status === 'inactive') $query->where('is_active', false);
        if ($request->stock === 'low') $query->where('stock', '<=', 10)->where('stock', '>', 0);
        if ($request->stock === 'out') $query->where('stock', 0);

        $products = $query->latest()->paginate(15);
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id'       => 'required|exists:categories,id',
            'name'              => 'required|string|max:255',
            'description'       => 'nullable|string',
            'short_description' => 'nullable|string',
            'price'             => 'required|numeric|min:0',
            'sale_price'        => 'nullable|numeric|min:0',
            'stock'             => 'required|integer|min:0',
            'sku'               => 'nullable|string|unique:products,sku',
            'material'          => 'nullable|string',
            'dimensions'        => 'nullable|string',
            'weight'            => 'nullable|string',
            'is_active'         => 'boolean',
            'is_featured'       => 'boolean',
            'is_new_arrival'    => 'boolean',
            'is_bestseller'     => 'boolean',
        ]);

        $data['slug'] = Str::slug($data['name']) . '-' . Str::random(4);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($data);
        return response()->json(['message' => 'Product created', 'product' => $product->load('category')], 201);
    }

    public function show($id)
    {
        return response()->json(Product::with('category')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'category_id'       => 'required|exists:categories,id',
            'name'              => 'required|string|max:255',
            'description'       => 'nullable|string',
            'short_description' => 'nullable|string',
            'price'             => 'required|numeric|min:0',
            'sale_price'        => 'nullable|numeric|min:0',
            'stock'             => 'required|integer|min:0',
            'sku'               => 'nullable|string|unique:products,sku,' . $id,
            'material'          => 'nullable|string',
            'dimensions'        => 'nullable|string',
            'weight'            => 'nullable|string',
            'is_active'         => 'boolean',
            'is_featured'       => 'boolean',
            'is_new_arrival'    => 'boolean',
            'is_bestseller'     => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);
        return response()->json(['message' => 'Product updated', 'product' => $product->fresh()->load('category')]);
    }

    public function destroy($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Product deleted']);
    }

    public function toggleStatus($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => !$product->is_active]);
        return response()->json(['message' => 'Status updated', 'is_active' => $product->is_active]);
    }
}
