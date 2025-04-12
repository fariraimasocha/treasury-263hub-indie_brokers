import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import FundRequest from "@/models/request";

export async function POST(req) {
  try {
    await connect();

    const { dept, requesterId, amount, purpose, priority, notes, year, quater } = await req.json();

    if (!dept || !requesterId || !amount || !purpose || !year || !quater) {
      return NextResponse.json(
        { message: "Department, requester, amount, purpose, year, and quarter are required." },
        { status: 400 }
      );
    }

    const fundRequest = await FundRequest.create({
      dept,
      requesterId,
      amount,
      purpose,
      priority: priority || "medium",
      notes,
      status: "draft",
      year,
      quater,
    });

    return NextResponse.json(
      {
        message: "Fund request created successfully",
        fundRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error while creating fund request: ", error);
    return NextResponse.json(
      { message: "Error while creating fund request" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const dept = searchParams.get("dept");
    const status = searchParams.get("status");
    const year = searchParams.get("year");
    const quater = searchParams.get("quater");

    let query = {};
    if (dept) query.dept = dept;
    if (status) query.status = status;
    if (year) query.year = parseInt(year);
    if (quater) query.quater = parseInt(quater);

    const fundRequests = await FundRequest.find(query)
      .populate("requesterId")
      .populate("approverId");

    return NextResponse.json({
      message: "Fund requests fetched successfully",
      fundRequests,
    });
  } catch (error) {
    console.log("Error while fetching fund requests: ", error);
    return NextResponse.json(
      { message: "Error while fetching fund requests" },
      { status: 500 }
    );
  }
}