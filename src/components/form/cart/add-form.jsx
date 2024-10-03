"use client";

import { memo, useEffect, useState } from "react"; // Import useState
import { useFormStatus } from "react-dom";
import { addItemToCart, purchasingCart } from "@/app/action"; // Import server action

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Process..." : "Submit"}
    </button>
  );
}

function AddFormComponent({ currentCart }) {
  const cartId = currentCart?.id;
  const [cartItem, setCartItem] = useState(null);
  const [message, setMessage] = useState(""); // State untuk menyimpan pesan dari server
  const [error, setError] = useState(""); // State untuk menyimpan error

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch(`/api/cart-item?cartId=${cartId}`);

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch products");
        }

        const data = await response.json();
        if (data?.data) {
          setCartItem(data?.data);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCartItems();
  }, [cartId]);

  const handleAddProductToCart = async (formData) => {
    // Reset pesan dan error sebelumnya
    setMessage("");
    setError("");

    const response = await addItemToCart(formData, cartId); // Memanggil server action
    // Cek apakah respons sukses atau error
    if (response.status === 200) {
      const getCartItem = await fetch(`/api/cart-item?cartId=${cartId}`);

      if (getCartItem.status === 401) {
        router.push("/login");
        return;
      }

      if (!getCartItem.ok) {
        const errorData = await getCartItem.json();
        throw new Error(errorData.message || "Failed to fetch products");
      }

      const data = await getCartItem.json();
      console.log("get again: ", data);
      if (data?.data) {
        setCartItem(data?.data);
      }

      setMessage(response.message);
    } else {
      setError(response.message);
    }
  };

  const handlePurchase = async (formData) => {
    setMessage("");
    setError("");

    const response = await purchasingCart(formData, cartId); // Memanggil server action
    if (response.status === 200) {
      console.log("res: ", response);
      setCartItem(null);
      setMessage(response.message);
    } else {
      setError(response.message);
    }
  };

  console.log(cartItem);
  return (
    <>
      {/* Menampilkan pesan sukses atau error */}
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form action={handleAddProductToCart}>
        <label htmlFor="barcode">Barcode</label>
        <input type="text" id="barcode" name="barcode" required />
        <label htmlFor="quantity">Quantity</label>
        <input type="number" id="quantity" name="quantity" required />
        <SubmitButton />
      </form>
      <br />
      {cartItem?.items &&
        cartItem.items.map((item) => (
          <div key={item.id}>
            <strong>x{item.quantity}</strong> {item.product_name}{" "}
            {item.total_price}
          </div>
        ))}
      <br />
      <form action={handlePurchase}>
        paid:
        <input type="text" name="paid" required />
        payment method:
        <input type="text" name="payment_method" required />
        <SubmitButton />
      </form>
    </>
  );
}

export const AddForm = memo(AddFormComponent);
