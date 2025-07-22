import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, User, ShoppingCart, Plane, GraduationCap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface HeaderProps {
  cartItemsCount?: number;
}

export function Header({ cartItemsCount = 0 }: HeaderProps) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center mr-2.5">
          <img 
            src="/logo-color.png" 
            alt="Student Travel Center" 
            className="h-12 w-auto"
          />
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "default" : "ghost"} 
              size="sm"
              className="flex items-center"
            >
              <Globe className="h-4 w-4 mr-2" />
              Inicio
            </Button>
          </Link>
          <Link to="/programas">
            <Button 
              variant={location.pathname === "/programas" ? "default" : "ghost"} 
              size="sm"
              className="flex items-center"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Programas
            </Button>
          </Link>
          <Link to="/flights">
            <Button 
              variant={location.pathname === "/flights" ? "default" : "ghost"} 
              size="sm"
              className="flex items-center"
            >
              <Plane className="h-4 w-4 mr-2" />
              Vuelos
            </Button>
          </Link>
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