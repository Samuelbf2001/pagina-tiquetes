import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, User, ShoppingCart } from "lucide-react";

interface HeaderProps {
  cartItemsCount?: number;
}

export function Header({ cartItemsCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Student Travel Center
            </h1>
            <p className="text-xs text-muted-foreground">STC</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar programas, destinos..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <User className="h-4 w-4 mr-2" />
            Agencia
          </Button>
          
          <Button variant="outline" size="sm" className="relative">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cotizaciones
            {cartItemsCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                {cartItemsCount}
              </Badge>
            )}
          </Button>

          <Button size="sm" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
            Ingresar
          </Button>
        </div>
      </div>
    </header>
  );
}