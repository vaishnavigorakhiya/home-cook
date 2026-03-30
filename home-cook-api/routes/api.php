<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController    as AdminProductController;
use App\Http\Controllers\Admin\CategoryController   as AdminCategoryController;
use App\Http\Controllers\Admin\OrderController      as AdminOrderController;
use App\Http\Controllers\Admin\UserController       as AdminUserController;
use App\Http\Controllers\Admin\ReviewController     as AdminReviewController;
use App\Http\Controllers\Admin\CouponController     as AdminCouponController;

// Public
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::get('/products',          [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{slug}',   [ProductController::class, 'show']);
Route::get('/categories',        [ProductController::class, 'categories']);

// Authenticated
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout',         [AuthController::class, 'logout']);
    Route::get('/auth/me',              [AuthController::class, 'me']);
    Route::put('/auth/profile',         [AuthController::class, 'updateProfile']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

    Route::get('/cart',          [CartController::class, 'index']);
    Route::post('/cart',         [CartController::class, 'add']);
    Route::put('/cart/{id}',     [CartController::class, 'update']);
    Route::delete('/cart/{id}',  [CartController::class, 'remove']);
    Route::delete('/cart',       [CartController::class, 'clear']);

    Route::get('/orders',        [OrderController::class, 'index']);
    Route::post('/orders',       [OrderController::class, 'store']);
    Route::get('/orders/{id}',   [OrderController::class, 'show']);

    Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);

    Route::get('/wishlist',         [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
    Route::get('/wishlist/{id}',    [WishlistController::class, 'check']);

    Route::post('/coupons/validate', [CouponController::class, 'validate']);
});

// Admin
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/products',               [AdminProductController::class, 'index']);
    Route::post('/products',              [AdminProductController::class, 'store']);
    Route::get('/products/{id}',          [AdminProductController::class, 'show']);
    Route::put('/products/{id}',          [AdminProductController::class, 'update']);
    Route::delete('/products/{id}',       [AdminProductController::class, 'destroy']);
    Route::patch('/products/{id}/toggle', [AdminProductController::class, 'toggleStatus']);

    Route::get('/categories',         [AdminCategoryController::class, 'index']);
    Route::post('/categories',        [AdminCategoryController::class, 'store']);
    Route::put('/categories/{id}',    [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

    Route::get('/orders',                    [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}',               [AdminOrderController::class, 'show']);
    Route::patch('/orders/{id}/status',      [AdminOrderController::class, 'updateStatus']);
    Route::patch('/orders/{id}/payment',     [AdminOrderController::class, 'updatePaymentStatus']);

    Route::get('/users',         [AdminUserController::class, 'index']);
    Route::get('/users/{id}',    [AdminUserController::class, 'show']);
    Route::put('/users/{id}',    [AdminUserController::class, 'update']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

    Route::get('/reviews',                [AdminReviewController::class, 'index']);
    Route::patch('/reviews/{id}/approve', [AdminReviewController::class, 'approve']);
    Route::delete('/reviews/{id}',        [AdminReviewController::class, 'reject']);

    Route::get('/coupons',         [AdminCouponController::class, 'index']);
    Route::post('/coupons',        [AdminCouponController::class, 'store']);
    Route::put('/coupons/{id}',    [AdminCouponController::class, 'update']);
    Route::delete('/coupons/{id}', [AdminCouponController::class, 'destroy']);
});
