// ============================================================
// AgroConnect — useCart Hook
// src/hooks/useCart.js
// ============================================================
import { useCartContext } from '../context/CartContext';
import { useNotificationContext } from '../context/NotificationContext';

const useCart = () => {
  const cart = useCartContext();
  const { success, info } = useNotificationContext();

  const handleAddItem = (product, qty = 1) => {
    cart.addItem(product, qty);
    success(`${product.name} added to cart`, '🛒 Cart updated');
  };

  const handleRemoveItem = (id, name) => {
    cart.removeItem(id);
    info(`${name} removed from cart`);
  };

  const handleClearCart = () => {
    cart.clearCart();
    info('Cart cleared');
  };

  return {
    ...cart,
    handleAddItem,
    handleRemoveItem,
    handleClearCart,
  };
};

export default useCart;