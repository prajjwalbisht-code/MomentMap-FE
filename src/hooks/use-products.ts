import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertProduct } from "@shared/routes";

// GET /api/products
export function useProducts(filters?: { category?: string; search?: string }) {
    return useQuery({
        queryKey: [api.products.list.path, filters],
        queryFn: async () => {
            let url = api.products.list.path;
            if (filters) {
                const params = new URLSearchParams();
                if (filters.category) params.append("category", filters.category);
                if (filters.search) params.append("search", filters.search);
                if (params.toString()) url += `?${params.toString()}`;
            }

            const res = await fetch(url, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch products");
            return await res.json();
        },
    });
}

// POST /api/products
export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: InsertProduct) => {
            const res = await fetch(api.products.create.path, {
                method: api.products.create.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });

            if (!res.ok) {
                if (res.status === 400) throw new Error("Invalid product data");
                throw new Error("Failed to create product");
            }
            return api.products.create.responses[201].parse(await res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
        },
    });
}
export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ name, styleCode }: { name?: string; styleCode?: string }) => {
            const params = new URLSearchParams();
            if (name) params.append("name", name);
            if (styleCode) params.append("styleCode", styleCode);

            const res = await fetch(`${api.products.list.path}?${params.toString()}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to delete product");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
        },
    });
}
