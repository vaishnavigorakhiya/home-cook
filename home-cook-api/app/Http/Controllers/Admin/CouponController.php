<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Coupon;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    public function index()
    {
        return response()->json(Coupon::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'              => 'nullable|string|max:20',
            'type'              => 'required|in:fixed,percent',
            'value'             => 'required|numeric|min:1',
            'min_order_amount'  => 'nullable|numeric|min:0',
            'usage_limit'       => 'nullable|integer|min:1',
            'expires_at'        => 'nullable|date|after:today',
            'is_active'         => 'boolean',
        ]);

        $data['code'] = strtoupper($data['code'] ?? Str::random(8));
        $data['min_order_amount'] = $data['min_order_amount'] ?? 0;

        $coupon = Coupon::create($data);
        return response()->json(['message' => 'Coupon created', 'coupon' => $coupon], 201);
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);
        $data = $request->validate([
            'type'             => 'required|in:fixed,percent',
            'value'            => 'required|numeric|min:1',
            'min_order_amount' => 'nullable|numeric|min:0',
            'usage_limit'      => 'nullable|integer|min:1',
            'expires_at'       => 'nullable|date',
            'is_active'        => 'boolean',
        ]);
        $coupon->update($data);
        return response()->json(['message' => 'Coupon updated', 'coupon' => $coupon->fresh()]);
    }

    public function destroy($id)
    {
        Coupon::findOrFail($id)->delete();
        return response()->json(['message' => 'Coupon deleted']);
    }
}
