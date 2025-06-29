import { useQuery } from "@tanstack/react-query";

export function useSystemData() {
  return useQuery({
    queryKey: ["/api/system/overview"],
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}
