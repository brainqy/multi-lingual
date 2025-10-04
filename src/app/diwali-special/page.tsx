
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sparkles, ShoppingCart, IndianRupee } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const diwaliProducts = [
  {
    id: "diya-1",
    name: "Terracotta Designer Diyas",
    price: "299",
    description: "Set of 12 handcrafted terracotta diyas, painted in vibrant colors.",
    imageUrl: "https://picsum.photos/seed/diya/400/400",
    imageHint: "clay lamps"
  },
  {
    id: "lantern-1",
    name: "Akash Kandil - Paper Lantern",
    price: "499",
    description: "Large, traditional star-shaped paper lantern (kandil) for outdoor decoration.",
    imageUrl: "https://picsum.photos/seed/kandil/400/400",
    imageHint: "paper lantern"
  },
  {
    id: "lights-1",
    name: "LED Rice Lights String",
    price: "349",
    description: "10-meter warm white LED string light, perfect for decorating windows and balconies.",
    imageUrl: "https://picsum.photos/seed/ledlights/400/400",
    imageHint: "string lights"
  },
  {
    id: "rangoli-1",
    name: "Acrylic Rangoli Set",
    price: "799",
    description: "Reusable 9-piece acrylic rangoli set with intricate designs and kundan work.",
    imageUrl: "https://picsum.photos/seed/rangoli/400/400",
    imageHint: "rangoli art"
  },
  {
    id: "thali-1",
    name: "Pooja Thali Set",
    price: "899",
    description: "Decorated steel pooja thali set with diya, incense holder, and containers.",
    imageUrl: "https://picsum.photos/seed/pooja/400/400",
    imageHint: "prayer plate"
  },
  {
    id: "gift-1",
    name: "Festive Dry Fruits Box",
    price: "1299",
    description: "Assorted premium dry fruits in an elegant gift box. Perfect for gifting.",
    imageUrl: "https://picsum.photos/seed/giftbox/400/400",
    imageHint: "gift box"
  },
];

export default function DiwaliSpecialPage() {
  const { toast } = useToast();

  const handleAddToCart = (productName: string) => {
    toast({
      title: "Added to Cart (Mock)",
      description: `${productName} has been added to your cart.`,
    });
  };

  const handleBuyNow = (productName: string) => {
    toast({
      title: "Proceeding to Checkout (Mock)",
      description: `Redirecting to payment page for ${productName}.`,
    });
  };

  return (
    <div className="bg-background">
       <header className="bg-card text-card-foreground shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="h-7 w-7 text-primary" />
            <span className="hidden sm:inline">Diwali Specials</span>
          </Link>
          <nav className="space-x-2 sm:space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-yellow-600 dark:text-yellow-400 font-headline">
              Festival of Lights Celebration
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-foreground/80">
              Illuminate your homes and hearts with our exclusive collection of Diwali essentials. From traditional diyas to modern decor, find everything you need for a sparkling celebration.
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-foreground mb-10">Our Festive Collection</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {diwaliProducts.map((product) => (
                <Card key={product.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden">
                  <div className="relative w-full h-64 bg-secondary">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      data-ai-hint={product.imageHint}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription className="pt-1">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-2xl font-bold text-primary flex items-center">
                      <IndianRupee className="h-6 w-6" /> {product.price}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={() => handleAddToCart(product.name)}>
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                    <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => handleBuyNow(product.name)}>
                      Buy Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
       <footer className="py-8 bg-card text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Diwali Specials. All rights reserved.</p>
      </footer>
    </div>
  );
}
