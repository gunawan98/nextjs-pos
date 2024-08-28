"use client";

export default function Home() {
  const handleOnSubmit = (e) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const product = data.get("product");

    console.log("Barcode result: ", product);
  };

  return (
    <main>
      <div>
        <h3>Home Product</h3>
        <form onSubmit={handleOnSubmit}>
          <input type="text" name="product" label="barcode" />
          <button type="submit">Scan</button>
        </form>
      </div>
    </main>
  );
}
