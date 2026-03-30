<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);
        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = Order::with('items.product')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
        return response()->json($order);
    }

    public function store(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string',
            'shipping_city'    => 'required|string',
            'shipping_state'   => 'required|string',
            'shipping_pincode' => 'required|string|max:10',
            'shipping_phone'   => 'required|string|max:15',
            'payment_method'   => 'required|in:cod,razorpay,upi',
        ]);

        $cartItems = CartItem::with('product')
            ->where('user_id', $request->user()->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 422);
        }

        DB::beginTransaction();
        try {
            $subtotal = 0;
            foreach ($cartItems as $item) {
                $price = $item->product->sale_price ?? $item->product->price;
                $subtotal += $price * $item->quantity;
            }

            $shipping = $subtotal >= 999 ? 0 : 99;
            $total = $subtotal + $shipping;

            $order = Order::create([
                'user_id'          => $request->user()->id,
                'order_number'     => 'HAC-' . strtoupper(uniqid()),
                'status'           => 'pending',
                'subtotal'         => $subtotal,
                'shipping_amount'  => $shipping,
                'discount_amount'  => 0,
                'total'            => $total,
                'payment_method'   => $request->payment_method,
                'payment_status'   => $request->payment_method === 'cod' ? 'pending' : 'pending',
                'shipping_address' => $request->shipping_address,
                'shipping_city'    => $request->shipping_city,
                'shipping_state'   => $request->shipping_state,
                'shipping_pincode' => $request->shipping_pincode,
                'shipping_phone'   => $request->shipping_phone,
                'notes'            => $request->notes,
            ]);

            foreach ($cartItems as $item) {
                $price = $item->product->sale_price ?? $item->product->price;
                $order->items()->create([
                    'product_id'   => $item->product_id,
                    'product_name' => $item->product->name,
                    'price'        => $price,
                    'quantity'     => $item->quantity,
                    'subtotal'     => $price * $item->quantity,
                ]);
                $item->product->decrement('stock', $item->quantity);
            }

            CartItem::where('user_id', $request->user()->id)->delete();

            DB::commit();
            return response()->json(['message' => 'Order placed successfully', 'order' => $order->load('items')], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order failed: ' . $e->getMessage()], 500);
        }
    }
}
