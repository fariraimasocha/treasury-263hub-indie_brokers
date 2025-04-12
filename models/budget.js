import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";

const budgetSchema = new mongoose.Schema(
  {
    dept: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    quater: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Budget = refreshModel("Budget", budgetSchema);
export default Budget;
