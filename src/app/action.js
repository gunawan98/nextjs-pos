"use server";

import { validateAndRefreshToken } from "@/lib/validate_token";
import { cookies } from "next/headers";
import { z } from "zod";

export async function addItemToCart(formData, cartId) {
  const schema = z.object({
    barcode: z.string().min(1),
    quantity: z.coerce.number(),
  });

  const parse = schema.safeParse({
    barcode: formData.get("barcode"),
    quantity: formData.get("quantity"),
  });

  if (!parse.success) {
    return { message: "Invalid input", status: 400 };
  }

  // Ambil cookies untuk mendapatkan token
  const cookieStore = cookies();
  // const accessToken = cookieStore.get("accessToken")?.value || "";
  // const refreshToken = cookieStore.get("refreshToken")?.value || "";

  // Validasi token
  const { validAccessToken, response } = await validateAndRefreshToken({
    cookies: cookieStore,
    headers: { cookie: cookieStore },
  });

  if (!validAccessToken) {
    return response || { message: "Not authenticated", status: 401 };
  }

  try {
    // Lakukan request ke API eksternal untuk menambah item ke cart
    const responseApi = await fetch(
      `${process.env.HOST_NAME}/api/cart-item/${cartId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${validAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parse.data),
      }
    );

    if (!responseApi.ok) {
      return {
        message: "Failed to add item to cart",
        status: responseApi.code,
      };
    }

    const cartData = await responseApi.json();

    // Invalidasi cache pada path terkait
    // revalidatePath("/dashboard");

    return { message: "Item added to cart", status: 200, data: cartData };
  } catch (error) {
    console.error("Error:", error);
    return { message: "Internal Server Error", status: 500 };
  }
}

export async function purchasingCart(formData, cartId) {
  const schema = z.object({
    cart_id: z.coerce.number(),
    paid: z.coerce.number(),
    payment_method: z.string().min(1),
  });

  const parse = schema.safeParse({
    cart_id: cartId,
    paid: formData.get("paid"),
    payment_method: formData.get("payment_method"),
  });
  console.log("input: ", parse);

  if (!parse.success) {
    return { message: "Invalid input", status: 400 };
  }

  // Ambil cookies untuk mendapatkan token
  const cookieStore = cookies();
  // const accessToken = cookieStore.get("accessToken")?.value || "";
  // const refreshToken = cookieStore.get("refreshToken")?.value || "";

  // Validasi token
  const { validAccessToken, response } = await validateAndRefreshToken({
    cookies: cookieStore,
    headers: { cookie: cookieStore },
  });

  if (!validAccessToken) {
    return response || { message: "Not authenticated", status: 401 };
  }

  try {
    const responseApi = await fetch(`${process.env.HOST_NAME}/api/purchase`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${validAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parse.data),
    });

    // if (!responseApi.ok) {
    //   return {
    //     message: responseApi.statusText,
    //     status: responseApi.status,
    //   };
    // }

    const purchaseResponse = await responseApi.json();
    console.log(purchaseResponse);
    // Invalidasi cache pada path terkait
    // revalidatePath("/dashboard");

    if (purchaseResponse.code !== 200) {
      return {
        message: `${purchaseResponse.status}, ${purchaseResponse.data}`,
        status: purchaseResponse.code,
        data: "",
      };
    }

    return {
      message: "Purchase successfully",
      status: 200,
      data: purchaseResponse.data,
    };
  } catch (error) {
    console.error("Error:", error);
    return { message: "Internal Server Error", status: 500 };
  }
}

// export async function deleteTodo(
//   prevState: {
//     message: string;
//   },
//   formData: FormData,
// ) {
//   const schema = z.object({
//     id: z.string().min(1),
//     todo: z.string().min(1),
//   });
//   const data = schema.parse({
//     id: formData.get("id"),
//     todo: formData.get("todo"),
//   });

//   try {
//     await sql`
//       DELETE FROM todos
//       WHERE id = ${data.id};
//     `;

//     revalidatePath("/");
//     return { message: `Deleted todo ${data.todo}` };
//   } catch (e) {
//     return { message: "Failed to delete todo" };
//   }
// }
