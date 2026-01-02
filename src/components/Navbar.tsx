import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LogOut, Heart, Package, Shield } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CartAlerts from "@/components/CartAlerts";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Men", path: "/#men" },
    { name: "Women", path: "/#women" },
    { name: "Clothing", path: "/#clothing" },
    { name: "Shoes", path: "/#shoes" },
    { name: "Accessories", path: "/#accessories" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-gradient">SHOP</span>
            <span className="text-foreground">LANE</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Icons */}
        <div className="flex items-center space-x-2">
          {/* Cart Alerts for logged in users */}
          {user && <CartAlerts />}

          <Link to="/wishlist" className="relative">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Button>
          </Link>

          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hidden md:flex">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user.email || "U")}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">My Account</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="hidden md:flex">
              <Button variant="ghost" size="sm">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-background">
          <ul className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.path) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
            <li>
              {user ? (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth" className="block" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
