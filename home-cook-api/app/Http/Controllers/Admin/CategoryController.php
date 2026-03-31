<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function index()
    {
        // Return a flat list with parent info and product count
        $categories = Category::with(['parent', 'children'])
            ->withCount('products')
            ->orderBy('parent_id')
            ->orderBy('sort_order')
            ->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'parent_id'   => 'nullable|exists:categories,id',
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'sort_order'  => 'integer',
            'is_active'   => 'boolean',
        ]);

        $data['slug'] = $this->uniqueSlug(Str::slug($data['name']));

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $cat = Category::create($data);
        return response()->json([
            'message'  => 'Category created',
            'category' => $cat->load(['parent', 'children'])->loadCount('products'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $cat  = Category::findOrFail($id);
        $data = $request->validate([
            'parent_id'   => 'nullable|exists:categories,id',
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'sort_order'  => 'integer',
            'is_active'   => 'boolean',
        ]);

        // Prevent a category from being its own parent or a child becoming parent
        if (!empty($data['parent_id'])) {
            if ((int) $data['parent_id'] === $cat->id) {
                return response()->json(['message' => 'A category cannot be its own parent.'], 422);
            }
            // Prevent circular: check that the chosen parent is not a child of this category
            $childIds = $cat->children->pluck('id')->toArray();
            if (in_array((int) $data['parent_id'], $childIds)) {
                return response()->json(['message' => 'Cannot set a child category as parent.'], 422);
            }
        }

        $data['slug'] = $this->uniqueSlug(Str::slug($data['name']), $cat->id);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($cat->image) {
                Storage::disk('public')->delete($cat->image);
            }
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        // Allow clearing image
        if ($request->input('remove_image') === 'true' || $request->input('remove_image') === true) {
            if ($cat->image) {
                Storage::disk('public')->delete($cat->image);
            }
            $data['image'] = null;
        }

        $cat->update($data);
        return response()->json([
            'message'  => 'Category updated',
            'category' => $cat->fresh()->load(['parent', 'children'])->loadCount('products'),
        ]);
    }

    public function destroy($id)
    {
        $cat = Category::with('children')->findOrFail($id);

        // Remove image from storage
        if ($cat->image) {
            Storage::disk('public')->delete($cat->image);
        }

        // Move children to parent's parent (or root) before deleting
        if ($cat->children->count() > 0) {
            Category::where('parent_id', $cat->id)
                ->update(['parent_id' => $cat->parent_id]);
        }

        $cat->delete();
        return response()->json(['message' => 'Category deleted']);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private function uniqueSlug(string $base, ?int $excludeId = null): string
    {
        $slug  = $base;
        $i     = 1;
        while (true) {
            $query = Category::where('slug', $slug);
            if ($excludeId) $query->where('id', '!=', $excludeId);
            if (!$query->exists()) break;
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
}
