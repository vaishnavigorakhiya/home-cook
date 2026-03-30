<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function store(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title'  => 'nullable|string|max:100',
            'body'   => 'nullable|string|max:1000',
        ]);

        $existing = Review::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this product.'], 422);
        }

        $review = Review::create([
            'user_id'    => $request->user()->id,
            'product_id' => $productId,
            'rating'     => $request->rating,
            'title'      => $request->title,
            'body'       => $request->body,
            'is_approved'=> false,
        ]);

        // Recalculate product rating
        $avg = Review::where('product_id', $productId)
            ->where('is_approved', true)
            ->avg('rating');
        $count = Review::where('product_id', $productId)
            ->where('is_approved', true)
            ->count();

        $product->update(['rating' => round($avg, 1), 'review_count' => $count]);

        return response()->json([
            'message' => 'Review submitted! It will appear after approval.',
            'review'  => $review,
        ], 201);
    }
}
