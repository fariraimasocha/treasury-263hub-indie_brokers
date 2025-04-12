import { refreshModel } from "@/utils/modelUtils";
import mongoose from "mongoose";

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
      type: String,
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
    remainingAmount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Request = refreshModel("Request", budgetSchema);
export default Request;
