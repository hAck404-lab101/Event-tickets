import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.DORONX_API_KEY || "drx_live_6106b6e78d21eac22972e7a148b0b2accc304fbcd8f9a724497870f958b7783f";
    const endpoint = "https://webapi.doronpay.com/smart-invoicing/wallet-profiles";

    const res = await fetch(endpoint, {
      headers: {
        "x-doronpay-api-key": apiKey,
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    const data = await res.json();

    if (!res.ok || !data.data) {
      return NextResponse.json({ success: false, wallets: [] }, { status: res.status });
    }

    // Filter active wallets
    const activeWallets = (data.data || []).filter((w: any) => w.isActive !== false);

    // Format clean list
    const formattedWallets = activeWallets.map((w: any) => ({
      id: w._id,
      asset: (w.asset || "USDT").toUpperCase(),
      network: (w.network || "TRC20").toUpperCase(),
      address: w.address,
      label: w.label || `${w.asset} (${w.network})`,
      isDefault: !!w.isDefault,
    }));

    return NextResponse.json({ success: true, wallets: formattedWallets });
  } catch (error: any) {
    console.error("Failed to fetch DoronX wallet profiles:", error);
    return NextResponse.json({ success: false, wallets: [] }, { status: 500 });
  }
}
