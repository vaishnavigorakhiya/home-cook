<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;


class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::withCount('orders');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }
        if ($request->role) $query->where('role', $request->role);

        return response()->json($query->latest()->paginate(15));
    }

    public function show($id)
    {
        $user = User::with(['orders' => fn($q) => $q->latest()->take(5)])->findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'name'  => 'required|string',
            'email' => 'required|email|unique:users,email,' . $id,
            'role'  => 'required|in:admin,customer',
            'phone' => 'nullable|string',
        ]);
        $user->update($data);
        return response()->json(['message' => 'User updated', 'user' => $user->fresh()]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot delete admin user'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }
}
