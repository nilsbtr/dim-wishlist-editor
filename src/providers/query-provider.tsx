import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

interface QueryProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export function QueryProvider({ children, queryClient }: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
