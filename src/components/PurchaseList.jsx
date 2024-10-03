"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PurchaseList() {
  const [cart, setCart] = useState(null);
  const [currentCart, setCurrentCart] = useState(null);
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchData = async (url, errorMessage) => {
    try {
      const response = await fetch(url);

      if (response.status === 401) {
        router.push("/login");
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorMessage);
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const fetchCompletedCart = async () => {
    setLoading(true);
    const data = await fetchData("/api/cart/finished", "Failed to fetch carts");

    if (data?.data) {
      setCart(data.data);
    }
    setLoading(false);
  };

  const fetchDetailPurchase = async () => {
    setError(null);
    setPurchase(null); // Reset purchase sebelum fetch data baru

    if (!currentCart) return;

    const data = await fetchData(
      `/api/purchase/${currentCart.id}`,
      "Failed to fetch purchase details"
    );

    if (data?.code === 200) {
      setPurchase(data.data);
    }
  };

  useEffect(() => {
    fetchCompletedCart();
  }, [router]);

  useEffect(() => {
    fetchDetailPurchase();
  }, [currentCart]);

  const handleChooseCart = (item) => setCurrentCart(item);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div
        style={{ border: "solid 1px black", padding: "1rem", margin: "2rem" }}
      >
        <h3>Choose a completed cart: {currentCart?.id || "-"}</h3>
        {loading && <p>Loading carts...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading &&
          cart &&
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

      <h3>Detail Purchase:</h3>
      {purchase ? (
        <>
          <div id="print-section">
            <div
              style={{
                textAlign: "center",
                width: "100%",
              }}
            >
              <h3
                style={{
                  display: "inline-block",
                  margin: "0px ",
                  padding: "0px",
                }}
              >
                Toko Buk Cipluk
              </h3>
              <p
                style={{
                  display: "block",
                  margin: "5px 0px",
                  padding: "0px",
                }}
              >
                Jl. Mulu Jadian K9k
              </p>
            </div>

            <strong>=====================</strong>

            <div>
              <strong>Date:</strong>{" "}
              {new Date(
                new Date(purchase?.purchase?.created_at).setFullYear(
                  new Date(purchase?.purchase?.created_at).getFullYear() - 28
                )
              ).toLocaleString()}
              {/* {new Date(purchase?.purchase?.created_at).toLocaleString()} */}
            </div>

            <strong>=====================</strong>

            <table style={{ width: "100%", paddingTop: 3, paddingBottom: 3 }}>
              <tbody>
                {purchase?.items.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr>
                      <td colSpan={4}>
                        <strong>{item.product_name}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td width="10%" align="right">
                        {item.quantity}
                      </td>
                      <td width="10%" align="left">
                        X
                      </td>
                      <td width="40%" align="right">
                        {item.unit_price.toLocaleString()}
                      </td>
                      <td width="40%" align="right">
                        {item.total_price.toLocaleString()}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            <strong>=====================</strong>
            <table style={{ width: "100%", marginTop: 2 }}>
              <tbody>
                <tr>
                  <td width="50%" align="left">
                    Total
                  </td>
                  <td width="50%" align="right">
                    <strong>
                      {purchase?.purchase?.total_amount.toLocaleString()}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td width="50%" align="left">
                    Bayar
                  </td>
                  <td width="50%" align="right">
                    {purchase?.purchase?.paid.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td width="50%" align="left">
                    Kembali
                  </td>
                  <td width="50%" align="right">
                    {purchase?.purchase?.cash_back.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                textAlign: "center",
                paddingTop: 4,
                margin: "auto",
                fontSize: ".7rem",
              }}
            >
              <p>
                TERIMAKASIH ATAS KUNJUNGAN ANDA
                <br />
                BARANG YANG DIBELI TIDAK BOLEH DITUKAR KEMBALI.
              </p>
            </div>
          </div>

          {/* Tombol print */}
          <button onClick={handlePrint} style={{ marginTop: "20px" }}>
            Print Purchase
          </button>
        </>
      ) : (
        <p>No purchase details available</p>
      )}
    </>
  );
}
