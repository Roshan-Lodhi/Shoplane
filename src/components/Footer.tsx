import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Online Store</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Men Clothing</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Women Clothing</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Men Accessories</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Women Accessories</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Useful Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Shipping Information</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get special offers and updates
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
              />
              <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SHOPLANE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
