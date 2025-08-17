-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate total order amount
CREATE OR REPLACE FUNCTION public.calculate_order_total(order_id uuid)
RETURNS decimal AS $$
BEGIN
    RETURN (
        SELECT SUM(price_at_time * quantity)
        FROM order_items
        WHERE order_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update product stock
CREATE OR REPLACE FUNCTION public.update_stock()
RETURNS trigger AS $$
BEGIN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stock when order item is created
CREATE TRIGGER update_stock_on_order
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_stock();
