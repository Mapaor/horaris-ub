import { NextRequest, NextResponse } from "next/server";
import { getAnyAcademicPerDefecte } from "../../../lib/anyAcademic";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const idAssignatura = searchParams.get('idAssignatura');
    const any = searchParams.get('any');
    const anySeleccionat = any ? parseInt(any, 10) : getAnyAcademicPerDefecte();

    if (!idAssignatura) {
        return NextResponse.json({ error: "Falta el paràmetre 'idAssignatura'" }, { status: 400 });
    }

    const url = `https://www.ub.edu/pladocent/rest/plandocente/getPlaDocent/${idAssignatura}/${anySeleccionat}/CAT`;

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
