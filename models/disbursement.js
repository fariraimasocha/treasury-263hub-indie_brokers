import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";

const disbursementSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FundRequest",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    disbursedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    disbursedAt: {
      type: Date,
      default: Date.now,
    },
    transactionReference: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Disbursement = refreshModel("Disbursement", disbursementSchema);
export default Disbursement;