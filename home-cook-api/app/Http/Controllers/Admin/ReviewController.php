<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Product;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['user', 'product']);

        if ($request->status === 'pending')  $query->where('is_approved', false);
        if ($request->status === 'approved') $query->where('is_approved', true);
        if ($request->product_id) $query->where('product_id', $request->product_id);

        return response()->json($query->latest()->paginate(20));
    }

    public function approve($id)
    {
        $review = Review::with('product')->findOrFail($id);
        $review->update(['is_approved' => true]);

        // Recalculate product rating
        $product = $review->product;
        $avg   = Review::where('product_id', $product->id)->where('is_approved', true)->avg('rating');
        $count = Review::where('product_id', $product->id)->where('is_approved', true)->count();
        $product->update(['rating' => round($avg, 1), 'review_count' => $count]);

        return response()->json(['message' => 'Review approved']);
    }

    public function reject($id)
    {
        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Review deleted']);
    }
}
