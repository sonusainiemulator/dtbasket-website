"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { ProductItem } from "@/types";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => productService.searchItems(debouncedQuery, 1),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  const results: ProductItem[] = data?.result ?? [];

  const handleChange = (q: string) => { setQuery(q); setIsOpen(q.length >= 2); };
  const clearSearch = () => { setQuery(""); setDebouncedQuery(""); setIsOpen(false); };

  return { query, results, isLoading, isOpen, setIsOpen, handleChange, clearSearch };
}
