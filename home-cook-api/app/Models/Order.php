<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'order_number', 'status', 'subtotal', 'shipping_amount',
        'discount_amount', 'total', 'payment_method', 'payment_status',
        'payment_id', 'shipping_address', 'shipping_city', 'shipping_state',
        'shipping_pincode', 'shipping_phone', 'notes', 'shipped_at', 'delivered_at',
    ];

    protected $casts = [
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    protected static function booted()
    {
        static::creating(function ($order) {
            $order->order_number = 'HAC-' . strtoupper(uniqid());
        });
    }
}
