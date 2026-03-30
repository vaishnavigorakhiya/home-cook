<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('user');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', "%{$request->search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%"));
            });
        }
        if ($request->status) $query->where('status', $request->status);
        if ($request->payment_status) $query->where('payment_status', $request->payment_status);

        $orders = $query->latest()->paginate(15);
        return response()->json($orders);
    }

    public function show($id)
    {
        return response()->json(Order::with(['user', 'items.product'])->findOrFail($id));
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
        ]);
        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        if ($request->status === 'shipped') $order->update(['shipped_at' => now()]);
        if ($request->status === 'delivered') $order->update(['delivered_at' => now()]);

        return response()->json(['message' => 'Order status updated', 'order' => $order]);
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
        ]);
        $order = Order::findOrFail($id);
        $order->update(['payment_status' => $request->payment_status]);
        return response()->json(['message' => 'Payment status updated', 'order' => $order]);
    }
}
