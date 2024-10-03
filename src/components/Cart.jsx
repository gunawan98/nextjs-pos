"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddForm } from "./form/cart/add-form";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [currentCart, setCurrentCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const [picu, setPicu] = useState(false);

  useEffect(() => {
    fetchAvailableCart();
  }, [router]);

  const fetchAvailableCart = async () => {
    try {
      const response = await fetch("/api/cart");

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch carts");
      }

      const data = await response.json();
      if (data?.data) {
        setCart(data?.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCart = async () => {
    const dataToPost = {
      completed: false,
    };

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToPost),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to creat cart");
      }

      if (data?.data) {
        fetchAvailableCart();
        setCurrentCart(data?.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // const handleSetCartItem = useCallback((newItems) => {
  //   setCartItem(newItems);
  // }, []);

  const handleChooseCart = (item) => setCurrentCart(item);

  const handleChange = () => setPicu((curent) => !curent);

  // console.log(cart);
  // console.log(cart);

  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error}</div>;
  return (
    <>
      <button onClick={handleChange}>Change</button>
      <div
        style={{ border: "solid 1px black", padding: "1rem", margin: "2rem" }}
      >
        <button onClick={handleCreateCart}>Create Cart</button>
        <h3>Choose an available cart: {currentCart?.id || "-"}</h3>
        {cart &&
          cart.map((item) => (
            <button
              key={item.id}
              onClick={() => handleChooseCart(item)}
              disabled={item.id === currentCart?.id}
            >
              Cart {item.id}
            </button>
          ))}
      </div>
      <h3>Scan product:</h3>
      {currentCart?.id && <AddForm currentCart={currentCart} />}
    </>
  );
}
