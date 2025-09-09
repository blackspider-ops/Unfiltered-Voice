import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/enhanced-button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AuthForm } from './AuthForm';
import { PenTool, Home, Grid3X3, Mail, LogOut, Settings, User, Menu, Heart } from 'lucide-react';

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isMeetNiyatiPage = location.pathname === '/meet-niyati';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="p-2 rounded-lg bg-gradient-primary group-hover:shadow-glow transition-all duration-300">
            <PenTool className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg">{settings.site_name}</span>
            <span className="text-xs text-muted-foreground -mt-1">{settings.site_tagline}</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm">
          <Link 
            to="/" 
            className="text-foreground/60 hover:text-foreground transition-colors duration-200 flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link 
            to="/categories" 
            className="text-foreground/60 hover:text-foreground transition-colors duration-200 flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Categories
          </Link>
          <Link 
            to="/contact" 
            className="text-foreground/60 hover:text-foreground transition-colors duration-200 flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {!isHomePage && !isMeetNiyatiPage && (
            <Button 
              variant="outline" 
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link to="/meet-niyati" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Meet Niyati
              </Link>
            </Button>
          )}
          
          {user ? (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                asChild
                className="hidden sm:inline-flex"
              >
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </Button>
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  asChild
                  className="hidden sm:inline-flex"
                >
                  <Link to="/admin" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <AuthForm />
              </DialogContent>
            </Dialog>
          )}
          
          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/categories" className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Categories
                </Link>
              </DropdownMenuItem>
              {!isHomePage && !isMeetNiyatiPage && (
                <DropdownMenuItem asChild>
                  <Link to="/meet-niyati" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Meet Niyati
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link to="/contact" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact
                </Link>
              </DropdownMenuItem>
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}