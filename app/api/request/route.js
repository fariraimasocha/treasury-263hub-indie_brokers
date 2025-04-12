import NextResponse from "next/server";
import { connect } from "@/utils/connect";
import Request from "@/models/request";

export async function POST(req) {
    try {
        await connect();
    
        const { dept, budget, year, quater, reason } = await req.json();
    
        if (!dept || !budget || !year || !quater) {
        return NextResponse.json(
            { message: "Please fill in all the required fields!" },
            { status: 400 }
        );
        }
    
        await Request.create({
        dept,
        budget,
        year,
        quater,
        reason,
        });
    
        return NextResponse.json(
        {
            message: "Request created successfully",
        },
        { status: 201 }
        );
    } catch (error) {
        console.log("Error while creating request: ", error);
        return NextResponse.json(
        { message: "Error while creating request" },
        { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        await connect();
    
        const requests = await Request.find().populate("dept");
    
        return NextResponse.json({
        message: "Requests fetched successfully",
        requests,
        });
    } catch (error) {
        console.log("Error while fetching requests: ", error);
        return NextResponse.json(
        { message: "Error while fetching requests" },
        { status: 500 }
        );
    }
}