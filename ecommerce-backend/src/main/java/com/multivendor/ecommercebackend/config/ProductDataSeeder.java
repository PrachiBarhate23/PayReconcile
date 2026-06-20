package com.multivendor.ecommercebackend.config;

import com.multivendor.ecommercebackend.model.Product;
import com.multivendor.ecommercebackend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductDataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            log.info("Products already seeded — skipping.");
            return;
        }

        log.info("Seeding product catalog...");

        List<Product> products = Arrays.asList(
            buildProduct("Sony WH-1000XM5 Wireless Headphones",
                "Industry-leading noise cancellation with 30-hour battery life. Crystal clear hands-free calling with multipoint connection.",
                28999, 34999, "Electronics", "Sony",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                4.8, 12847, true, "Best Seller", List.of("wireless", "noise-cancelling", "premium")),

            buildProduct("Apple MacBook Air M3",
                "Supercharged by M3 chip. Up to 18 hours battery. Impossibly thin design with a stunning Liquid Retina display.",
                114900, 124900, "Computers", "Apple",
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
                4.9, 8432, true, "Top Rated", List.of("laptop", "m3", "apple")),

            buildProduct("Samsung Galaxy S24 Ultra",
                "The ultimate Galaxy with AI-powered features. Built-in S Pen. 200MP camera with ProVisual Engine.",
                134999, 149999, "Smartphones", "Samsung",
                "https://images.unsplash.com/photo-1610945264803-c22b62831bd5?w=500",
                4.7, 6219, true, "Deal", List.of("smartphone", "camera", "ai")),

            buildProduct("Nike Air Max 270",
                "Max Air unit in the heel for lightweight, responsive cushioning. Mesh upper for breathability and style.",
                12995, 15995, "Footwear", "Nike",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
                4.5, 3421, false, "New", List.of("shoes", "sports", "comfort")),

            buildProduct("Instant Pot Duo 7-in-1",
                "7 appliances in one: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker and warmer.",
                7999, 9999, "Kitchen", "Instant Pot",
                "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500",
                4.6, 21043, false, "Best Seller", List.of("kitchen", "cooking", "pressure-cooker")),

            buildProduct("Kindle Paperwhite 11th Gen",
                "Thinner and lighter than before with a flush-front design and 300 ppi glare-free display. Waterproof (IPX8).",
                13999, 16999, "Electronics", "Amazon",
                "https://images.unsplash.com/photo-1512280137-8e450d4dd2d5?w=500",
                4.7, 9832, false, "Deal", List.of("ebook", "reader", "kindle")),

            buildProduct("Levi's 501 Original Fit Jeans",
                "The original jean since 1873. Straight leg, sits at waist. Button fly. Available in multiple washes.",
                3999, 5999, "Fashion", "Levi's",
                "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=500",
                4.4, 5621, false, null, List.of("jeans", "denim", "casual")),

            buildProduct("Dyson V15 Detect Vacuum",
                "Laser reveals hidden dust. Automatically optimizes suction across all floors. Up to 60 mins of run time.",
                54900, 64900, "Home", "Dyson",
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
                4.8, 4219, true, "Premium", List.of("vacuum", "cordless", "cleaning")),

            buildProduct("Logitech MX Master 3S Mouse",
                "Ultra-fast MagSpeed scrolling. 8000 DPI sensor works on glass. Comfortable ergonomic shape.",
                9999, 12999, "Computers", "Logitech",
                "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
                4.7, 7843, false, "Best Seller", List.of("mouse", "wireless", "ergonomic")),

            buildProduct("Nespresso Vertuo Pop Coffee",
                "Enjoy 5 cup sizes from Espresso to Alto XL. Centrifusion technology for authentic crema. WiFi enabled.",
                7499, 8999, "Kitchen", "Nespresso",
                "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=500",
                4.5, 3102, false, "New", List.of("coffee", "espresso", "machine")),

            buildProduct("Canon EOS R50 Mirrorless Camera",
                "24.2 MP APS-C sensor. 4K video. AI-powered subject detection AF. Lightweight and compact.",
                64999, 74999, "Electronics", "Canon",
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
                4.6, 2876, true, "Top Rated", List.of("camera", "mirrorless", "photography")),

            buildProduct("IKEA KALLAX Shelf Unit",
                "Versatile shelving unit that can be used as a room divider. Use with or without inserts.",
                8999, 8999, "Furniture", "IKEA",
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                4.3, 15432, false, null, List.of("furniture", "storage", "shelf"))
        );

        productRepository.saveAll(products);
        log.info("✅ Seeded {} products successfully.", products.size());
    }

    private Product buildProduct(String name, String description, double price, double originalPrice,
                                  String category, String brand, String imageUrl,
                                  double rating, int reviewCount, boolean featured,
                                  String badge, List<String> tags) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setPrice(price);
        p.setOriginalPrice(originalPrice);
        p.setCategory(category);
        p.setBrand(brand);
        p.setImageUrl(imageUrl);
        p.setRating(rating);
        p.setReviewCount(reviewCount);
        p.setStockQuantity(100);
        p.setInStock(true);
        p.setFeatured(featured);
        p.setBadge(badge);
        p.setTags(tags);
        p.setCreatedAt(LocalDateTime.now());
        return p;
    }
}
