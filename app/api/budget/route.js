import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import Budget from "@/models/budget";

export async function POST(req) {
  try {
    await connect();

    const { dept, budget, year, quater, comment } = await req.json();

    if (!dept || !budget || !year || !quater || !comment) {
      return NextResponse.json(
        { message: "Department, budget amount, year, quarter, and comment are required." },
        { status: 400 }
      );
    }

    // Check if budget already exists for this department, year and quarter
    const existingBudget = await Budget.findOne({ dept, year, quater });
    if (existingBudget) {
      return NextResponse.json(
        { message: "Budget already exists for this department, year and quarter." },
        { status: 400 }
      );
    }

    const newBudget = await Budget.create({
      dept,
      budget,
      year,
      quater,
      comment,
      status: "pending",
      remainingAmount: budget, // Initially, remaining amount equals total budget
    });

    return NextResponse.json(
      {
        message: "Budget created successfully",
        budget: newBudget,
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

    const { searchParams } = new URL(req.url);
    const dept = searchParams.get("dept");
    const year = searchParams.get("year");
    const quater = searchParams.get("quater");
    const status = searchParams.get("status");

    let query = {};
    if (dept) query.dept = dept;
    if (year) query.year = parseInt(year);
    if (quater) query.quater = parseInt(quater);
    if (status) query.status = status;

    const budgets = await Budget.find(query);

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