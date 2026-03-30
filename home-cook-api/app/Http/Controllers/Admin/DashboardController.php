<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total');
        $totalOrders  = Order::count();
        $totalProducts = Product::count();
        $totalUsers   = User::where('role', 'customer')->count();

        $recentOrders = Order::with('user')
            ->latest()
            ->take(8)
            ->get()
            ->map(fn($o) => [
                'id'           => $o->id,
                'order_number' => $o->order_number,
                'user_name'    => $o->user->name,
                'total'        => $o->total,
                'status'       => $o->status,
                'created_at'   => $o->created_at,
            ]);

        $monthlySales = Order::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('YEAR(created_at) as year'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        $topProducts = Product::withCount(['reviews as order_count' => function ($q) {
                $q->select(DB::raw('count(*)'));
            }])
            ->orderBy('review_count', 'desc')
            ->take(5)
            ->get(['id', 'name', 'price', 'sale_price', 'stock', 'rating', 'review_count', 'image']);

        $orderStatusCounts = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $lowStock = Product::where('stock', '<=', 10)->where('is_active', true)
            ->get(['id', 'name', 'stock', 'image']);

        return response()->json([
            'stats' => [
                'total_revenue'  => $totalRevenue,
                'total_orders'   => $totalOrders,
                'total_products' => $totalProducts,
                'total_users'    => $totalUsers,
                'monthly_growth' => 12.4,
            ],
            'recent_orders'      => $recentOrders,
            'monthly_sales'      => $monthlySales,
            'top_products'       => $topProducts,
            'order_status_counts'=> $orderStatusCounts,
            'low_stock_products' => $lowStock,
        ]);
    }
}
