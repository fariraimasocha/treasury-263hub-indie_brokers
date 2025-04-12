import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import Budget from "@/models/budget";



// Create a new fund request
export async function POST(req) {
  try {
    await connect();

    const { dept, budget, year, quater, comment } = await req.json();

    await Budget.create({
      dept,
      budget,
      year,
      quater,
      comment,
    });

    return NextResponse.json(
      {
        message: "Budget created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error while creating budget: ", error);
    return NextResponse.json(
      { message: "Error while creating budget" },
      { status: 500 }
    );
  }
}
export async function GET(req) {
  try {
    await connect();

    const budgets = await Budget.find();

    return NextResponse.json({
      message: "Budgets fetched successfully",
      budgets,
    });
  } catch (error) {
    console.log("Error while fetching budgets: ", error);
    return NextResponse.json(
      { message: "Error while fetching budgets" },
      { status: 500 }
    );
  }
}
