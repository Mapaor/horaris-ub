import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: "Falta el paràmetre 'slug'" }, { status: 400 });
    }

    const url = `https://www.ub.edu/guiaacademica/rest/guiaacademica/${slug}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error en la petició:", error);
        return NextResponse.json({ error: "Error en la petició" }, { status: 500 });
    }
}
