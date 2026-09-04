import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Procesando from "@/pages/checkout/Procesando";
import {
  confirmReceiptPayment,
  fetchOrderWithPayment,
  uploadReceipt,
} from "@/features/checkout/paymentService";

vi.mock("@/features/checkout/paymentService", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    confirmReceiptPayment: vi.fn().mockResolvedValue({
      orderId: "100",
      paymentId: "pay-1",
      status: "PAID",
      total: 50000,
    }),
    fetchOrderWithPayment: vi.fn().mockResolvedValue({
      id: "100",
      user_id: "u1",
      status: "PENDING_PAYMENT",
      subtotal: 35000,
      shipping_cost: 13900,
      total: 50000,
      currency: "COP",
      shipping_address: { full_name: "Ana Test" },
      payment: { method: "NEQUI", status: "PENDING" },
    }),
    uploadReceipt: vi.fn().mockResolvedValue({ path: "u1/100/abc.png" }),
  };
});

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => true,
}));

vi.mock("@/features/cart/CartProvider", () => ({
  useCart: () => ({
    items: [],
    clearCart: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    getSubtotal: () => 0,
    getShippingCost: () => 0,
    getTotal: () => 0,
    getItemCount: () => 0,
  }),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

function setup(initialEntry: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/checkout/procesando" element={<Procesando />} />
          <Route path="/checkout/confirmacion" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

// Simulates a real FileReader reading an image file and firing onload.
function mockFileReader(url: string) {
  class FakeFileReader {
    onload: (() => void) | null = null;
    result: string | null = null;
    readAsDataURL() {
      this.result = url;
      this.onload?.();
    }
  }
  // @ts-expect-error test double
  global.FileReader = FakeFileReader;
}

function createImageFile(size = 1000) {
  const bytes = new Uint8Array(size);
  return new File([bytes], "comprobante.png", { type: "image/png" });
}

async function reachFinalize() {
  setup("/checkout/procesando?orderId=100&method=NEQUI");
  // wait for order to load
  await act(async () => {
    await vi.advanceTimersByTime(0);
  });
  mockFileReader("data:image/png;base64,AAAA");
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [createImageFile()] } });
  await act(async () => {
    await vi.advanceTimersByTime(1500);
  });
}

describe("Procesando — direct transfer receipt flow (NEQUI / DAVIPLATA)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    global.window.open = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the loading state while fetching the order", () => {
    setup("/checkout/procesando?orderId=100&method=NEQUI");
    expect(screen.getByText("Cargando tu pedido...")).toBeInTheDocument();
  });

  it("shows the total to transfer and the selected wallet", async () => {
    setup("/checkout/procesando?orderId=100&method=NEQUI");
    await act(async () => {
      await vi.advanceTimersByTime(0);
    });
    expect(screen.getByText(/Realiza tu transferencia/)).toBeInTheDocument();
    expect(screen.getByText(/cuenta Nequi:/)).toBeInTheDocument();
  });

  it("fetches the official order total from Supabase (not from URL)", async () => {
    setup("/checkout/procesando?orderId=100&method=NEQUI&monto=99999");
    await act(async () => {
      await vi.advanceTimersByTime(0);
    });
    expect(fetchOrderWithPayment).toHaveBeenCalledWith("100");
    // Total = subtotal (35000) + shipping (13900) = 48900. No IVA.
    expect(screen.getByText("$48.900 COP")).toBeInTheDocument();
  });

  it("offers to open Nequi in the browser", async () => {
    setup("/checkout/procesando?orderId=100&method=NEQUI");
    await act(async () => {
      await vi.advanceTimersByTime(0);
    });
    fireEvent.click(screen.getByText(/Abrir Nequi en el navegador/));
    expect(global.window.open).toHaveBeenCalledWith(
      "https://www.nequi.com.co/",
      "_blank",
    );
  });

  it("validates the file type before allowing finalize", async () => {
    setup("/checkout/procesando?orderId=100&method=NEQUI");
    await act(async () => {
      await vi.advanceTimersByTime(0);
    });
    const pdf = new File(["x"], "a.pdf", { type: "application/pdf" });
    mockFileReader("data:image/png;base64,AAAA");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [pdf] } });
    expect(screen.getByText(/Solo se permiten imágenes PNG, JPG o WEBP/)).toBeInTheDocument();
  });

  it("validates the file size limit (8 MB)", async () => {
    setup("/checkout/procesando?orderId=100&method=NEQUI");
    await act(async () => {
      await vi.advanceTimersByTime(0);
    });
    const big = new File([new Uint8Array(9 * 1024 * 1024)], "a.png", { type: "image/png" });
    mockFileReader("data:image/png;base64,AAAA");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [big] } });
    expect(screen.getByText(/no puede superar 8 MB/)).toBeInTheDocument();
  });

  it("finalizes after a valid receipt: uploads, confirms, clears cart and opens WhatsApp", async () => {
    await reachFinalize();
    fireEvent.click(screen.getByText("ENVIAR COMPROBANTE Y FINALIZAR"));
    await act(async () => {
      await vi.advanceTimersByTime(0);
    });

    expect(uploadReceipt).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: "100" }),
    );
    expect(confirmReceiptPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "100",
        paymentMethod: "NEQUI",
        receipt: expect.objectContaining({ storage_path: "u1/100/abc.png" }),
      }),
    );

    const whatsappCall = (global.window.open as unknown as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => String(c[0]).startsWith("https://wa.me/573133030681?"),
    );
    expect(whatsappCall).toBeTruthy();
    const encoded = whatsappCall[0] as string;
    expect(encoded).toContain("Hola%2C%20acabo%20de%20realizar%20una%20transferencia");
    expect(encoded).toContain("Casa%20Crescencia");
  });

  it("navigates to the confirmation screen after success", async () => {
    await reachFinalize();
    fireEvent.click(screen.getByText("ENVIAR COMPROBANTE Y FINALIZAR"));
    await act(async () => {
      await vi.advanceTimersByTime(0);
    });
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/checkout/confirmacion?orderId=100&method=NEQUI&monto=48900",
    );
  });

  it("is idempotent: a PAID order is shown as already confirmed without re-confirming", async () => {
    (fetchOrderWithPayment as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "100",
      user_id: "u1",
      status: "PAID",
      subtotal: 35000,
      shipping_cost: 13900,
      total: 50000,
      currency: "COP",
      shipping_address: { full_name: "Ana Test" },
      payment: { method: "NEQUI", status: "COMPLETED" },
    });
    setup("/checkout/procesando?orderId=100&method=NEQUI");
    await act(async () => {
      await vi.advanceTimersByTime(0);
    });
    expect(screen.getByText("¡Pago confirmado!")).toBeInTheDocument();
    expect(confirmReceiptPayment).not.toHaveBeenCalled();
  });
});
